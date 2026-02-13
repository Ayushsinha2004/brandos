# LinkedIn Image Creator

> **Purpose**: Generate 3 minimalistic, white-background images in distinct styles for each LinkedIn post to maximize visual impact and engagement.

---

## Goal

When a new LinkedIn post is created in `directives/content/linkedincontent/posts/`, automatically generate 3 image variations:
1. **Technical Style** - Clean diagrams, code-like aesthetics, system architecture vibes
2. **Apple Style** - Ultra-minimal, premium, elegant typography with subtle shadows
3. **Business Results Style** - ROI-focused, metrics-driven, before/after comparisons

---

## Trigger

This directive is triggered:
- After a new post is saved to `directives/content/linkedincontent/posts/`
- When manually requested for an existing post
- When updating/iterating on post visuals

---

## Inputs

| Input | Description | Required |
|-------|-------------|----------|
| Post File | Path to the LinkedIn post `.md` file | ✅ Yes |
| Post Hook | First 2 lines of the post (visual headline) | ✅ Yes |
| Key Topics | Main themes/keywords from the post | ✅ Yes |
| Result Type | For Business style: ROI / Revenue / Savings / Time | ❌ No |

---

## Process Flow

### Step 1: Extract Post Information

From the LinkedIn post file, extract:
- **Hook text** - The attention-grabbing headline
- **Key insight** - The main takeaway or framework name
- **Result metrics** - Any numbers, percentages, or outcomes mentioned
- **Key topics** - Tags and themes for visual direction

---

### Step 2: Generate JSON Prompt Structure (Nano Banana Format)

Before generating images, create a **structured JSON prompt** for each style using this enhanced schema. The schema is designed to understand the post context and enforce minimalistic white backgrounds.

#### Master JSON Prompt Template

```json
{
  "post_context": {
    "post_reference": "{post_file_path}",
    "created_date": "{YYYY-MM-DD}",
    "hook_text": "{extracted hook from post}",
    "key_insight": "{main takeaway or framework}",
    "result_metrics": "{numbers, percentages, outcomes}",
    "key_topics": ["{topic1}", "{topic2}", "{topic3}"]
  },
  "meta": {
    "platform": "LinkedIn",
    "aspect_ratio": "1:1",
    "dimensions": "1200x1200px",
    "model_version": "Nano Banana Pro"
  },
  "base_style": {
    "background": "pure white (#FFFFFF)",
    "background_cleanliness": "Maximum (no distractions, no patterns)",
    "aesthetic": "minimalistic, clean, professional",
    "spacing": "generous whitespace, balanced composition"
  },
  "variations": [
    {
      "style_name": "technical",
      "style_id": 1,
      "subject": {
        "main_element": "{flowchart/diagram/system visual}",
        "action_pose": "Static, informational",
        "styling": "Technical/Engineering"
      },
      "visual_style": {
        "art_direction": "Flat Illustration",
        "material_finish": "Clean vector, matte",
        "color_palette": ["#FFFFFF (background)", "#1E3A5F (deep blue accent)", "#1F2937 (dark text)", "#E5E7EB (subtle lines)"]
      },
      "environment": {
        "setting": "Pure white void",
        "lighting": "Flat, even, no shadows",
        "background_cleanliness": "Maximum"
      },
      "text_integration": {
        "enabled": true,
        "content": "{headline from hook}",
        "typography_style": "Bold sans-serif, dark gray"
      },
      "technical_specs": {
        "depth_of_field": "None (flat)",
        "camera_angle": "Straight-on or Isometric",
        "render_quality": "High contrast, vector clean"
      },
      "prompt": "{auto-generated from above fields}"
    },
    {
      "style_name": "apple",
      "style_id": 2,
      "subject": {
        "main_element": "{single hero number/icon/symbol}",
        "action_pose": "Centered, prominent",
        "styling": "Premium/Minimal"
      },
      "visual_style": {
        "art_direction": "Apple Keynote Style",
        "material_finish": "Subtle shadow, premium feel",
        "color_palette": ["#FFFFFF (background)", "#1D1D1F (near-black text)", "#86868B (space gray subtext)", "#F5F5F7 (soft shadow)"]
      },
      "environment": {
        "setting": "Pure white void",
        "lighting": "Soft, diffused, subtle depth",
        "background_cleanliness": "Maximum"
      },
      "text_integration": {
        "enabled": true,
        "content": "{key metric + subheadline}",
        "typography_style": "SF Pro style, bold hero text with gray subtext"
      },
      "technical_specs": {
        "depth_of_field": "Subtle (very shallow)",
        "camera_angle": "Eye-level, centered",
        "render_quality": "Keynote presentation quality"
      },
      "prompt": "{auto-generated from above fields}"
    },
    {
      "style_name": "business_results",
      "style_id": 3,
      "subject": {
        "main_element": "{hero metric/comparison/before-after}",
        "action_pose": "Data visualization focus",
        "styling": "Business/Corporate"
      },
      "visual_style": {
        "art_direction": "Infographic Style",
        "material_finish": "Clean, flat, high contrast",
        "color_palette": ["#FFFFFF (background)", "#059669 (success green)", "#DC2626 (negative red)", "#000000 (bold text)", "#6B7280 (secondary gray)"]
      },
      "environment": {
        "setting": "Pure white void",
        "lighting": "Flat, even lighting",
        "background_cleanliness": "Maximum"
      },
      "text_integration": {
        "enabled": true,
        "content": "{large metric + comparison labels}",
        "typography_style": "Bold sans-serif numbers, clean labels"
      },
      "technical_specs": {
        "depth_of_field": "None (flat infographic)",
        "camera_angle": "Straight-on",
        "render_quality": "Crisp, high-impact"
      },
      "result_type": "{ROI | Revenue | Savings | Time}",
      "prompt": "{auto-generated from above fields}"
    }
  ]
}
```

