"""Startup Loader Service - Loads existing files into database on startup"""

import os
import re
import json
from sqlalchemy.orm import Session

from config import get_settings
from models.post import Post, PostImage
from models.context_profile import ContextProfile

settings = get_settings()


def load_context_profiles(db: Session) -> int:
    """Load all context profiles from JSON files"""
    loaded = 0

    profile_mapping = {
        "v1-brand_voice.json": ("Brand Voice", "brand_voice"),
        "v1-business-context.json": ("Business Context", "business_context"),
        "v1-icp_context.json": ("ICP Context", "icp_context"),
        "v1-marketing_strategy.json": ("Marketing Strategy", "marketing_strategy"),
        "v1-personal_story.json": ("Personal Story", "personal_story"),
    }

    context_dir = settings.context_dir

    if not os.path.exists(context_dir):
        print(f"Context directory not found: {context_dir}")
        return 0

    for filename, (name, profile_type) in profile_mapping.items():
        filepath = os.path.join(context_dir, filename)

        if not os.path.exists(filepath):
            print(f"Profile file not found: {filepath}")
            continue

        # Check if already loaded
        existing = db.query(ContextProfile).filter(
            ContextProfile.profile_type == profile_type,
            ContextProfile.version == "v1"
        ).first()

        if existing:
            continue

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                data = json.load(f)

            profile = ContextProfile(
                name=name,
                profile_type=profile_type,
                version="v1",
                description=f"Loaded from {filename}",
                data=data,
                is_active=1
            )
            db.add(profile)
            db.commit()
            loaded += 1
            print(f"Loaded profile: {name}")
        except Exception as e:
            print(f"Error loading {filename}: {e}")

    return loaded


def parse_post_markdown(filepath: str) -> dict:
    """Parse a post markdown file and extract content"""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    result = {
        "title": "",
        "source": "",
        "created_date": "",
        "status": "Drafting",
        "hook": "",
        "content": "",
        "content_type": None,
        "cta_type": None,
        "target_audience": None,
        "key_topics": [],
        "image_prompts": None
    }

    # Extract title (first # line)
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if title_match:
        result["title"] = title_match.group(1).strip()

    # Extract metadata from header
    source_match = re.search(r'\*\*Source\*\*:\s*(.+)', content)
    if source_match:
        result["source"] = source_match.group(1).strip()

    status_match = re.search(r'\*\*Status\*\*:\s*(.+)', content)
    if status_match:
        result["status"] = status_match.group(1).strip()

    # Try to extract hook from "## Hook" section
    hook_match = re.search(r'## Hook\s*\n(.*?)(?=\n---|\n##)', content, re.DOTALL)
    if hook_match:
        result["hook"] = hook_match.group(1).strip()

    # Try to extract hook from "## Generated Hooks" JSON
    if not result["hook"]:
        hook_json_match = re.search(r'"hook_text":\s*"([^"]+)"', content)
        if hook_json_match:
            result["hook"] = hook_json_match.group(1).strip()

    # Extract full post content - try multiple patterns
    # Pattern 1: ## Full Post until ## Metadata or end
    post_match = re.search(r'## Full Post\s*\n(.*?)(?=\n## Metadata|\n## Image Prompts|$)', content, re.DOTALL)
    if post_match:
        result["content"] = post_match.group(1).strip()

    # Pattern 2: Get everything after ## Hook section until metadata
    if not result["content"]:
        alt_match = re.search(r'## Hook\s*\n.*?\n---\s*\n(.*?)(?=\n## Metadata|$)', content, re.DOTALL)
        if alt_match:
            result["content"] = result["hook"] + "\n\n" + alt_match.group(1).strip()

    # Pattern 3: If no specific section, get all text content (skip JSON blocks)
    if not result["content"]:
        # Remove JSON code blocks
        text_content = re.sub(r'```json.*?```', '', content, flags=re.DOTALL)
        # Remove markdown headers
        text_content = re.sub(r'^##.*$', '', text_content, flags=re.MULTILINE)
        # Remove separator lines
        text_content = re.sub(r'^---$', '', text_content, flags=re.MULTILINE)
        # Clean up whitespace
        text_content = '\n'.join(line for line in text_content.split('\n') if line.strip())
        if len(text_content) > 100:
            result["content"] = text_content.strip()

    # Extract metadata section
    content_type_match = re.search(r'\*\*Content Type\*\*:\s*(.+)', content)
    if content_type_match:
        ct = content_type_match.group(1).strip()
        if ct in ["Story-Based", "Framework", "Contrarian Opinion", "Case Study", "Text"]:
            result["content_type"] = ct

    cta_match = re.search(r'\*\*CTA Type\*\*:\s*(.+)', content)
    if cta_match:
        result["cta_type"] = cta_match.group(1).strip()

    audience_match = re.search(r'\*\*Target Audience\*\*:\s*(.+)', content)
    if audience_match:
        result["target_audience"] = audience_match.group(1).strip()

    topics_match = re.search(r'\*\*Key Topics\*\*:\s*(.+)', content)
    if topics_match:
        topics = topics_match.group(1).strip()
        result["key_topics"] = [t.strip() for t in topics.split(",")]

    # Extract image prompts JSON (look for post_context which indicates image prompts)
    json_match = re.search(r'```json\s*\n(\{"post_context".*?\})\s*\n```', content, re.DOTALL)
    if json_match:
        try:
            result["image_prompts"] = json.loads(json_match.group(1))
        except json.JSONDecodeError:
            pass

    return result


