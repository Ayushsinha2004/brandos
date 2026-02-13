"""Content Generation Service"""

from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional, Dict, Any
import os
import json
import re
from datetime import datetime

from openai import OpenAI

from models.post import Post
from models.context_profile import ContextProfile


class ContentGeneratorService:
    """Service for generating LinkedIn content"""

    def __init__(self, db: Session):
        self.db = db
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.context = self._load_context()

    def _load_context(self) -> Dict[str, Any]:
        """Load all active context profiles"""
        profiles = self.db.query(ContextProfile).filter(
            ContextProfile.is_active == 1
        ).all()

        context = {}
        for profile in profiles:
            context[profile.profile_type] = profile.data

        return context

    def _get_system_prompt(self) -> str:
        """Build the system prompt with brand context"""
        brand_voice = self.context.get("brand_voice", {})
        business = self.context.get("business_context", {})
        icp = self.context.get("icp_context", {})

        return f"""You are a LinkedIn ghostwriter for {business.get('founder_name', 'a business founder')},
founder of {business.get('company_name', 'a company')} in the {business.get('industry', 'business')} space.

## Brand Voice
- Tone: {', '.join(brand_voice.get('tone_descriptors', ['professional', 'direct']))}
- Personality: {', '.join(brand_voice.get('personality_traits', ['knowledgeable'])[:3])}
- Common Phrases: {', '.join(brand_voice.get('common_phrases', [])[:5])}
- Phrases to Avoid: {', '.join(brand_voice.get('phrases_to_avoid', [])[:5])}
- Reference Brands: {', '.join(brand_voice.get('reference_brands', [])[:3])}

## Writing Style Rules
{json.dumps(brand_voice.get('language_rules', {}), indent=2)}

## Target Audience
{icp.get('primary_icp', {}).get('description', 'Business professionals')}

## Key Pain Points to Address
{json.dumps(icp.get('pain_points', [])[:5], indent=2)}

## Content Guidelines
1. Hook must stop the scroll - use pattern interrupts
2. Write in first person, conversational tone
3. Use short paragraphs (1-2 sentences each)
4. Include specific numbers and results where possible
5. End with a clear call to action
6. Target word count: 550-600 words
7. Use line breaks for readability
8. No hashtags in the main content
9. No emojis unless absolutely necessary
"""

    async def generate_from_transcript(
        self,
        transcript: str,
        source_type: Optional[str] = None,
        source_url: Optional[str] = None,
        preferred_post_type: Optional[str] = None,
        target_word_count: int = 550
    ) -> Dict[str, Any]:
        """Generate a LinkedIn post from a transcript"""

        user_prompt = f"""Transform this transcript into a compelling LinkedIn post.

TRANSCRIPT:
{transcript[:8000]}  # Limit transcript length

SOURCE TYPE: {source_type or 'Unknown'}
PREFERRED POST TYPE: {preferred_post_type or 'Auto-detect based on content'}
TARGET WORD COUNT: {target_word_count}

Extract the core value from this transcript and create a post that:
1. Opens with a scroll-stopping hook
2. Shares the key insight in an engaging narrative
3. Provides actionable value
4. Ends with a thought-provoking question or CTA

Return your response in this exact JSON format:
{{
    "title": "Short title for the post (5-7 words)",
    "hook": "The opening hook (1-2 sentences)",
    "content": "The full post content including hook",
    "post_type": "Story-Based|Framework|Contrarian Opinion|Case Study",
    "key_insights": ["insight1", "insight2", "insight3"],
    "suggested_hooks": ["alternative hook 1", "alternative hook 2"]
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )

            result = json.loads(response.choices[0].message.content)

            return {
                "success": True,
                "title": result.get("title", "Untitled Post"),
                "hook": result.get("hook", ""),
                "content": result.get("content", ""),
                "post_type": result.get("post_type", "Insight"),
                "word_count": len(result.get("content", "").split()),
                "key_insights": result.get("key_insights", []),
                "suggested_hooks": result.get("suggested_hooks", []),
                "source": f"Transcript ({source_type})" if source_type else "Transcript"
            }

        except Exception as e:
            return {
                "success": False,
                "title": "",
                "hook": "",
                "content": "",
                "post_type": "",
                "word_count": 0,
                "message": str(e)
            }

    async def generate_from_questions(
        self,
        answers: List[Dict],
        preferred_post_type: Optional[str] = None,
        target_word_count: int = 550
    ) -> Dict[str, Any]:
        """Generate a LinkedIn post from Q&A responses"""

        # Format answers for the prompt
        answers_text = "\n\n".join([
            f"**{a.get('category', 'General')} - Q: {a.get('question', '')}**\nA: {a.get('answer', '')}"
            for a in answers
        ])

        user_prompt = f"""Based on these Q&A responses, create a compelling LinkedIn post.

