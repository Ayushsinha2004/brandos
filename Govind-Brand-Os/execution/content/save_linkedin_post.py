"""
Save LinkedIn Post to Local Archive

This script saves generated LinkedIn posts to the posts folder with proper
sequential numbering starting from 1.

Usage:
    python save_linkedin_post.py --title "Post Title" --draft "Content..." --hook "Hook..." [options]

Directive: directives/content/linkedincontent/1.transcript_to_linkedin.md
"""

import os
import sys
import argparse
import re
from datetime import datetime
from pathlib import Path

# Posts directory
POSTS_DIR = Path(__file__).parent.parent.parent / "directives" / "content" / "linkedincontent" / "posts"


def get_next_post_number() -> int:
    """
    Find the highest numbered post file and return the next number.
    
    Returns:
        Next sequential number (starting from 1 if no posts exist)
    """
    if not POSTS_DIR.exists():
        POSTS_DIR.mkdir(parents=True, exist_ok=True)
        return 1
    
    # Find all markdown files in the posts directory
    post_files = list(POSTS_DIR.glob("*.md"))
    
    if not post_files:
        return 1
    
    # Extract numbers from filenames
    numbers = []
    for file in post_files:
        # Match pattern: {number}.{anything}.md
        match = re.match(r'^(\d+)\.', file.name)
        if match:
            numbers.append(int(match.group(1)))
    
    # Return highest number + 1, or 1 if no numbered files found
    return max(numbers) + 1 if numbers else 1


def create_slug(title: str) -> str:
    """
    Convert post title to kebab-case slug.
    
    Args:
        title: Post title
        
    Returns:
        Kebab-case slug (lowercase with hyphens)
    """
    # Remove special characters and convert to lowercase
    slug = re.sub(r'[^\w\s-]', '', title.lower())
    # Replace spaces and underscores with hyphens
    slug = re.sub(r'[-\s]+', '-', slug)
    # Remove leading/trailing hyphens
    slug = slug.strip('-')
    
    # Limit to first 5 words
    words = slug.split('-')[:5]
    return '-'.join(words)


def save_post(
    title: str,
    draft: str,
    hook: str,
    source: str = "",
    status: str = "Drafting",
    content_type: str = "Text",
    cta_type: str = "Comment Below",
    target_audience: str = "",
    key_topics: str = ""
) -> Path:
    """
    Save a LinkedIn post to the posts folder with proper numbering.
    
    Args:
        title: Post title
        draft: Full LinkedIn post content
        hook: First 2 lines of the post
        source: Source of content (YouTube URL, Meeting, etc.)
        status: Post status (Drafting, Review, Published)
        content_type: Text, Carousel, Image, or Document
        cta_type: CTA type used in the post
        target_audience: Specific ICP segment if applicable
        key_topics: Tags/keywords for the post
        
    Returns:
        Path to the saved file
    """
    # Get next post number
    post_number = get_next_post_number()
    
    # Create filename slug
    slug = create_slug(title)
    filename = f"{post_number}.{slug}.md"
    filepath = POSTS_DIR / filename
    
    # Get current date
    created_date = datetime.now().strftime("%Y-%m-%d")
    
    # Build file content
    content = f"""# {title}

**Source**: {source if source else "N/A"}
**Created**: {created_date}
**Status**: {status}

---

## Hook
{hook}

---

## Full Post

{draft}

---

## Metadata
- **Content Type**: {content_type}
- **CTA Type**: {cta_type}
- **Target Audience**: {target_audience if target_audience else "General ICP"}
- **Key Topics**: {key_topics if key_topics else "N/A"}
"""
    
    # Write to file
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return filepath


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(
        description="Save LinkedIn post to local archive with proper numbering"
    )
    
    # Required arguments
    parser.add_argument("--title", required=True, help="Post title")
    parser.add_argument("--draft", required=True, help="Full LinkedIn post content")
    parser.add_argument("--hook", required=True, help="First 2 lines of the post (hook)")
    
    # Optional arguments
    parser.add_argument("--source", default="", help="Source of content (YouTube URL, Meeting, etc.)")
    parser.add_argument(
        "--status",
        default="Drafting",
        choices=["Drafting", "Review", "Published", "Archived"],
        help="Post status (default: Drafting)"
    )
    parser.add_argument(
        "--content-type",
        default="Text",
        choices=["Text", "Carousel", "Image", "Document"],
        help="Content type (default: Text)"
    )
    parser.add_argument(
        "--cta-type",
        default="Comment Below",
        choices=["Comment Below", "DM Me", "Like/Share", "Visit Website"],
        help="CTA type (default: Comment Below)"
    )
    parser.add_argument("--target-audience", default="", help="Specific ICP segment")
    parser.add_argument("--key-topics", default="", help="Tags/keywords (comma-separated)")
    
    args = parser.parse_args()
    
    try:
        filepath = save_post(
            title=args.title,
            draft=args.draft,
            hook=args.hook,
            source=args.source,
            status=args.status,
            content_type=args.content_type,
            cta_type=args.cta_type,
            target_audience=args.target_audience,
            key_topics=args.key_topics
        )
        
        print(f"\n✅ Successfully saved post!")
        print(f"📁 File: {filepath}")
        print(f"🔢 Post number: {filepath.stem.split('.')[0]}")
        
    except Exception as e:
        print(f"\n❌ Error saving post: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
