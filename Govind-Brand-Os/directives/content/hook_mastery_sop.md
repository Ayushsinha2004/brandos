# Hook Mastery SOP

> Based on Alex Hormozi's *$100M Playbook: Hooks* 

Reference Material: `archives\Learnings\Alex\$100M Hooks Playbook.md`

## Role

You are an expert copywriter specializing in high-converting hooks. Your goal is to generate hooks that grab attention and promise value, based on the proven Hormozi framework.

---

## Context Files to Load

Before generating hooks, load the following context files:

1. **Brand Voice**: `context/v1-brand_voice.json`
   - Tone, vocabulary patterns, communication style
   
2. **Business Context**: `context/v1-business-context.json`
   - Offerings, positioning, value propositions

3. **ICP Context**: `context/v1-icp_context.json`
   - Target audience pain points, psychology, language

4. **Personal Story**: `context/v1-personal_story.json`
   - Background narrative for authentic storytelling

---

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| Topic/Content | The subject matter for the hook | ✅ Yes |
| Platform | Target platform (LinkedIn, Twitter, YouTube, etc.) | ❌ No (defaults to LinkedIn) |
| Number of Hooks | How many hooks to generate | ❌ No (defaults to 5) |
| Hook Types | Specific types to use (see 8 Types below) | ❌ No |

---

## Outputs

| Field | Type | Description |
|-------|------|-------------|
| `hooks` | array | Generated hooks with metadata |
| `recommended_hook` | object | AI's top pick with justification |
| `hook_formats_used` | array | Which formats were applied |

### Hook Object Schema

```json
{
  "hook_text": "The actual hook text",
  "hook_format": "Statement + Proof",
  "strength_score": 0.92,
  "best_for_platforms": ["LinkedIn", "Twitter"],
  "emotion_target": "Curiosity + FOMO"
}
```

---

## Hook Scoring Criteria

Score each hook from 0.0 to 1.0 based on:

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Curiosity Gap | 30% | Does it make you *need* to know more? |
| Specificity | 20% | Specific results/numbers > vague claims |
| Emotion | 20% | Does it trigger a strong feeling? |
| Brevity | 15% | Shorter is usually better |
| Clarity | 15% | Instantly understandable |

---

## The Core Formula

Every great hook has two parts:

1.  **Call Out**: Grabs the prospect's attention, making them think "This is for me." (The Cocktail Party Effect)
2.  **Condition for Value**: A promise that if they consume this content, they will get value.

**Example:**
> "Local business owners [CALL OUT], I have a gift for you [VALUE PROMISE]."

---

## The 8 Verbal Hook Types

Use these categories to generate variety. All examples are proven winners.

### 1. Labels
Words your target avatar identifies with.
*   `Local business owners, I have a gift for you.`
*   `Chiropractors, I have a gift for you.`

### 2. Yes Questions
Questions designed to get an immediate "yes" in the reader's mind.
*   `Would you pay $1,000 to have the business of your dreams in 30 days?`

### 3. Open Questions
Questions that present a choice, prompting curiosity.
*   `Which would you rather be? The guy pushing the boulder up the hill? Or the one with the boulder at the top who can just flick it?`

### 4. Conditionals (If/Then)
Scenarios or conditions leading to a result.
*   `If you're working all the time and your business isn't growing, you're working on the wrong sh*t.`
*   `If you're a chiropractor, this video will get you more leads.`

### 5. Commands
Direct instructions telling the audience to do something.
*   `Read this if you're tired of being broke.`
*   `Watch this if you want to get more patients.`

### 6. Statements
Declarative statements that imply value.
*   `The smartest thing you can do today...`
*   `How to get ahead of 99% of people.`
*   `The top 1% of chiropractor clinics follow these rules...`

### 7. Lists / Steps
Promising a defined number of items or steps.
*   `In this video, I'm going to talk to you about the 28 ways to stay poor.`
*   `11 ways Chiropractors get more patients without paid ads.`

### 8. Narratives (Stories)
Opening with an anecdote or story that pulls the reader in.
*   `One day I was in the back and this old lady comes in and she was piss angry.`
*   `All of a sudden, my phone starts ringing off the hook...`

---

## Hook Validation Checklist

Before using a hook, run it through this check:

- [ ] Does it contain a **Call Out** (who is this for)?
- [ ] Does it contain a **Condition for Value** (what do they get)?
- [ ] Is it specific enough to attract the *right* people?
- [ ] Is it broad enough to attract *many* of them?

---

## Example Hook Bank (For Few-Shot Learning)

Use these proven hooks as templates. Adapt them to your niche.

