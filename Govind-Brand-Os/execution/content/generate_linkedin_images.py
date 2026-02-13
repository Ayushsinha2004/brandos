"""
Generate LinkedIn Post Images using OpenAI GPT Image API

This script generates images for LinkedIn posts using OpenAI's Responses API
with the image_generation tool. It reads the JSON prompts from a post file
and generates all 3 style variations.

Usage:
    python generate_linkedin_images.py --post "path/to/post.md"
    python generate_linkedin_images.py --post "1.ai-skill-building-system.md"
    python generate_linkedin_images.py --post "1.ai-skill-building-system.md" --style technical

Directive: directives/content/linkedincontent/LinkedIn_image_creator.md
"""

import os
import sys
import re
import json
import base64
import argparse
from pathlib import Path
from typing import Dict, Any, List, Optional

# Fix Windows console encoding for Unicode characters
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# OpenAI import
try:
    from openai import OpenAI
except ImportError:
    print("Error: openai package not installed. Run: pip install openai")
    sys.exit(1)

# Directory paths
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
POSTS_DIR = PROJECT_ROOT / "directives" / "content" / "linkedincontent" / "posts"
IMAGES_DIR = POSTS_DIR / "images"

# Image generation settings
IMAGE_MODEL = "gpt-4.1"  # Mainline model that supports image_generation tool
IMAGE_SIZE = "1024x1024"  # Square format for LinkedIn
IMAGE_QUALITY = "high"


