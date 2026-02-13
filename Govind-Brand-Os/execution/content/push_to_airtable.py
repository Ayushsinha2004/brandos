"""
Push LinkedIn Post to Airtable Content Pipeline

This script pushes generated LinkedIn posts to the Airtable Content Pipeline table
with upsert logic based on YouTube Source URL.

Usage:
    python push_to_airtable.py --title "Post Title" --draft "Content..." --hook "Hook..."

Directive: directives/content/linkedincontent/airtable_content_push.md
"""

import os
import sys
import argparse
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Airtable Configuration
AIRTABLE_API_KEY = os.getenv("AIRTABLE_API_KEY")
AIRTABLE_BASE_ID = os.getenv("AIRTABLE_BASE_ID", "")  # Add your base ID to .env
AIRTABLE_TABLE_NAME = "Content Pipeline"

# API Endpoints
AIRTABLE_API_URL = f"https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{AIRTABLE_TABLE_NAME}"

# Valid options for single select fields
VALID_CONTENT_TYPES = ["Text", "Carousel", "Document", "Image"]
VALID_CTA_TYPES = ["DM Me", "Comment Below", "Like/Share", "Visit Website"]
VALID_STATUSES = ["Idea", "Drafting", "Review", "Scheduled", "Published", "Archived"]


def get_headers():
    """Return headers for Airtable API requests."""
    return {
        "Authorization": f"Bearer {AIRTABLE_API_KEY}",
        "Content-Type": "application/json"
    }


def find_record_by_youtube_url(youtube_url: str) -> str | None:
    """
    Find an existing record by YouTube Source URL for upsert logic.
    
    Args:
        youtube_url: The YouTube URL to search for
        
    Returns:
        Record ID if found, None otherwise
    """
    if not youtube_url:
        return None
    
    # Use filterByFormula to find matching record
    params = {
        "filterByFormula": f"{{YouTube Source URL}} = '{youtube_url}'",
        "maxRecords": 1
    }
    
    try:
        response = requests.get(AIRTABLE_API_URL, headers=get_headers(), params=params)
        response.raise_for_status()
        data = response.json()
        
        if data.get("records"):
            return data["records"][0]["id"]
        return None
        
    except requests.RequestException as e:
        print(f"Warning: Could not search for existing record: {e}")
        return None


def create_record(fields: dict) -> dict:
    """
    Create a new record in Airtable.
    
    Args:
        fields: Dictionary of field names and values
        
    Returns:
        Created record data
    """
    payload = {
        "records": [{"fields": fields}],
        "typecast": True  # Automatically convert field values to correct types
    }
    
    response = requests.post(AIRTABLE_API_URL, headers=get_headers(), json=payload)
    response.raise_for_status()
    return response.json()


def update_record(record_id: str, fields: dict) -> dict:
    """
    Update an existing record in Airtable.
    
    Args:
        record_id: The Airtable record ID to update
        fields: Dictionary of field names and values
        
    Returns:
        Updated record data
    """
    url = f"{AIRTABLE_API_URL}/{record_id}"
    payload = {
        "fields": fields,
        "typecast": True
    }
    
    response = requests.patch(url, headers=get_headers(), json=payload)
    response.raise_for_status()
    return response.json()


def upsert_linkedin_post(
    title: str,
    draft: str,
    hook: str,
    transcript_summary: str = "",
    youtube_url: str = "",
    content_type: str = "Text",
    cta_type: str = "Comment Below",
    status: str = "Drafting"
) -> dict:
    """
    Upsert a LinkedIn post to Airtable Content Pipeline.
    
    If a record with the same YouTube URL exists, update it.
    Otherwise, create a new record.
    
    Args:
        title: Post title
        draft: LinkedIn post draft content
        hook: First 2 lines of the post (the hook)
        transcript: YouTube transcript (optional)
        youtube_url: Source YouTube URL (optional, used for matching)
        content_type: Text, Carousel, Document, or Image
        cta_type: DM Me, Comment Below, Like/Share, or Visit Website
        status: Record status (default: Drafting)
        
    Returns:
        API response with created/updated record
    """
    # Validate content type
    if content_type not in VALID_CONTENT_TYPES:
        print(f"Warning: Invalid content type '{content_type}'. Using 'Text'.")
        content_type = "Text"
    
    # Validate CTA type
    if cta_type not in VALID_CTA_TYPES:
        print(f"Warning: Invalid CTA type '{cta_type}'. Using 'Comment Below'.")
        cta_type = "Comment Below"
    
    # Validate status
    if status not in VALID_STATUSES:
        print(f"Warning: Invalid status '{status}'. Using 'Drafting'.")
        status = "Drafting"
    
    # Build fields dictionary
    fields = {
        "Post Title": title,
        "Status": status,
        "LinkedIn Post Draft": draft,
        "Post Hook": hook,
        "Content Type": content_type,
        "CTA Type": cta_type
    }
    
    # Add optional fields if provided
    if transcript_summary:
        fields["YouTube Transcript"] = transcript_summary  # Stores summary, not full text
    if youtube_url:
        fields["YouTube Source URL"] = youtube_url
    
    # Check for existing record (upsert logic)
    existing_record_id = find_record_by_youtube_url(youtube_url)
    
    if existing_record_id:
        print(f"Updating existing record: {existing_record_id}")
        return update_record(existing_record_id, fields)
    else:
        print("Creating new record...")
        return create_record(fields)


def main():
    """Main entry point for CLI usage."""
    parser = argparse.ArgumentParser(
        description="Push LinkedIn post to Airtable Content Pipeline"
    )
    
    # Required arguments
    parser.add_argument("--title", required=True, help="Post title")
    parser.add_argument("--draft", required=True, help="LinkedIn post draft content")
    parser.add_argument("--hook", required=True, help="First 2 lines of the post (hook)")
    
    # Optional arguments
    parser.add_argument("--transcript-summary", default="", help="Summary of the YouTube transcript (key points)")
    parser.add_argument("--youtube-url", default="", help="Source YouTube URL")
    parser.add_argument(
        "--content-type", 
        default="Text",
        choices=VALID_CONTENT_TYPES,
        help="Content type (default: Text)"
    )
    parser.add_argument(
        "--cta-type",
        default="Comment Below",
        choices=VALID_CTA_TYPES,
        help="CTA type (default: Comment Below)"
    )
    parser.add_argument(
        "--status",
        default="Drafting",
        choices=VALID_STATUSES,
        help="Record status (default: Drafting)"
    )
    
    args = parser.parse_args()
    
    # Validate environment
    if not AIRTABLE_API_KEY:
        print("Error: AIRTABLE_API_KEY not found in .env file")
        sys.exit(1)
    
    if not AIRTABLE_BASE_ID:
        print("Error: AIRTABLE_BASE_ID not found in .env file")
        print("Add AIRTABLE_BASE_ID=your_base_id to your .env file")
        sys.exit(1)
    
    try:
        result = upsert_linkedin_post(
            title=args.title,
            draft=args.draft,
            hook=args.hook,
            transcript_summary=args.transcript_summary,
            youtube_url=args.youtube_url,
            content_type=args.content_type,
            cta_type=args.cta_type,
            status=args.status
        )
        
        print("\n✅ Successfully pushed to Airtable!")
        print(f"Record ID: {result.get('records', [{}])[0].get('id', result.get('id', 'N/A'))}")
        
    except requests.RequestException as e:
        print(f"\n❌ Error pushing to Airtable: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response: {e.response.text}")
        sys.exit(1)


if __name__ == "__main__":
    main()
