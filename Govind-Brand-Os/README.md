# Govind Brand OS

> An AI-first content creation and personal branding system using a 3-layer architecture for reliable, scalable content generation.

---

## 🚀 Quick Start

Getting started with Govind Brand OS requires setting up your **context profiles first**. This ensures all AI-generated content aligns with your brand voice, ICP, and business strategy.

### Step 1: Create Your Context Profiles

Before using any directives or creating content, you **MUST** generate your context profiles using the Context Profile Generator.

📂 **Reference**: [`archives/context-profile-generator-v1/system-instructions.md`](archives/context-profile-generator-v1/system-instructions.md)

This system creates 5 types of JSON context profiles:

| Profile Type | File | Purpose |
|--------------|------|---------|
| **Business Context** | `v1-business-context.json` | Strategy, positioning, unit economics, scaling context |
| **Brand Voice** | `v1-brand_voice.json` | Communication psychology & style for content creation |
| **Marketing Strategy** | `v1-marketing_strategy.json` | Funnels, customer journey, channel strategy |
| **Personal Story** | `v1-personal_story.json` | Founder journey, origin story, positioning narrative |
| **ICP Context** | `v1-icp_context.json` | Ideal customer psychology, behaviors, pain points |

**How to create profiles:**
1. Load all files from `archives/context-profile-generator-v1/` into your AI system
2. Follow the interactive Q&A process in `system-instructions.md`
3. Generated JSON files are saved to the `context/` folder

---

## 🏗️ System Architecture: The 3-Layer Framework

This system operates on a **3-layer architecture** that separates concerns for maximum reliability. LLMs are probabilistic; business logic is deterministic. This architecture bridges that gap.

### Layer 1: Directives (What to Do)
- **Location**: `directives/`
- **Format**: Markdown SOPs (Standard Operating Procedures)
- **Purpose**: Define goals, inputs, tools/scripts, outputs, and edge cases
- Natural language instructions—like giving directions to a mid-level employee

### Layer 2: Orchestration (Decision Making)
- **Actor**: The AI Agent (Claude, Gemini, or other AI systems)
- **Purpose**: Intelligent routing between directives and execution
- Read directives → call execution scripts in order → handle errors → update directives with learnings
- The "glue" between intent and execution

### Layer 3: Execution (Doing the Work)
- **Location**: `execution/`
- **Format**: Deterministic Python scripts
- **Purpose**: Handle API calls, data processing, file operations, database interactions
- Environment variables and API tokens stored in `.env`

> **Why this works**: If AI does everything itself, errors compound (90% accuracy per step = 59% success over 5 steps). By pushing complexity into deterministic code, the AI focuses only on decision-making.

---

## 📖 Agent Instructions

The AI behavior is defined in three mirrored files that load the same instructions regardless of which AI environment you use:

| File | AI System |
|------|-----------|
| [`GEMINI.md`](GEMINI.md) | Google Gemini |
| [`CLAUDE.md`](CLAUDE.md) | Anthropic Claude |
| [`AGENTS.md`](AGENTS.md) | Generic AI Agents |

These files contain:
- The 3-Layer Architecture explanation
- Operating principles (check tools first, self-anneal on errors, update directives)
- Context awareness rules (always load context files before content creation)
- File organization guidelines
- Self-annealing loop for continuous improvement

---

## 📝 LinkedIn Content Creation

The primary use case of this system is **LinkedIn content creation**. There are two main methods to generate LinkedIn posts:

### Method 1: Transcript to LinkedIn (`1.transcript_to_linkedin.md`)

📂 **Directive**: [`directives/content/linkedincontent/1.transcript_to_linkedin.md`](directives/content/linkedincontent/1.transcript_to_linkedin.md)

Transform any transcript (YouTube, Sales Call, Meeting, Podcast) into high-performing LinkedIn posts.

**Process:**
1. Provide a transcript as input
2. System extracts core value, insights, and proof points
3. Applies brand voice from context files
4. Structures content using LinkedIn-optimized patterns
5. Formats for maximum engagement
6. Saves to `directives/content/linkedincontent/posts/`

**Best for:**
- Repurposing YouTube videos
- Converting sales call insights into content
- Transforming meeting notes into thought leadership

---

### Method 2: Questions to LinkedIn (`2.Questions_to_linkedin.md`)

📂 **Directive**: [`directives/content/linkedincontent/2.Questions_to_linkedin.md`](directives/content/linkedincontent/2.Questions_to_linkedin.md)

An interactive Q&A-based approach where the AI asks targeted questions to extract content ideas from you.

