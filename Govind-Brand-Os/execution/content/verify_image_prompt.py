"""
Verify LinkedIn Image Prompt Structure

This script verifies that the structured JSON prompt in a LinkedIn post file
follows the Master JSON Prompt Template (Nano Banana Format).

Usage:
    python verify_image_prompt.py --post "path/to/post.md"
    python verify_image_prompt.py --post "1.ai-skill-building-system.md"

Directive: directives/content/linkedincontent/LinkedIn_image_creator.md
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from typing import Tuple, List, Dict, Any

# Posts directory
POSTS_DIR = Path(__file__).parent.parent.parent / "directives" / "content" / "linkedincontent" / "posts"

# Required schema fields
REQUIRED_SCHEMA = {
    "post_context": {
        "required": True,
        "fields": ["post_reference", "created_date", "hook_text", "key_insight", "result_metrics", "key_topics"]
    },
    "meta": {
        "required": True,
        "fields": ["platform", "aspect_ratio", "dimensions"]
    },
    "base_style": {
        "required": True,
        "fields": ["background", "background_cleanliness", "aesthetic"]
    },
    "variations": {
        "required": True,
        "min_count": 3,
        "variation_fields": ["style_name", "style_id", "prompt"]
    }
}

# Valid style names
VALID_STYLE_NAMES = ["technical", "apple", "business_results"]

# Background enforcement
REQUIRED_BACKGROUND = "pure white (#FFFFFF)"


def find_post_file(post_path: str) -> Path:
    """
    Find the post file, handling both absolute and relative paths.
    
    Args:
        post_path: Path to the post file (absolute or filename only)
        
    Returns:
        Path object to the post file
    """
    # If it's just a filename, look in POSTS_DIR
    if not os.path.isabs(post_path):
        full_path = POSTS_DIR / post_path
    else:
        full_path = Path(post_path)
    
    if not full_path.exists():
        raise FileNotFoundError(f"Post file not found: {full_path}")
    
    return full_path


def extract_json_from_markdown(content: str) -> Dict[str, Any] | None:
    """
    Extract JSON block from the markdown content.
    
    Args:
        content: Full markdown file content
        
    Returns:
        Parsed JSON dict or None if not found
    """
    # Look for JSON block after "## Image Prompts & Assets"
    pattern = r'## Image Prompts & Assets\s*```json\s*([\s\S]*?)```'
    match = re.search(pattern, content)
    
    if not match:
        return None
    
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in prompt block: {e}")


def validate_post_context(data: Dict[str, Any]) -> List[str]:
    """Validate post_context section."""
    errors = []
    
    if "post_context" not in data:
        errors.append("Missing 'post_context' section")
        return errors
    
    ctx = data["post_context"]
    for field in REQUIRED_SCHEMA["post_context"]["fields"]:
        if field not in ctx:
            errors.append(f"Missing 'post_context.{field}'")
        elif not ctx[field]:
            errors.append(f"Empty 'post_context.{field}'")
    
    return errors


def validate_meta(data: Dict[str, Any]) -> List[str]:
    """Validate meta section."""
    errors = []
    
    if "meta" not in data:
        errors.append("Missing 'meta' section")
        return errors
    
    meta = data["meta"]
    for field in REQUIRED_SCHEMA["meta"]["fields"]:
        if field not in meta:
            errors.append(f"Missing 'meta.{field}'")
    
    # Validate specific values
    if meta.get("platform") != "LinkedIn":
        errors.append("meta.platform must be 'LinkedIn'")
    if meta.get("aspect_ratio") != "1:1":
        errors.append("meta.aspect_ratio must be '1:1'")
    if meta.get("dimensions") != "1200x1200px":
        errors.append("meta.dimensions must be '1200x1200px'")
    
    return errors


def validate_base_style(data: Dict[str, Any]) -> List[str]:
    """Validate base_style section and enforce white background."""
    errors = []
    
    if "base_style" not in data:
        errors.append("Missing 'base_style' section")
        return errors
    
    style = data["base_style"]
    for field in REQUIRED_SCHEMA["base_style"]["fields"]:
        if field not in style:
            errors.append(f"Missing 'base_style.{field}'")
    
    # CRITICAL: Enforce white background
    if style.get("background") != REQUIRED_BACKGROUND:
        errors.append(f"base_style.background MUST be '{REQUIRED_BACKGROUND}' (minimalistic white background enforced)")
    
    if "Maximum" not in style.get("background_cleanliness", ""):
        errors.append("base_style.background_cleanliness must include 'Maximum'")
    
    return errors


def validate_variations(data: Dict[str, Any]) -> List[str]:
    """Validate variations array."""
    errors = []
    
    if "variations" not in data:
        errors.append("Missing 'variations' array")
        return errors
    
    variations = data["variations"]
    
    if not isinstance(variations, list):
        errors.append("'variations' must be an array")
        return errors
    
    if len(variations) < REQUIRED_SCHEMA["variations"]["min_count"]:
        errors.append(f"Need at least {REQUIRED_SCHEMA['variations']['min_count']} variations, found {len(variations)}")
    
    found_styles = set()
    for i, var in enumerate(variations):
        prefix = f"variations[{i}]"
        
        # Check required fields
        for field in REQUIRED_SCHEMA["variations"]["variation_fields"]:
            if field not in var:
                errors.append(f"Missing '{prefix}.{field}'")
        
        # Validate style_name
        style_name = var.get("style_name")
        if style_name:
            if style_name not in VALID_STYLE_NAMES:
                errors.append(f"{prefix}.style_name '{style_name}' is not valid. Must be one of: {VALID_STYLE_NAMES}")
            found_styles.add(style_name)
        
        # Validate prompt is not empty
        if not var.get("prompt"):
            errors.append(f"{prefix}.prompt is empty")
        else:
            # Check prompt mentions white background
            prompt = var.get("prompt", "").lower()
            if "white background" not in prompt:
                errors.append(f"{prefix}.prompt should mention 'white background'")
    
    # Check all 3 styles are present
    missing_styles = set(VALID_STYLE_NAMES) - found_styles
    if missing_styles:
        errors.append(f"Missing style variations: {missing_styles}")
    
    return errors


def validate_prompt_structure(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validate the complete prompt structure.
    
    Args:
        data: Parsed JSON data
        
    Returns:
        Tuple of (is_valid, list of error messages)
    """
    all_errors = []
    
    all_errors.extend(validate_post_context(data))
    all_errors.extend(validate_meta(data))
    all_errors.extend(validate_base_style(data))
    all_errors.extend(validate_variations(data))
    
    return len(all_errors) == 0, all_errors