Q&A RESPONSES:
{answers_text}

PREFERRED POST TYPE: {preferred_post_type or 'Auto-detect based on answers'}
TARGET WORD COUNT: {target_word_count}

Analyze the answers to identify the strongest story, insight, or framework, then create a post that:
1. Opens with a scroll-stopping hook
2. Develops the core idea with specific details from the answers
3. Provides actionable value
4. Ends with engagement-driving CTA

Return your response in this exact JSON format:
{{
    "title": "Short title for the post (5-7 words)",
    "hook": "The opening hook (1-2 sentences)",
    "content": "The full post content including hook",
    "post_type": "Story-Based|Framework|Contrarian Opinion|Case Study",
    "key_insights": ["insight1", "insight2", "insight3"],
    "suggested_hooks": ["alternative hook 1", "alternative hook 2"],
    "source_questions": ["q1", "q2"]
}}
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": self._get_system_prompt()},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7
            )

            result = json.loads(response.choices[0].message.content)

            return {
                "success": True,
                "title": result.get("title", "Untitled Post"),
                "hook": result.get("hook", ""),
                "content": result.get("content", ""),
                "post_type": result.get("post_type", "Insight"),
                "word_count": len(result.get("content", "").split()),
                "key_insights": result.get("key_insights", []),
                "suggested_hooks": result.get("suggested_hooks", []),
                "source": "Q&A Generation"
            }

        except Exception as e:
            return {
                "success": False,
                "title": "",
                "hook": "",
                "content": "",
                "post_type": "",
                "word_count": 0,
                "message": str(e)
            }

    async def generate_hooks(
        self,
        topic: str,
        key_insight: str,
        target_audience: Optional[str] = None,
        num_hooks: int = 5
    ) -> List[Dict]:
        """Generate scored hook suggestions"""

        brand_voice = self.context.get("brand_voice", {})

        prompt = f"""Generate {num_hooks} LinkedIn post hooks for this topic.

TOPIC: {topic}
KEY INSIGHT: {key_insight}
TARGET AUDIENCE: {target_audience or 'Business professionals'}

BRAND VOICE:
- Tone: {', '.join(brand_voice.get('tone_descriptors', [])[:3])}
- Style: Direct, pattern-interrupting, specific

HOOK SCORING CRITERIA:
- Curiosity Gap (30%): Does it create an open loop?
- Specificity (20%): Does it include specific details/numbers?
- Emotion (20%): Does it trigger an emotional response?
- Brevity (15%): Is it concise (under 15 words ideal)?
- Clarity (15%): Is the value proposition clear?

Generate hooks in these styles:
1. Question hook
2. Contrarian hook
3. Story hook
4. Number/statistic hook
5. "Most people" hook

Return as JSON array:
[
    {{
        "hook": "The hook text",
        "hook_type": "Question|Contrarian|Story|Number|Most People",
        "score": 85,
        "curiosity_gap": 25,
        "specificity": 18,
        "emotion": 15,
        "brevity": 14,
        "clarity": 13
    }}
]
"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "system", "content": "You are an expert LinkedIn content strategist specializing in hooks that stop the scroll."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.8
            )

            result = json.loads(response.choices[0].message.content)

            # Handle different response formats
            if isinstance(result, dict) and "hooks" in result:
                return result["hooks"]
            elif isinstance(result, list):
                return result
            else:
                return []

        except Exception as e:
            return []

    def save_generated_post(self, result: Dict) -> Post:
        """Save a generated post to the database"""

        # Get next post number
        last_post = self.db.query(Post).order_by(desc(Post.number)).first()
        number = (last_post.number + 1) if last_post else 1

        # Generate slug
        slug = re.sub(r'[^\w\s-]', '', result["title"].lower())
        slug = re.sub(r'[-\s]+', '-', slug).strip('-')

        post = Post(
            number=number,
            title=result["title"],
            slug=slug,
            hook=result["hook"],
            content=result["content"],
            source=result.get("source", "AI Generated"),
            status="Drafting",
            content_type=result.get("post_type"),
            key_topics=result.get("key_insights", [])
        )

        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)

        return post