**Question Categories:**
- **Experience & Story Mining**: Recent wins, mistakes, contrarian opinions
- **Framework & Methodology Mining**: Systems, unique approaches, strategic tools
- **Client & Case Study Mining**: Success stories, common problems solved
- **Trend & Opinion Mining**: Industry trends, advice for newcomers

**Post Templates Available:**
1. **Story-Based Post** – For mistakes, wins, personal realizations
2. **Framework Post** – For systems, processes, methodologies
3. **Contrarian Opinion Post** – For hot takes, challenging conventional wisdom
4. **Case Study Post** – For client results, testimonials

**Best for:**
- Creating original content from your expertise
- Mining your experiences for LinkedIn gold
- When you don't have existing content to repurpose

---

### Supporting LinkedIn Files

| File | Purpose |
|------|---------|
| [`linkedIn_post_writer.md`](directives/content/linkedincontent/linkedIn_post_writer.md) | Core ghostwriting prompt with voice/style guidelines |
| [`example_linkedIn.md`](directives/content/linkedincontent/example_linkedIn.md) | 8+ example posts for reference on hooks, formatting, CTAs |
| [`LinkedIn_image_creator.md`](directives/content/linkedincontent/LinkedIn_image_creator.md) | Generate 3 image styles (Technical, Apple, Business Results) for posts |
| [`govind_linkedIn_posts.md`](directives/content/linkedincontent/govind_linkedIn_posts.md) | Additional post examples and patterns |
| `posts/` | Folder where generated LinkedIn posts are saved |

---

## 📁 Directory Structure

```
Govind-Brand-Os/
├── context/                          # Brand context JSON files
│   ├── v1-brand_voice.json
│   ├── v1-business-context.json
│   ├── v1-icp_context.json
│   ├── v1-marketing_strategy.json
│   └── v1-personal_story.json
│
├── directives/                       # SOPs and instructions
│   └── content/
│       ├── linkedincontent/          # LinkedIn content creation
│       │   ├── 1.transcript_to_linkedin.md
│       │   ├── 2.Questions_to_linkedin.md
│       │   ├── linkedIn_post_writer.md
│       │   ├── example_linkedIn.md
│       │   ├── LinkedIn_image_creator.md
│       │   └── posts/                # Generated posts saved here
│       └── hook_mastery_sop.md       # Hook creation framework
│
├── execution/                        # Deterministic Python scripts
│   └── content/
│       ├── push_to_airtable.py       # Push posts to Airtable
│       ├── save_linkedin_post.py      # Save posts with proper numbering
│       └── verify_image_prompt.py     # Validate image generation prompts
│
├── archives/                         # Reference materials & generators
│   ├── context-profile-generator-v1/ # Context profile creation system
│   │   ├── system-instructions.md    # Main entry point
│   │   ├── Context-Profile-Theory-Framework.md
│   │   ├── Profile-Template-Library.md
│   │   ├── Question-Framework-Guide.md
│   │   └── README.md
│   └── Learnings/                    # Archived learnings
│
├── transcripts/                      # Store transcripts for content repurposing
│
├── .tmp/                             # Temporary/intermediate files
│
├── venv/                             # Python virtual environment
│
├── GEMINI.md                         # Agent instructions (Gemini)
├── CLAUDE.md                         # Agent instructions (Claude)
├── AGENTS.md                         # Agent instructions (Generic)
├── requirements.txt                  # Python dependencies
├── .env                              # Environment variables & API keys
└── .gitignore                        # Git ignore rules
```

---

## 🎯 Transcripts Folder

📂 **Location**: `transcripts/`

This folder is for storing raw transcripts that will be transformed into content:
- YouTube video transcripts
- Sales call recordings (transcribed)
- Meeting notes
- Podcast transcripts
- Any other raw content source

**Workflow:**
1. Save your transcript to `transcripts/`
2. Run the `1.transcript_to_linkedin.md` directive
3. AI processes and transforms into LinkedIn post
4. Output saved to `directives/content/linkedincontent/posts/`


---

## 🔄 Self-Annealing Loop

The system is designed to **improve itself** when errors occur:

1. **Error occurs** → Read error message and stack trace
2. **Fix the script** → Test again
3. **Update the directive** → Document learnings (API limits, edge cases)
4. **System is now stronger** → Won't make the same mistake twice

---

## 📚 Related Resources

- **Context Profile Generator**: `archives/context-profile-generator-v1/`
- **Hook Mastery Framework**: `directives/content/hook_mastery_sop.md`
- **Learnings Archive**: `archives/Learnings/`

---

## 🤝 Contributing

When creating new directives or execution scripts:
1. Organize into category-based subfolders within `directives/` and `execution/`
2. Mirror folder structure between directives and execution
3. Always use Python virtual environments
4. Update agent instruction files if adding new operating principles

---

*Built for AI-first personal branding and content creation.*