def verify_post(post_path: str, max_retries: int = 3) -> Tuple[bool, Dict[str, Any] | None]:
    """
    Verify a post file has valid image prompt structure.
    
    Args:
        post_path: Path to the post file
        max_retries: Maximum retries for validation loop
        
    Returns:
        Tuple of (success, parsed_data or None)
    """
    attempt = 0
    
    while attempt < max_retries:
        attempt += 1
        print(f"\n🔍 Verification attempt {attempt}/{max_retries}")
        
        try:
            # Find and read the post file
            file_path = find_post_file(post_path)
            print(f"📄 Reading: {file_path}")
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if Image Prompts section exists
            if "## Image Prompts & Assets" not in content:
                print("❌ No 'Image Prompts & Assets' section found in post")
                if attempt < max_retries:
                    print("⏳ Waiting for prompt to be added...")
                    continue
                return False, None
            
            # Extract JSON
            data = extract_json_from_markdown(content)
            if data is None:
                print("❌ Could not extract JSON from prompt section")
                if attempt < max_retries:
                    continue
                return False, None
            
            # Validate structure
            is_valid, errors = validate_prompt_structure(data)
            
            if is_valid:
                print("✅ Prompt structure is VALID!")
                print(f"   ├─ post_context: ✓")
                print(f"   ├─ meta: ✓")
                print(f"   ├─ base_style: ✓ (white background enforced)")
                print(f"   └─ variations: ✓ ({len(data.get('variations', []))} styles)")
                return True, data
            else:
                print(f"❌ Validation failed with {len(errors)} error(s):")
                for err in errors:
                    print(f"   • {err}")
                
                if attempt < max_retries:
                    print("\n⏳ Please fix the errors and try again...")
        
        except FileNotFoundError as e:
            print(f"❌ {e}")
            return False, None
        except ValueError as e:
            print(f"❌ {e}")
            if attempt < max_retries:
                continue
            return False, None
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            return False, None
    
    print(f"\n❌ Verification failed after {max_retries} attempts")
    return False, None


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(
        description="Verify LinkedIn image prompt structure in post files"
    )
    
    parser.add_argument(
        "--post", 
        required=True, 
        help="Path to the post file (absolute or filename in posts folder)"
    )
    parser.add_argument(
        "--retries",
        type=int,
        default=3,
        help="Maximum retries for validation loop (default: 3)"
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Minimal output, only show pass/fail"
    )
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🔎 LinkedIn Image Prompt Verification")
    print("=" * 60)
    
    success, data = verify_post(args.post, args.retries)
    
    print("\n" + "=" * 60)
    if success:
        print("✅ VERIFICATION PASSED")
        sys.exit(0)
    else:
        print("❌ VERIFICATION FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()
