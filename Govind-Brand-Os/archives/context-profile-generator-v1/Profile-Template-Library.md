# Profile Template Library

## Overview

This file contains all JSON profile templates for the Context Profile Generator. Each template is designed to activate specific knowledge databases in AI systems through rich, framework-driven context.

**Profile Types Available:**
1. Business Context Profile - Company operations, strategy, positioning
2. Brand Voice Profile - Communication psychology & style
3. Marketing Strategy Profile - Funnel psychology & customer journey
4. Personal Story Profile - Origin story & founder journey
5. ICP Context Profile - Ideal customer psychology & behavior

---

## 1. Business Context Profile

**Purpose**: Comprehensive overview of business operations, strategy, and positioning that enables AI to understand company context, constraints, and strategic direction.

**Framework**: Based on business model canvas, strategic positioning theory, organizational psychology, and Alex Hormozi's scaling principles.

**Use Cases**: Business strategy discussions, content creation, client communication, internal process optimization.

```json
{
  "profile_type": "business_context",
  "business_name": "",
  "founder_name": "",
  "website_url": "",
  "industry": "",
  "business_model": "",
  "core_offers": [],
  "offer_tiers": {
    "free": [],
    "low_ticket": [],
    "mid_ticket": [],
    "high_ticket": [],
    "custom": []
  },
  "revenue_streams": [],
  "target_markets": [],
  "customer_segments": [],
  "mission_statement": "",
  "vision_statement": "",
  "core_values": [],
  "unique_selling_proposition": "",
  "competitive_advantages": [],
  "competitors": [],
  "key_partnerships": [],
  "distribution_channels": [],
  "tech_stack": [],
  "team_structure": {
    "leadership": [],
    "marketing": [],
    "product": [],
    "sales": [],
    "support": [],
    "ops": []
  },
  "scaling_context": {
    "current_headcount": "",
    "annual_revenue_range": "",
    "primary_constraint": "",
    "constraint_type": "",
    "founder_role": "",
    "founder_time_allocation": {
      "leads": "",
      "sales": "",
      "delivery": "",
      "management": ""
    },
    "business_without_founder": ""
  },
  "unit_economics": {
    "customer_acquisition_cost": "",
    "lifetime_value": "",
    "ltv_cac_ratio": "",
    "payback_period": "",
    "monthly_churn_rate": "",
    "average_ticket": "",
    "gross_margin": ""
  },
  "acquisition_channels": {
    "primary_channel": "",
    "warm_outreach": "",
    "cold_outreach": "",
    "content": "",
    "paid_ads": "",
    "referrals": "",
    "rule_of_100_status": ""
  },
  "current_challenges": [],
  "key_metrics": [],
  "short_term_goals": [],
  "long_term_goals": [],
  "brand_assets": {
    "logo": "",
    "typography": "",
    "color_palette": "",
    "voice_guidelines": ""
  }
}
```

---

## 2. Brand Voice Profile

**Purpose**: Defines the psychological and strategic framework for communication that creates specific audience relationships and cognitive responses.

**Framework**: Based on persuasion psychology, communication theory, and brand relationship dynamics.

**Use Cases**: Content creation, copywriting, marketing materials, client communication, social media.

```json
{
  "profile_type": "brand_voice",
  "tone": [],
  "style_descriptors": [],
  "personality_traits": [],
  "formality_level": "",
  "language_rules": {
    "contractions": "",
    "jargon_level": "",
    "sentence_length": "",
    "use_of_questions": "",
    "paragraph_length": ""
  },
  "persuasion_techniques": [],
  "humor_style": "",
  "audience_relationship": "",
  "swearing_policy": "",
  "emoji_usage": "",
  "common_phrases": [],
  "phrases_to_avoid": [],
  "storytelling_elements": [],
  "call_to_action_style": "",
  "formatting_guidelines": {
    "headlines": "",
    "subheadings": "",
    "bullets": "",
    "emphasis": "",
    "line_spacing": ""
  },
  "reference_brands": []
}
```

---

## 3. Marketing Strategy Profile

**Purpose**: Comprehensive framework for marketing operations, funnel psychology, and customer journey optimization.

**Framework**: Based on marketing funnel theory, customer psychology, and conversion optimization principles.

**Use Cases**: Campaign planning, content strategy, funnel optimization, customer journey mapping.