def get_openai_client() -> OpenAI:
    """
    Initialize and return the OpenAI client.

    Returns:
        OpenAI client instance

    Raises:
        ValueError: If OPENAI_API_KEY is not set
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError(
            "OPENAI_API_KEY not found in environment variables.\n"
            "Please add it to your .env file: OPENAI_API_KEY=sk-..."
        )
    return OpenAI(api_key=api_key)


def find_post_file(post_path: str) -> Path:
    """
    Find the post file, handling both absolute and relative paths.

    Args:
        post_path: Path to the post file (absolute or filename only)

    Returns:
        Path object to the post file
    """
    if not os.path.isabs(post_path):
        full_path = POSTS_DIR / post_path
    else:
        full_path = Path(post_path)

    if not full_path.exists():
        raise FileNotFoundError(f"Post file not found: {full_path}")

    return full_path


def extract_json_from_markdown(content: str) -> Dict[str, Any]:
    """
    Extract JSON block from the markdown content.

    Args:
        content: Full markdown file content

    Returns:
        Parsed JSON dict

    Raises:
        ValueError: If JSON block not found or invalid
    """
    pattern = r'## Image Prompts & Assets\s*```json\s*([\s\S]*?)```'
    match = re.search(pattern, content)

    if not match:
        raise ValueError("No 'Image Prompts & Assets' JSON block found in post file")

    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in prompt block: {e}")


def get_post_slug(post_path: Path) -> str:
    """
    Extract the post slug from the filename.

    Args:
        post_path: Path to the post file

    Returns:
        Post slug (filename without extension)
    """
    return post_path.stem


def generate_image(client: OpenAI, prompt: str, style_name: str) -> Optional[str]:
    """
    Generate an image using OpenAI's Responses API with image_generation tool.

    Args:
        client: OpenAI client instance
        prompt: Image generation prompt
        style_name: Name of the style (for logging)

    Returns:
        Base64-encoded image data or None if generation failed
    """
    print(f"  Generating {style_name} style image...")

    try:
        # Use the Responses API with image_generation tool
        response = client.responses.create(
            model=IMAGE_MODEL,
            input=f"Generate an image: {prompt}",
            tools=[{
                "type": "image_generation",
                "size": IMAGE_SIZE,
                "quality": IMAGE_QUALITY
            }],
            tool_choice={"type": "image_generation"}
        )

        # Extract image data from response
        for output in response.output:
            if output.type == "image_generation_call":
                if hasattr(output, 'result') and output.result:
                    print(f"  ✓ {style_name} image generated successfully")
                    if hasattr(output, 'revised_prompt'):
                        print(f"    Revised prompt: {output.revised_prompt[:100]}...")
                    return output.result

        print(f"  ✗ No image data returned for {style_name}")
        return None

    except Exception as e:
        print(f"  ✗ Error generating {style_name} image: {e}")
        return None


def save_image(image_data: str, output_path: Path) -> bool:
    """
    Save base64-encoded image to file.

    Args:
        image_data: Base64-encoded image string
        output_path: Path to save the image

    Returns:
        True if successful, False otherwise
    """
    try:
        # Ensure images directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # Decode and save
        image_bytes = base64.b64decode(image_data)
        with open(output_path, "wb") as f:
            f.write(image_bytes)

        print(f"  ✓ Saved: {output_path.name}")
        return True

    except Exception as e:
        print(f"  ✗ Error saving image: {e}")
        return False


def generate_images_for_post(
    post_path: str,
    style_filter: Optional[str] = None,
    dry_run: bool = False
) -> Dict[str, bool]:
    """
    Generate images for all style variations in a post file.

    Args:
        post_path: Path to the post markdown file
        style_filter: Optional style name to generate only that style
        dry_run: If True, only validate and show prompts without generating

    Returns:
        Dict mapping style names to success status
    """
    results = {}

    # Find and read post file
    file_path = find_post_file(post_path)
    post_slug = get_post_slug(file_path)
    print(f"\n📄 Processing: {file_path.name}")

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract JSON prompts
    data = extract_json_from_markdown(content)
    variations = data.get("variations", [])

    if not variations:
        raise ValueError("No variations found in JSON prompt")

    print(f"   Found {len(variations)} style variations")

    # Filter styles if specified
    if style_filter:
        variations = [v for v in variations if v.get("style_name") == style_filter]
        if not variations:
            raise ValueError(f"Style '{style_filter}' not found in post")

    if dry_run:
        print("\n🔍 DRY RUN - Showing prompts only:\n")
        for var in variations:
            style_name = var.get("style_name", "unknown")
            prompt = var.get("prompt", "")
            print(f"  [{style_name}]")
            print(f"  {prompt[:200]}...")
            print()
        return {v.get("style_name"): True for v in variations}

    # Initialize OpenAI client
    client = get_openai_client()
    print("\n🎨 Generating images...")

    # Generate each variation
    for var in variations:
        style_name = var.get("style_name", "unknown")
        prompt = var.get("prompt", "")

        if not prompt:
            print(f"  ⚠ Skipping {style_name}: empty prompt")
            results[style_name] = False
            continue

        # Generate image
        image_data = generate_image(client, prompt, style_name)

        if image_data:
            # Save image
            output_filename = f"{post_slug}_{style_name}.png"
            output_path = IMAGES_DIR / output_filename
            results[style_name] = save_image(image_data, output_path)
        else:
            results[style_name] = False

    return results


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(
        description="Generate LinkedIn post images using OpenAI GPT Image API"
    )

    parser.add_argument(
        "--post",
        required=True,
        help="Path to the post file (absolute or filename in posts folder)"
    )
    parser.add_argument(
        "--style",
        choices=["technical", "apple", "business_results"],
        help="Generate only a specific style (default: all)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show prompts without generating images"
    )
    parser.add_argument(
        "--verify",
        action="store_true",
        help="Run verification before generating (requires verify_image_prompt.py)"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("🖼️  LinkedIn Image Generator (OpenAI GPT Image)")
    print("=" * 60)

    # Optional verification step
    if args.verify:
        print("\n🔍 Running prompt verification first...")
        from verify_image_prompt import verify_post
        success, _ = verify_post(args.post)
        if not success:
            print("\n❌ Verification failed. Fix errors before generating images.")
            sys.exit(1)
        print("✓ Verification passed\n")

    try:
        results = generate_images_for_post(
            args.post,
            style_filter=args.style,
            dry_run=args.dry_run
        )

        # Summary
        print("\n" + "=" * 60)
        print("📊 Results Summary")
        print("-" * 60)

        all_success = True
        for style, success in results.items():
            status = "✓ Success" if success else "✗ Failed"
            print(f"   {style}: {status}")
            if not success:
                all_success = False

        print("=" * 60)

        if all_success:
            print("✅ All images generated successfully!")
            print(f"📁 Images saved to: {IMAGES_DIR}")
            sys.exit(0)
        else:
            print("⚠️  Some images failed to generate")
            sys.exit(1)

    except FileNotFoundError as e:
        print(f"\n❌ {e}")
        sys.exit(1)
    except ValueError as e:
        print(f"\n❌ {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
