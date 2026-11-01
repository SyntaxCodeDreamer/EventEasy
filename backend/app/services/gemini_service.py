import os
import json
import logging
from typing import Dict, Any, Optional
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY or os.environ.get("GEMINI_API_KEY", "")
        self.is_configured = False
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.is_configured = True
                logger.info("[GeminiService] Successfully configured Google Gemini client.")
            except Exception as e:
                logger.error(f"[GeminiService] Configuration error: {e}")

    def _get_model(self, json_mode: bool = False):
        # Fallback list of modern model identifiers supported by Gemini API
        model_candidates = [
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-1.5-pro-latest",
            "gemini-pro"
        ]
        config = {"response_mime_type": "application/json"} if json_mode else None
        
        for name in model_candidates:
            try:
                if config:
                    return genai.GenerativeModel(model_name=name, generation_config=config)
                return genai.GenerativeModel(model_name=name)
            except Exception:
                continue
        # Default fallback
        return genai.GenerativeModel(model_name="gemini-1.5-flash-latest")

    async def generate_json(self, prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        
        full_prompt = f"{system_instruction}\n\nTask: {prompt}" if system_instruction else prompt
        
        # Try candidate models with fallback
        for model_name in ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content(full_prompt)
                if response and response.text:
                    return json.loads(response.text)
            except Exception as e:
                # If JSON mode isn't supported on older model name, try clean text parsing
                try:
                    raw_model = genai.GenerativeModel(model_name=model_name)
                    raw_res = raw_model.generate_content(f"{full_prompt}\nReturn ONLY a raw JSON object.")
                    if raw_res and raw_res.text:
                        clean_text = raw_res.text.strip()
                        if clean_text.startswith("```json"):
                            clean_text = clean_text[7:]
                        if clean_text.startswith("```"):
                            clean_text = clean_text[3:]
                        if clean_text.endswith("```"):
                            clean_text = clean_text[:-3]
                        return json.loads(clean_text.strip())
                except Exception:
                    continue
        logger.warning("[GeminiService] Live model call failed; falling back to deterministic agent synthesis.")
        return None

    async def generate_text(self, prompt: str, system_instruction: str = "") -> Optional[str]:
        if not self.is_configured:
            return None
            
        full_prompt = f"{system_instruction}\n\nTask: {prompt}" if system_instruction else prompt
        for model_name in ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"]:
            try:
                model = genai.GenerativeModel(model_name=model_name)
                response = model.generate_content(full_prompt)
                if response and response.text:
                    return response.text
            except Exception:
                continue
        return None

gemini_service = GeminiService()
