from typing import Dict, Any, List
from app.services.gemini_service import gemini_service

class ThemeAgent:
    """
    Theme and Decoration Agent:
    Generates culturally rich aesthetics, color palettes, stage concepts,
    entrance designs, lighting mood, and detailed image-generation prompts.
    """
    DEFAULT_THEMES = {
        "gujarati": {
            "theme_name": "Royal Gujarati Bandhani & Marigold Heritage",
            "palette": [
                {"name": "Kesariya Amber", "hex": "#FF9933"},
                {"name": "Sindoor Crimson", "hex": "#9B111E"},
                {"name": "Royal Gold", "hex": "#D4AF37"},
                {"name": "Emerald Patola Green", "hex": "#097969"},
                {"name": "Raw Silk Ivory", "hex": "#FFFFF0"}
            ],
            "entrance_concept": "Grand Toran arch adorned with fresh Genda phool (marigolds), brass diyas, and authentic Kutchi mirror-work fabric hangings.",
            "stage_mandap_concept": "Four-pillar carved wooden Rajwadi mandap covered in cascading marigolds, brass urli with floating rose petals and fragrant lotus blooms.",
            "lighting_mood": "Warm 2700K ambient fairy lights with brass floor lamps and subtle amber uplighting for traditional regality.",
            "table_decor": "Kansa (bronze) styled chargers, block-printed table runners, and mini terracotta tea-light lanterns.",
            "image_prompt": "A majestic outdoor Indian Gujarati wedding stage and floral mandap at sunset, adorned with rich marigold garlands, red and gold silk drapery, carved wooden columns, brass oil lamps, soft cinematic golden hour lighting, photorealistic 8k octane render."
        },
        "modern": {
            "theme_name": "Modern Celestial Violet & Champagne",
            "palette": [
                {"name": "Deep Midnight Indigo", "hex": "#1A1B4B"},
                {"name": "Electric Violet", "hex": "#7C3AED"},
                {"name": "Champagne Gold", "hex": "#F3E5AB"},
                {"name": "Muted Rose", "hex": "#D8A47F"},
                {"name": "Clean Pearl White", "hex": "#F9FAFB"}
            ],
            "entrance_concept": "Sleek geometric arches with acrylic accents, modern pampas grass, and cascading warm white Edison bulbs.",
            "stage_mandap_concept": "Minimalist open-frame arch structure with asymmetric white orchids, wisteria ceiling, and frosted glass stage.",
            "lighting_mood": "Smart dynamic ambient lighting with deep indigo washes and violet stage highlights.",
            "table_decor": "Floating glass candle cylinders, brushed gold cutlery, and subtle lavender floral centerpieces.",
            "image_prompt": "A luxury modern minimalist wedding reception stage, deep indigo and electric violet atmospheric lighting, acrylic podiums, champagne gold accents, white orchid floral arrangements, ultra-realistic architectural photography."
        }
    }

    async def generate_theme(self, event_type: str, preferred_theme: str, cultural_pref: str) -> Dict[str, Any]:
        # Attempt Gemini Generation for high personalization
        prompt = f"""
        Generate a comprehensive, culturally authentic theme for an event with the following parameters:
        - Event Type: {event_type}
        - Preferred Theme: {preferred_theme}
        - Cultural Context: {cultural_pref}

        Return a JSON object with keys:
        - theme_name (string)
        - theme_description (string)
        - palette (array of 5 objects with 'name' and 'hex')
        - entrance_concept (string)
        - stage_mandap_concept (string)
        - lighting_mood (string)
        - table_decor (string)
        - image_prompt (string suitable for an image generator)
        """
        gemini_result = await gemini_service.generate_json(prompt, system_instruction="You are a premier Indian event decor designer.")
        if gemini_result and "theme_name" in gemini_result:
            return gemini_result

        # Fallback to rich curated theme
        key = "gujarati" if ("gujarat" in cultural_pref.lower() or "gujarat" in preferred_theme.lower() or "wedding" in event_type.lower()) else "modern"
        theme = self.DEFAULT_THEMES[key].copy()
        theme["theme_description"] = f"A thoughtfully curated aesthetic celebrating {cultural_pref} traditions with modern elegance."
        return theme

theme_agent = ThemeAgent()

