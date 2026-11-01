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

    async def generate_json(self, prompt: str, system_instruction: str = "") -> Optional[Dict[str, Any]]:
        if not self.is_configured:
            return None
        
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-flash",
                generation_config={"response_mime_type": "application/json"}
            )
            full_prompt = f"{system_instruction}\n\nTask: {prompt}" if system_instruction else prompt
            response = model.generate_content(full_prompt)
            if response and response.text:
                return json.loads(response.text)
        except Exception as e:
            logger.error(f"[GeminiService] Gemini API call error: {e}")
            return None
        return None

    async def generate_text(self, prompt: str, system_instruction: str = "") -> Optional[str]:
        if not self.is_configured:
            return None
        try:
            model = genai.GenerativeModel(model_name="gemini-1.5-flash")
            full_prompt = f"{system_instruction}\n\nTask: {prompt}" if system_instruction else prompt
            response = model.generate_content(full_prompt)
            if response and response.text:
                return response.text
        except Exception as e:
            logger.error(f"[GeminiService] Gemini text call error: {e}")
            return None
        return None

gemini_service = GeminiService()