```json
{
  "profile_type": "marketing_strategy",
  "positioning_statement": "",
  "core_offers": [],
  "customer_journeys": [],
  "funnels": [],
  "audience_segments": [],
  "lead_magnets": [],
  "email_sequences": {
    "welcome": [],
    "nurture": [],
    "sales": [],
    "retargeting": [],
    "newsletter": []
  },
  "traffic_channels": {
    "organic": [],
    "paid": [],
    "referral": [],
    "social": [],
    "search": []
  },
  "channel_objectives": [],
  "content_distribution": [],
  "advertising_strategies": [],
  "KPI_targets": [],
  "budget_allocation": {
    "ads": "",
    "content": "",
    "tech": "",
    "freelancers": "",
    "training": ""
  },
  "conversion_optimization_tactics": [],
  "upsell_downsell_flows": [],
  "retention_strategies": [],
  "referral_programs": [],
  "testing_frameworks": [],
  "campaign_calendar": []
}
```

---

## 4. Personal Story Profile

**Purpose**: Captures the founder's origin story, transformation journey, and positioning elements that create emotional connection and credibility with audiences.

**Framework**: Based on hero's journey narrative structure, positioning psychology, and authentic personal branding.

**Use Cases**: About pages, sales pages, keynote bios, podcast intros, case study narratives, founder-led content.

```json
{
  "profile_type": "personal_story",
  "origin_story": {
    "pivotal_moment": "",
    "transformation_catalyst": "",
    "before_state": "",
    "after_state": "",
    "rock_bottom_moment": "",
    "breakthrough_realization": ""
  },
  "founder_journey": {
    "key_failures": [],
    "breakthrough_moments": [],
    "lessons_learned": [],
    "skills_acquired": [],
    "mentors_influences": []
  },
  "positioning_elements": {
    "unique_perspective": "",
    "credibility_factors": [],
    "relatability_hooks": [],
    "contrarian_beliefs": [],
    "signature_methodology": ""
  },
  "emotional_drivers": {
    "core_motivation": "",
    "fear_to_overcome": "",
    "mission_statement": "",
    "legacy_vision": "",
    "who_you_serve_and_why": ""
  },
  "storytelling_assets": {
    "signature_stories": [],
    "proof_points": [],
    "transformation_examples": [],
    "memorable_quotes": []
  }
}
```

---

## 5. ICP Context Profile

**Purpose**: Deep psychological and behavioral mapping of the ideal customer to enable AI to understand their mindset, pain points, and decision-making patterns.

**Framework**: Based on psychographic profiling, buying behavior psychology, and trust-building dynamics.

**Use Cases**: Copy creation, objection handling, sales scripts, content targeting, offer positioning.

```json
{
  "profile_type": "icp_context",
  "demographics": {
    "industry": "",
    "company_size": "",
    "role_title": "",
    "experience_level": "",
    "geographic_focus": "",
    "income_revenue_range": ""
  },
  "psychographics": {
    "pains": [],
    "shames": [],
    "fears": [],
    "aspirations": [],
    "frustrations": [],
    "secret_desires": [],
    "identity_they_want": ""
  },
  "current_state": {
    "where_they_are_now": "",
    "what_they_have_tried": [],
    "why_previous_solutions_failed": [],
    "what_keeps_them_stuck": ""
  },
  "desired_state": {
    "dream_outcome": "",
    "success_metrics": [],
    "timeline_expectations": "",
    "what_success_looks_like": ""
  },
  "behavioral_patterns": {
    "buying_triggers": [],
    "research_habits": "",
    "decision_making_style": "",
    "objection_patterns": [],
    "risk_tolerance": "",
    "price_sensitivity": ""
  },
  "trust_signals": {
    "credibility_requirements": [],
    "proof_points_needed": [],
    "skepticism_triggers": [],
    "who_they_trust": [],
    "what_makes_them_say_yes": ""
  },
  "language_patterns": {
    "words_they_use": [],
    "words_that_resonate": [],
    "words_to_avoid": [],
    "common_objections_verbatim": []
  }
}
```

---

## Template Usage Guidelines

1. **Select the right profile type** based on your immediate need
2. **Fill fields with framework-driven descriptions**, not generic adjectives
3. **Include specific examples and context** where possible
4. **Leave fields empty if unknown** - partial profiles are still valuable
5. **Combine profiles** when needed (e.g., Business Context + ICP for sales content)