def load_posts(db: Session) -> int:
    """Load all posts from markdown files"""
    loaded = 0
    posts_dir = settings.posts_dir

    if not os.path.exists(posts_dir):
        print(f"Posts directory not found: {posts_dir}")
        return 0

    for filename in os.listdir(posts_dir):
        if not filename.endswith(".md"):
            continue

        filepath = os.path.join(posts_dir, filename)

        # Parse filename for number and slug
        # Format: {number}.{slug}.md or {slug}.md
        parts = filename[:-3].split(".", 1)

        try:
            if len(parts) == 2 and parts[0].isdigit():
                number = int(parts[0])
                slug = parts[1]
            else:
                # No number prefix, generate one
                slug = filename[:-3]
                # Get next available number
                max_num = db.query(Post).order_by(Post.number.desc()).first()
                number = (max_num.number + 1) if max_num else 1
        except:
            continue

        # Check if already loaded
        existing = db.query(Post).filter(Post.slug == slug).first()
        if existing:
            continue

        try:
            parsed = parse_post_markdown(filepath)

            # Use filename-based title if not found
            if not parsed["title"]:
                parsed["title"] = slug.replace("-", " ").replace("_", " ").title()

            # Use hook as content if no separate content found
            if not parsed["content"] and parsed["hook"]:
                parsed["content"] = parsed["hook"]

            if not parsed["hook"] and not parsed["content"]:
                print(f"Skipping {filename}: no content found")
                continue

            post = Post(
                number=number,
                title=parsed["title"],
                slug=slug,
                hook=parsed["hook"] or parsed["content"][:200],
                content=parsed["content"] or parsed["hook"],
                source=parsed["source"] or "File Import",
                status=parsed["status"],
                content_type=parsed["content_type"],
                cta_type=parsed["cta_type"],
                target_audience=parsed["target_audience"],
                key_topics=parsed["key_topics"] if parsed["key_topics"] else None,
                image_prompts=parsed["image_prompts"]
            )

            db.add(post)
            db.commit()
            db.refresh(post)
            loaded += 1
            print(f"Loaded post: {number}. {parsed['title']}")

            # Load associated images
            load_post_images(db, post)

        except Exception as e:
            print(f"Error loading {filename}: {e}")
            db.rollback()

    return loaded


def load_post_images(db: Session, post: Post) -> int:
    """Load images for a post from the images directory"""
    loaded = 0
    images_dir = settings.images_dir

    if not os.path.exists(images_dir):
        return 0

    # Look for images matching the post slug
    for filename in os.listdir(images_dir):
        if not filename.endswith((".png", ".jpg", ".jpeg")):
            continue

        # Check if image belongs to this post
        # Format: {number}.{slug}_{style}.png or {slug}_{style}.png
        name_without_ext = os.path.splitext(filename)[0]

        # Check various naming patterns
        post_identifier = f"{post.number}.{post.slug}"

        if not (name_without_ext.startswith(post_identifier) or
                name_without_ext.startswith(post.slug)):
            continue

        # Extract style from filename
        style = "unknown"
        if "_technical" in name_without_ext:
            style = "technical"
        elif "_apple" in name_without_ext:
            style = "apple"
        elif "_business" in name_without_ext:
            style = "business_results"

        filepath = os.path.join(images_dir, filename)

        # Check if already loaded
        existing = db.query(PostImage).filter(
            PostImage.post_id == post.id,
            PostImage.style == style
        ).first()

        if existing:
            continue

        try:
            # Get prompt from image_prompts if available
            prompt = None
            if post.image_prompts and "variations" in post.image_prompts:
                for var in post.image_prompts["variations"]:
                    if var.get("style_name") == style:
                        prompt = var.get("prompt")
                        break

            image = PostImage(
                post_id=post.id,
                style=style,
                file_path=filepath,
                prompt=prompt
            )
            db.add(image)
            db.commit()
            loaded += 1
            print(f"  - Loaded image: {filename}")
        except Exception as e:
            print(f"Error loading image {filename}: {e}")
            db.rollback()

    return loaded


def load_all_existing_content(db: Session):
    """Load all existing content from files into database"""
    print("\n=== Loading existing content ===")

    profiles_loaded = load_context_profiles(db)
    print(f"Loaded {profiles_loaded} context profiles")

    posts_loaded = load_posts(db)
    print(f"Loaded {posts_loaded} posts")

    print("=== Content loading complete ===\n")
