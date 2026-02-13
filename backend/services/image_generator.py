"""Image Generation Service"""

from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import os
import json
import base64
from datetime import datetime

from openai import OpenAI

from models.post import Post, PostImage
from config import get_settings

settings = get_settings()


class ImageGeneratorService:
    """Service for generating LinkedIn post images"""

    def __init__(self, db: Session):
        self.db = db
        api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=api_key) if api_key else None
        self.images_dir = settings.images_dir
        os.makedirs(self.images_dir, exist_ok=True)

    def generate_prompts(self, post: Post) -> Dict[str, Any]:
        """Generate image prompt structure for a post"""

        # Extract metrics from content if available
        import re
        metrics = re.findall(r'\d+[%xX]|\$[\d,]+[KMBkmb]?|\d+[KMBkmb]', post.content)
        result_metrics = ", ".join(metrics[:3]) if metrics else "N/A"

        prompt_structure = {
            "post_context": {
                "post_reference": f"{post.number}.{post.slug}",
                "created_date": datetime.now().strftime("%Y-%m-%d"),
                "hook_text": post.hook[:100] if post.hook else "",
                "key_insight": self._extract_key_insight(post.content),
                "result_metrics": result_metrics,
                "key_topics": post.key_topics or []
            },
            "meta": {
                "platform": "LinkedIn",
                "aspect_ratio": "1:1",
                "dimensions": "1200x1200px"
            },
            "base_style": {
                "background": "pure white (#FFFFFF)",
                "max_colors": 3,
                "typography": "clean, modern sans-serif",
                "layout": "balanced composition with clear focal point"
            },
            "variations": [
                {
                    "style_name": "technical",
                    "visual_concept": self._get_technical_concept(post),
                    "prompt": self._build_technical_prompt(post)
                },
                {
                    "style_name": "apple",
                    "visual_concept": self._get_apple_concept(post),
                    "prompt": self._build_apple_prompt(post)
                },
                {
                    "style_name": "business_results",
                    "visual_concept": self._get_business_concept(post),
                    "prompt": self._build_business_prompt(post)
                }
            ]
        }

        return prompt_structure

    def _extract_key_insight(self, content: str) -> str:
        """Extract the key insight from post content"""
        sentences = content.split('.')
        # Return first substantial sentence as key insight
        for sentence in sentences[1:5]:  # Skip hook, look at next few
            if len(sentence.strip()) > 30:
                return sentence.strip()[:150]
        return content[:150]

    def _get_technical_concept(self, post: Post) -> str:
        """Generate technical style visual concept"""
        return f"Clean flowchart or system diagram representing: {post.title}"

    def _get_apple_concept(self, post: Post) -> str:
        """Generate Apple style visual concept"""
        return f"Minimal, premium typography highlighting: {post.hook[:50] if post.hook else post.title}"

    def _get_business_concept(self, post: Post) -> str:
        """Generate business results visual concept"""
        return f"Data-driven infographic showcasing key metrics from: {post.title}"

    def _build_technical_prompt(self, post: Post) -> str:
        """Build technical style image prompt"""
        return f"""Create a clean, technical-style LinkedIn image with PURE WHITE BACKGROUND (#FFFFFF).

Visual style: Engineering/IDE inspired
- Clean flowchart or system diagram
- Monospace typography for labels
- Deep blue accents (#1a365d)
- Dark text on white background
- Light grid lines or subtle patterns
- Professional, technical aesthetic

Content focus: {post.title}
Key insight: {self._extract_key_insight(post.content)}

Requirements:
- 1200x1200px square format
- Maximum 3 colors plus white
- Clear visual hierarchy
- No photos, only graphics and typography
- MUST have pure white background"""

    def _build_apple_prompt(self, post: Post) -> str:
        """Build Apple style image prompt"""
        return f"""Create an ultra-minimal, Apple-style LinkedIn image with PURE WHITE BACKGROUND (#FFFFFF).

Visual style: Apple Keynote presentation quality
- Single focal point with subtle shadows
- Near-black text (#1a1a1a)
- Space gray accents (#8e8e93)
- Generous whitespace
- Premium, refined aesthetic
- SF Pro or similar clean sans-serif typography

Content focus: "{post.hook[:80] if post.hook else post.title}"

Requirements:
- 1200x1200px square format
- Maximum 2-3 colors
- Extremely minimal design
- Bold, impactful typography
- MUST have pure white background"""

    def _build_business_prompt(self, post: Post) -> str:
        """Build business results style prompt"""
        import re
        metrics = re.findall(r'\d+[%xX]|\$[\d,]+[KMBkmb]?|\d+[KMBkmb]', post.content)

        return f"""Create a business results infographic LinkedIn image with PURE WHITE BACKGROUND (#FFFFFF).

Visual style: Data-driven, results-focused
- Metrics and numbers as hero elements
- Green (#22c55e) for success/growth
- Black (#000000) for emphasis
- Clean data visualization
- Before/After or comparison layout if applicable

Key metrics to highlight: {', '.join(metrics[:3]) if metrics else 'Key results'}
Content focus: {post.title}

Requirements:
- 1200x1200px square format
- Maximum 3 colors plus white
- Numbers should be large and prominent
- Professional infographic style
- MUST have pure white background"""

    def validate_prompts(self, prompts: Dict) -> Dict[str, Any]:
        """Validate image prompt structure"""
        errors = []
        warnings = []

        # Check required sections
        required_sections = ["post_context", "meta", "base_style", "variations"]
        for section in required_sections:
            if section not in prompts:
                errors.append(f"Missing required section: {section}")

        # Validate post_context
        if "post_context" in prompts:
            required_context = ["post_reference", "hook_text", "key_insight"]
            for field in required_context:
                if field not in prompts["post_context"]:
                    errors.append(f"Missing post_context field: {field}")

        # Validate base_style - CRITICAL: must have white background
        if "base_style" in prompts:
            bg = prompts["base_style"].get("background", "")
            if "white" not in bg.lower() and "#FFFFFF" not in bg.upper():
                errors.append("CRITICAL: base_style.background must be pure white (#FFFFFF)")

        # Validate variations
        if "variations" in prompts:
            if len(prompts["variations"]) != 3:
                errors.append("Must have exactly 3 style variations")

            expected_styles = {"technical", "apple", "business_results"}
            found_styles = {v.get("style_name") for v in prompts["variations"]}

            missing = expected_styles - found_styles
            if missing:
                errors.append(f"Missing style variations: {missing}")

            # Check each variation has white background in prompt
            for v in prompts["variations"]:
                prompt = v.get("prompt", "").lower()
                if "white background" not in prompt and "#ffffff" not in prompt.lower():
                    warnings.append(f"Style '{v.get('style_name')}' prompt should mention white background")

        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings
        }

    def get_prompts_for_styles(self, post: Post, styles: List[str]) -> Dict[str, str]:
        """Get image prompts for specific styles"""
        if not post.image_prompts:
            return {}

        prompts = {}
        for variation in post.image_prompts.get("variations", []):
            if variation["style_name"] in styles:
                prompts[variation["style_name"]] = variation["prompt"]

        return prompts

    async def generate_images(
        self,
        post: Post,
        styles: List[str]
    ) -> Dict[str, Dict]:
        """Generate images for specified styles"""
        if not self.client:
            return {style: {"success": False, "error": "OpenAI API key not configured"} for style in styles}

        results = {}

        prompts = self.get_prompts_for_styles(post, styles)

        for style, prompt in prompts.items():
            try:
                # Use DALL-E 3 for image generation
                response = self.client.images.generate(
                    model="dall-e-3",
                    prompt=prompt,
                    size="1024x1024",
                    quality="standard",
                    n=1,
                    response_format="b64_json"
                )

                # Save image
                image_data = base64.b64decode(response.data[0].b64_json)
                filename = f"{post.slug}_{style}.png"
                filepath = os.path.join(self.images_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(image_data)

                results[style] = {
                    "success": True,
                    "file_path": filepath,
                    "prompt": prompt
                }

            except Exception as e:
                results[style] = {
                    "success": False,
                    "error": str(e)
                }

        return results