#### How to Use This Schema

1. **Read the post** → Extract `post_context` fields
2. **Fill each variation** → Populate `subject`, `text_integration` based on post content
3. **Generate prompt string** → Combine all fields into a natural language prompt
4. **Maintain white background** → NEVER change `background` or `background_cleanliness` values

---

### Step 3: Define Style Specifications

#### Style 1: Technical

**Visual Language:**
- Clean flowcharts and system diagrams
- Monospace or code-style typography accents
- Subtle grid or dot patterns
- Icons representing: AI, automation, systems, data flow
- Terminal/IDE aesthetic elements

**Color Palette:**
- Primary: White background (#FFFFFF)
- Accent: Deep blue (#1E3A5F) or Teal (#0D9488)
- Text: Dark gray (#1F2937)
- Subtle: Light gray lines (#E5E7EB)

**Visual Elements to Include:**
- `→` flow arrows
- `[ ]` box connectors
- `{ }` code brackets
- Minimal icons (gear, chip, flow)
- Clean lines connecting concepts

**Prompt Formula:**
```
Minimalistic technical diagram on pure white background, showing [CONCEPT] as a clean flowchart. 
Modern sans-serif typography, [ACCENT_COLOR] accent lines, subtle grid pattern. 
Professional LinkedIn post image, 1200x1200px, high contrast, no gradients, 
clean vector style, generous whitespace. [KEY_TEXT] as bold headline.
```

---

#### Style 2: Apple

**Visual Language:**
- Ultra-clean, premium aesthetic
- Single focal point with dramatic simplicity
- Subtle shadows and depth (no harsh lines)
- Elegant typography hierarchy
- Inspired by Apple keynote slides

**Color Palette:**
- Primary: Pure white background (#FFFFFF)
- Text: Near-black (#1D1D1F)
- Accent: Space gray (#86868B) or subtle blue (#0071E3)
- Shadow: Soft gray (#F5F5F7)

**Visual Elements to Include:**
- One hero element (icon, symbol, or number)
- Premium typography (SF Pro style)
- Subtle drop shadows
- Centered composition
- Negative space as design element

**Prompt Formula:**
```
Apple-style minimalist design on pure white background. Single hero element: [CONCEPT]. 
Ultra-clean typography, subtle shadow, premium aesthetic. 
San Francisco Pro style font, [HEADLINE] as main text.
Keynote presentation quality, 1200x1200px, elegant simplicity, 
centered composition, professional corporate aesthetic.
```

---

#### Style 3: Business Results

**Visual Language:**
- Metrics and numbers as hero elements
- Before/After comparisons
- Upward trends and growth indicators
- ROI, revenue, savings, time visualization
- Data-driven but not cluttered

**Result Type Options:**
| Type | Visual Focus | Example |
|------|--------------|---------|
| ROI | Percentage return, multiplier | "10x ROI", "340% increase" |
| Revenue | Dollar amount, growth | "$50K → $200K" |
| Savings | Cost reduction, efficiency | "Save $10K/month" |
| Time | Hours saved, speed | "10 hours → 10 minutes" |

**Color Palette:**
- Primary: Pure white background (#FFFFFF)
- Success/Growth: Green (#059669) or Blue (#2563EB)
- Emphasis: Bold black (#000000)
- Secondary: Gray (#6B7280)

**Visual Elements to Include:**
- Large numbers/percentages
- `↑` growth arrows
- Before → After layout
- Simple bar or progress indicators
- Checkmarks for achievements

**Prompt Formula:**
```
Business results infographic on pure white background. Hero metric: [NUMBER/RESULT].
Clean data visualization showing [RESULT_TYPE]. Modern sans-serif typography,
[ACCENT_COLOR] for positive metrics, minimalist design.
Professional LinkedIn post, 1200x1200px, high-impact numbers,
clear visual hierarchy, corporate clean aesthetic.
```

---

### Step 4: Generate Image Prompts

For each style, construct the specific prompt by:

1. **Analyze the post hook** - Extract the key claim or result
2. **Identify the core concept** - What is being taught/shown
3. **Extract any numbers** - Metrics, percentages, timeframes
4. **Map to style elements** - Choose appropriate visual elements
5. **Build the prompt** - Use the formula templates above

#### Prompt Construction Checklist

- [ ] Starts with "Minimalistic" or style descriptor
- [ ] Specifies "pure white background"
- [ ] Includes the key text/headline
- [ ] Defines color accents
- [ ] Specifies dimensions (1200x1200px for LinkedIn)
- [ ] Mentions "professional LinkedIn post image"
- [ ] Avoids: gradients, complex patterns, busy designs
- [ ] Includes: clean, minimal, professional, high contrast

---

### Step 5: Append JSON Prompts to Post File

Instead of creating a separate JSON file, **append the JSON prompts directly to the end of the post's markdown file**.

**Format to Append:**

```markdown
---

## Image Prompts & Assets

```json
{
  "post_reference": "{filename}",
  "created_date": "{date}",
  "variations": [
    ... (full json content) ...
  ]
}
```
```

---

### Step 6: Generate & Embed Images

1. **Generate Images** using the `generate_image` tool.
2. **Save Images** to: `directives/content/linkedincontent/posts/images/{post_number}.{slug}_{style}.png`
3. **Embed Images** into the post file **immediately below** the JSON block.

**Format to Append (below JSON):**

```markdown
### Visual Executions

**1. Technical Style**
![Technical Style](images/{post_number}.{slug}_technical.png)

**2. Apple Style**
![Apple Style](images/{post_number}.{slug}_apple.png)

**3. Business Results Style**
![Business Results](images/{post_number}.{slug}_business.png)
```

---

### Step 7: Quality Verification

After generation, verify each image:

- [ ] Background is pure white (no off-white or gray)
- [ ] Text is visible and readable
- [ ] Images are properly embedded and visible in the markdown file
- [ ] JSON is valid and preserves the prompt history

---

## Output Requirements

| Requirement | Specification |
|-------------|---------------|
| Image Size | 1200x1200px (square for LinkedIn) |
| Background | Pure white (#FFFFFF) |
| File Format | PNG (high quality) |
| Prompts | JSON block appended to post `.md` file |
| Display | Images embedded below prompts in `.md` file |

---

## Example Transformation

### Input: Post Hook
```
This FREE AI system builds skills 10x faster than courses or coaching.
```

### Updated Post File Structure

```markdown
# [Post Title]
... (Post Content) ...

---

## Metadata
...

---

## Image Prompts & Assets

```json
{
  "variations": [
    {
      "style_name": "technical",
      "prompt": "Minimalistic technical diagram..."
    },
    ...
  ]
}
```

### Visual Executions

**1. Technical Style**
![Technical Style](images/1.example_technical.png)

**2. Apple Style**
![Apple Style](images/1.example_apple.png)

**3. Business Results Style**
![Business Results](images/1.example_business.png)
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Re-running generation | Overwrite the JSON block and Image section if they already exist |
| Image generation fails | Keep JSON prompt, add "Generation Failed" note instead of image |

---

## Execution Tools

| Tool | Purpose |
|------|---------|
| `generate_linkedin_images.py` | Generate images from prompts using OpenAI GPT Image API |
| `replace_file_content` | Append JSON and image links to the post file |
| `verify_image_prompt.py` | **Verify** JSON prompt structure before image generation |

### Image Generation Script Usage

**After appending the JSON prompt and running verification**, generate the images:

```bash
# Generate all 3 style variations
python execution/content/generate_linkedin_images.py --post "1.ai-skill-building-system.md"

# Generate a specific style only
python execution/content/generate_linkedin_images.py --post "1.ai-skill-building-system.md" --style technical

# Preview prompts without generating (dry run)
python execution/content/generate_linkedin_images.py --post "1.ai-skill-building-system.md" --dry-run

# Verify + Generate in one command
python execution/content/generate_linkedin_images.py --post "1.ai-skill-building-system.md" --verify
```

**The script:**
- Uses OpenAI's Responses API with `image_generation` tool
- Generates 1024x1024 high-quality images (scaled to 1200x1200 for LinkedIn)
- Saves images to `posts/images/{post_slug}_{style}.png`
- Supports dry-run mode to preview prompts
- Can optionally run verification before generation

### Verification Script Usage

**After appending the JSON prompt to the post file**, run the verification script to ensure the structure is valid:

```bash
python execution/content/verify_image_prompt.py --post "1.ai-skill-building-system.md"
```

**The script validates:**
- `post_context` - All required fields present
- `meta` - Platform, aspect ratio, dimensions correct
- `base_style` - **White background enforced**
- `variations` - All 3 styles present with valid prompts

**If validation fails:**
- The script will retry up to 3 times (configurable with `--retries`)
- Fix the errors and run again until it passes
- **DO NOT proceed to image generation until verification passes**

---

## Folder Structure

```
directives/content/linkedincontent/posts/
├── 1.ai-skill-building-system.md  <-- Contains Post + JSON Prompts + Image Links
└── images/
    ├── 1.ai-skill-building-system_technical.png
    ├── 1.ai-skill-building-system_apple.png
    └── 1.ai-skill-building-system_business.png
```

---

## Related Files

- `directives/content/linkedincontent/1.transcript_to_linkedin.md` - Post creation from transcripts
- `directives/content/linkedincontent/2.Questions_to_linkedin.md` - Post creation from Q&A
- `execution/content/save_linkedin_post.py` - Saves posts (triggers this flow)
- `context/v1-brand_voice.json` - Brand guidelines for visual consistency

---

## Quick Reference: Prompt Keywords

### Always Include:
- "minimalistic" / "minimal"
- "pure white background"
- "professional LinkedIn post"
- "1200x1200px"
- "clean" / "modern"
- "sans-serif typography"

### Always Avoid:
- "gradient"
- "busy"
- "colorful"
- "complex pattern"
- "3D rendering"
- "photorealistic"

---
