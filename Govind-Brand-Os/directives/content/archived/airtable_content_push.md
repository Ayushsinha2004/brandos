# Airtable Content Push Directive

> **Purpose**: Push generated LinkedIn posts to Airtable Content Pipeline with upsert logic.

---

## Goal

After generating a LinkedIn post (from YouTube transcript or other source), push the content to Airtable's **Content Pipeline** table with status set to "Drafting".

---

## Airtable Configuration

**Base**: LinkedIn Content Hub  
**Tables**: 
1. `Content Pipeline` - Main content tracking table
2. `Content Ideas` - Idea backlog (linked to Content Pipeline)

**Environment Variable**: `AIRTABLE_API_KEY` (stored in `.env`)

---

## Content Pipeline Field Mapping

| Field Name | Value to Push | Required |
|------------|---------------|----------|
| `Post Title` | Extract from hook or video title | ✅ Yes |
| `Status` | **"Drafting"** (always set to Drafting for new posts) | ✅ Yes |
| `YouTube Source URL` | Input YouTube URL (if provided) | ❌ Optional |
| `YouTube Transcript` | Summary of the transcript (key points, not full text) | ❌ Optional |
| `LinkedIn Post Draft` | Generated LinkedIn post content | ✅ Yes |
| `Final LinkedIn Post` | Leave empty (to be finalized later) | ❌ No |
| `Post Hook` | First 2 lines of the post (the hook) | ✅ Yes |
| `Content Type` | Single select: `Text`, `Carousel`, `Document`, `Image` | ✅ Yes |
| `CTA Type` | Single select: `DM Me`, `Comment Below`, `Like/Share`, `Visit Website` | ✅ Yes |
| `Scheduled Date` | Leave empty (user sets this) | ❌ No |
| `Published Date` | Leave empty (auto-populated when published) | ❌ No |
| `Attachments` | Upload any generated images/videos | ❌ Optional |

---

## Content Ideas Field Mapping

If the post originated from a Content Idea, update the **Content Ideas** table:

| Field Name | Value to Push | Required |
|------------|---------------|----------|
| `Status` | Change from "New" to **"In Progress"** or **"Converted"** | ✅ Yes |
| `Related Content Pipeline` | Link to the new Content Pipeline record | ✅ Yes |

---

## Upsert Logic

Use **upsert** to avoid duplicates:

```
Match on: YouTube Source URL
If exists: Update the existing record
If not exists: Create new record
```

---

## Execution Script

**Script**: `execution/content/push_to_airtable.py`

### Usage

```bash
python execution/content/push_to_airtable.py \
  --title "Post Title" \
  --draft "LinkedIn post content..." \
  --hook "First 2 lines of hook" \
  --transcript "YouTube transcript..." \
  --youtube-url "https://youtube.com/watch?v=..." \
  --content-type "Text" \
  --cta-type "DM Me"
```

### Required Arguments
- `--title`: Post title
- `--draft`: LinkedIn post draft content
- `--hook`: First 2 lines (the hook)

### Optional Arguments
- `--transcript`: YouTube transcript
- `--youtube-url`: Source YouTube URL (used for upsert matching)
- `--content-type`: Text, Carousel, Document, Image (default: Text)
- `--cta-type`: DM Me, Comment Below, Like/Share, Visit Website (default: Comment Below)

---

## Example API Payload

```json
{
  "records": [
    {
      "fields": {
        "Post Title": "How AI Can Automate Your Lead Generation",
        "Status": "Drafting",
        "YouTube Source URL": "https://youtube.com/watch?v=abc123",
        "YouTube Transcript": "[Full transcript text...]",
        "LinkedIn Post Draft": "[Generated LinkedIn post content...]",
        "Post Hook": "This FREE AI system generates 50K leads.\n(And you can build it in 10 minutes)",
        "Content Type": "Text",
        "CTA Type": "DM Me"
      }
    }
  ],
  "typecast": true
}
```

---

## Status Flow

```
Idea → Drafting → Review → Scheduled → Published → Archived
         ↑
    [New posts land here]
```

---

## Post-Push Workflow

1. **Review in Airtable** → Status: "Drafting"
2. **Finalize post** → Move content to "Final LinkedIn Post" field
3. **Ready for schedule** → Change Status to "Review"
4. **Approved** → Change Status to "Scheduled" + set date
5. **Posted** → Change Status to "Published" (auto-populates Published Date)

---

## Related Files

- `execution/content/push_to_airtable.py` - Python script for API calls
- `directives/content/linkedincontent/youtube_to_linkedin.md` - Post generation workflow
- `.env` - Contains `AIRTABLE_API_KEY`