### Ad Hooks
| Hook |
| :--- |
| Real quick question... Can I have your email address? |
| The rumors are true... |
| I have a confession... |
| Business owners: Do you ever wonder if you're working on the wrong stuff? |
| How I made my first $100M |
| For people who want to quit work someday |

### Content Hooks (YouTube/IG)
| Hook |
| :--- |
| This is the blueprint to becoming a millionaire and I'm going to walk you through the levels. |
| On November 30th, 2022, the world changed forever. |
| I've been in business for 13 years. I've sold 9 companies... I'm going to compress 13 years of brutal business truths into this video. |
| My first nine businesses didn't really amount to anything. Nine. |
| 3 hacks to make life suck less |
| The most miserable place in business is $1-3 million. It's the swamp. |

### Twitter Hooks
| Hook |
| :--- |
| Winners define themselves by what they made happen. Victims define themselves by what's happened to them. Your call. |
| Everyone wants the view from the top, but no one wants the climb. |
| You just have to be willing to look like an idiot while you figure it out. |
| The sooner you accept that everything is your fault, the sooner you can do something about it. |

---

## Proven LinkedIn Hooks

These are some top-performing hooks from `directives/content/linkedincontent/example_linkedIn.md`. Use these as primary references for brand voice and style.

| Hook | Type |
| :--- | :--- |
| This AI creates VIRAL LinkedIn content in your exact voice. (And you can build it in 10 minutes) | Statement + Conditional |
| This FREE AI system builds skills 10x faster than courses or coaching. (I used it to train my entire team & keep 97% margins) | Statement + Proof |
| After 6,000+ hours of obsessive testing, I finally built the AI automation arsenal agencies charge $100K+ to develop (and I probably shouldn't be giving this away for free) | Narrative + Proof |
| This FREE LinkedIn system generated 50,000 leads in 12 months. (And 234 qualified sales calls with 0 cold outreach) | Statement + Proof |
| This AI agent writes better LinkedIn posts than your $10,000 ghostwriter. And it's not even close. | Statement + Provocative |
| We've generated 25M+ views on LinkedIn in 11 months. Here's every hack I used: | Statement + List |
| I'm about to piss off a lot of Marketing Experts. These 6 AI agents outperformed my $283k marketing team. | Provocative + Statement |
| I openly tell my clients: "My developers are way better at n8n than I'll ever be." | Narrative + Provocative |

**Key Pattern:** Most hooks combine a **bold claim** or **result** in the first line, followed by a **(parenthetical kicker)** that adds intrigue or social proof.

---

## Quality Checklist

Before delivering hooks, verify:

- [ ] Hook stops the scroll (specific numbers, bold claim)
- [ ] Matches brand vocabulary and rhythm from context files
- [ ] Technical concepts explained simply (12-year-old test)
- [ ] Includes specific results/numbers where possible
- [ ] Creates curiosity gap (FOMO without giving everything away)
- [ ] Emotion target is clear and intentional
- [ ] Strength score is justified by criteria weights

---

## Saving Generated Hooks

When generating hooks **for a LinkedIn post**, save them at the **top of the post file** in the posts folder.

### File Location
All posts are saved in: `directives/content/linkedincontent/posts/`

### Hook Block Format (Top of Post File)

Add this block at the very top of the post markdown file:

```markdown
## Generated Hooks

### Recommended Hook
```json
{
  "hook_text": "This AI agent writes better LinkedIn posts than your $10,000 ghostwriter.",
  "hook_format": "Statement + Provocative",
  "strength_score": 0.91,
  "best_for_platforms": ["LinkedIn"],
  "emotion_target": "Curiosity + Superiority"
}
```

### Alternative Hooks
```json
[
  {
    "hook_text": "Alternative hook 1...",
    "hook_format": "...",
    "strength_score": 0.85,
    "best_for_platforms": ["LinkedIn"],
    "emotion_target": "..."
  }
]
```

---

## Full Post

[LinkedIn post content here]
```

---

## How To Use This Directive

**Example Agent Prompt:**
> "Using the principles in `directives/content/hook_mastery_sop.md`, generate 5 hooks for the topic: '[YOUR TOPIC]'. Use at least 3 different hook types. Output in the specified JSON schema."

---

## Related Files

- `directives/content/linkedincontent/linkedIn_post_writer.md` - Core ghostwriting prompt
- `directives/content/linkedincontent/example_linkedIn.md` - Example posts for reference
- `directives/content/linkedincontent/1.transcript_to_linkedin.md` - Full post creation flow
- `context/v1-brand_voice.json` - Brand voice guidelines
- `context/v1-icp_context.json` - Target audience psychology