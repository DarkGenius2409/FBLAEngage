#!/usr/bin/env python3
"""
FBLA Event Guidelines Web Scraper & Supabase Uploader

Scrapes official FBLA event guideline PDFs from connect.fbla.org and uploads
them to Supabase Storage in event-specific folders.

FBLA URL pattern:
  https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/
  Individual%20Guidelines/{CategoryFolder}/{EventFilename}.pdf

Requirements:
    pip install supabase python-dotenv requests beautifulsoup4

Usage:
    python scripts/scrape_event_guidelines.py [--dry-run] [--events "Accounting,Advanced Accounting"]
    python scripts/scrape_event_guidelines.py --list-events

Environment:
    SUPABASE_URL or VITE_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_SERVICE_ROLE_KEY
"""

import os
import re
import sys
import argparse
from pathlib import Path
from typing import Optional
from urllib.parse import quote

import requests

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
    from bs4 import BeautifulSoup
except ImportError as e:
    print("Error: Missing required package.")
    print("Run: pip install supabase python-dotenv requests beautifulsoup4")
    sys.exit(1)

# Project root
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent
env_path = PROJECT_ROOT / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")

BUCKET_NAME = "resources"
BASE_URL = "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines"
EVENT_PAGE_BASE = "https://www.fbla.org/competitive-events"

# Map our category names to FBLA connect folder names
CATEGORY_FOLDER = {
    "Objective Test": "Objective Tests",
    "Presentation": "Presentation Events",
    "Role Play": "Role Play",
    "Production": "Production Events",
    "Chapter Event": "Chapter Events",
}

# Events from fblaEvents.ts - keep in sync with src/lib/fblaEvents.ts
FBLA_EVENTS = [
    {"name": "Accounting", "category": "Objective Test"},
    {"name": "Advanced Accounting", "category": "Objective Test"},
    {"name": "Advertising", "category": "Objective Test"},
    {"name": "Agribusiness", "category": "Objective Test"},
    {"name": "Business Communication", "category": "Objective Test"},
    {"name": "Business Law", "category": "Objective Test"},
    {"name": "Computer Problem Solving", "category": "Objective Test"},
    {"name": "Cybersecurity", "category": "Objective Test"},
    {"name": "Data Science & AI", "category": "Objective Test"},
    {"name": "Economics", "category": "Objective Test"},
    {"name": "Healthcare Administration", "category": "Objective Test"},
    {"name": "Human Resource Management", "category": "Objective Test"},
    {"name": "Insurance & Risk Management", "category": "Objective Test"},
    {"name": "Journalism", "category": "Objective Test"},
    {"name": "Networking Infrastructures", "category": "Objective Test"},
    {"name": "Organizational Leadership", "category": "Objective Test"},
    {"name": "Personal Finance", "category": "Objective Test"},
    {"name": "Project Management", "category": "Objective Test"},
    {"name": "Public Administration & Management", "category": "Objective Test"},
    {"name": "Real Estate", "category": "Objective Test"},
    {"name": "Retail Management", "category": "Objective Test"},
    {"name": "Securities & Investments", "category": "Objective Test"},
    {"name": "Broadcast Journalism", "category": "Presentation"},
    {"name": "Business Ethics", "category": "Presentation"},
    {"name": "Business Plan", "category": "Presentation"},
    {"name": "Career Portfolio", "category": "Presentation"},
    {"name": "Coding & Programming", "category": "Presentation"},
    {"name": "Computer Game & Simulation Programming", "category": "Presentation"},
    {"name": "Data Analysis", "category": "Presentation"},
    {"name": "Digital Animation", "category": "Presentation"},
    {"name": "Digital Video Production", "category": "Presentation"},
    {"name": "Event Planning", "category": "Presentation"},
    {"name": "Financial Planning", "category": "Presentation"},
    {"name": "Financial Statement Analysis", "category": "Presentation"},
    {"name": "Future Business Educator", "category": "Presentation"},
    {"name": "Future Business Leader", "category": "Presentation"},
    {"name": "Graphic Design", "category": "Presentation"},
    {"name": "Impromptu Speaking", "category": "Presentation"},
    {"name": "Job Interview", "category": "Presentation"},
    {"name": "Mobile Application Development", "category": "Presentation"},
    {"name": "Public Service Announcement", "category": "Presentation"},
    {"name": "Public Speaking", "category": "Presentation"},
    {"name": "Sales Presentation", "category": "Presentation"},
    {"name": "Social Media Strategies", "category": "Presentation"},
    {"name": "Supply Chain Management", "category": "Presentation"},
    {"name": "Visual Design", "category": "Presentation"},
    {"name": "Website Coding & Development", "category": "Presentation"},
    {"name": "Website Design", "category": "Presentation"},
    {"name": "Banking & Financial Systems", "category": "Role Play"},
    {"name": "Business Management", "category": "Role Play"},
    {"name": "Customer Service", "category": "Role Play"},
    {"name": "Entrepreneurship", "category": "Role Play"},
    {"name": "Hospitality & Event Management", "category": "Role Play"},
    {"name": "International Business", "category": "Role Play"},
    {"name": "Management Information Systems", "category": "Role Play"},
    {"name": "Marketing", "category": "Role Play"},
    {"name": "Network Design", "category": "Role Play"},
    {"name": "Parliamentary Procedure", "category": "Role Play"},
    {"name": "Sports & Entertainment Management", "category": "Role Play"},
    {"name": "Technology Support & Services", "category": "Role Play"},
    {"name": "Computer Applications", "category": "Production"},
    {"name": "Community Service Project", "category": "Chapter Event"},
    {"name": "Local Chapter Annual Business Report", "category": "Chapter Event"},
    {"name": "Introduction to Business Communication", "category": "Objective Test"},
    {"name": "Introduction to Business Concepts", "category": "Objective Test"},
    {"name": "Introduction to Business Presentation", "category": "Presentation"},
    {"name": "Introduction to Business Procedures", "category": "Objective Test"},
    {"name": "Introduction to FBLA", "category": "Objective Test"},
    {"name": "Introduction to Information Technology", "category": "Objective Test"},
    {"name": "Introduction to Marketing Concepts", "category": "Objective Test"},
    {"name": "Introduction to Parliamentary Procedure", "category": "Objective Test"},
    {"name": "Introduction to Programming", "category": "Presentation"},
    {"name": "Introduction to Public Speaking", "category": "Presentation"},
    {"name": "Introduction to Retail & Merchandising", "category": "Objective Test"},
    {"name": "Introduction to Social Media Strategy", "category": "Presentation"},
    {"name": "Introduction to Supply Chain Management", "category": "Objective Test"},
]


def event_name_to_slug(name: str) -> str:
    """Convert event name to URL/filename slug: 'Introduction to FBLA' -> 'Introduction-to-FBLA'."""
    return re.sub(r"\s+", "-", name.strip())


def event_name_to_folder(name: str) -> str:
    """Convert event name to storage folder name (safe for paths)."""
    return re.sub(r'[<>:"/\\|?*&]', "", name).strip()


def get_guideline_url_from_event_page(event_name: str, category: str) -> Optional[str]:
    """
    Scrape the event page on fbla.org to find the direct PDF link.
    Returns the PDF URL if found, else None.
    """
    slug = event_name_to_slug(event_name).lower()
    slug = re.sub(r"&", "", slug)
    url = f"{EVENT_PAGE_BASE}/{slug}/"
    try:
        resp = requests.get(url, timeout=25, headers={"User-Agent": "FBLA-Engage-Scraper/1.0"})
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        for a in soup.find_all("a", href=True):
            href = a["href"]
            if "connect.fbla.org" in href and ".pdf" in href.lower():
                return href if href.startswith("http") else f"https://connect.fbla.org{href}"
        return None
    except Exception as e:
        print(f"    [warn] Could not scrape {url}: {e}")
        return None


def build_direct_pdf_url(event_name: str, category: str) -> str:
    """Build the presumed PDF URL based on FBLA connect folder structure."""
    folder = CATEGORY_FOLDER.get(category, "Objective Tests")
    filename = event_name_to_slug(event_name) + ".pdf"
    # Encode each segment; keep / as path separator (safe="/")
    folder_enc = quote(folder, safe="")
    filename_enc = quote(filename, safe="")
    base = "https://connect.fbla.org/headquarters/files/High%20School%20Competitive%20Events%20Resources/Individual%20Guidelines"
    return f"{base}/{folder_enc}/{filename_enc}"


def fetch_pdf(url: str) -> Optional[bytes]:
    """
    Fetch PDF bytes from URL. connect.fbla.org returns HTML with an S3 presigned link;
    we parse that and fetch the actual PDF from S3.
    """
    headers = {"User-Agent": "Mozilla/5.0 (compatible; FBLA-Engage-Scraper/1.0)"}
    try:
        resp = requests.get(url, timeout=30, allow_redirects=True, headers=headers)
        resp.raise_for_status()
        content = resp.content

        # If we got a PDF directly, return it
        if content.startswith(b"%PDF"):
            return content

        # connect.fbla.org returns HTML with a link to S3 - extract it
        if b"s3" in content.lower() and b"amazonaws" in content.lower():
            soup = BeautifulSoup(content, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if ".pdf" in href.lower() and "amazonaws" in href:
                    pdf_resp = requests.get(href, timeout=30, headers=headers)
                    pdf_resp.raise_for_status()
                    if pdf_resp.content.startswith(b"%PDF"):
                        return pdf_resp.content
        return None
    except Exception as e:
        print(f"    [warn] Fetch failed: {e}")
        return None


def ensure_bucket(supabase: Client) -> None:
    """Create the resources bucket if it does not exist."""
    try:
        supabase.storage.get_bucket(BUCKET_NAME)
    except Exception:
        supabase.storage.create_bucket(BUCKET_NAME, options={"public": True})


def get_storage_path(event_name: str) -> str:
    """Return the storage path within the resources bucket."""
    folder = event_name_to_folder(event_name)
    return f"{folder}/guidelines.pdf"


def upload_to_storage(supabase: Client, event_name: str, pdf_bytes: bytes, dry_run: bool) -> bool:
    """Upload PDF to Supabase storage at resources/{EventName}/guidelines.pdf."""
    folder = event_name_to_folder(event_name)
    storage_path = f"{folder}/guidelines.pdf"
    if dry_run:
        print(f"    [dry-run] Would upload to {BUCKET_NAME}/{storage_path} ({len(pdf_bytes)} bytes)")
        return True
    try:
        supabase.storage.from_(BUCKET_NAME).upload(storage_path, pdf_bytes, {"content-type": "application/pdf", "x-upsert": "true"})
        return True
    except Exception as e:
        print(f"    [error] Upload failed: {e}")
        return False


def upsert_resource_in_db(supabase: Client, event_name: str, storage_path: str, dry_run: bool) -> bool:
    """Upsert the guideline resource into the resources table with storage_path."""
    title = f"{event_name} Guidelines"
    description = f"Official FBLA competitive event guidelines for {event_name}."
    if dry_run:
        print(f"    [dry-run] Would upsert resource: {title} -> storage_path={storage_path}")
        return True
    try:
        existing = supabase.table("resources").select("id").eq("event_name", event_name).eq("title", title).limit(1).execute()
        if existing.data and len(existing.data) > 0:
            supabase.table("resources").update({"storage_path": storage_path, "url": None, "description": description}).eq("id", existing.data[0]["id"]).execute()
        else:
            supabase.table("resources").insert({
                "title": title,
                "description": description,
                "type": "pdf",
                "url": None,
                "storage_path": storage_path,
                "event_name": event_name,
                "category_id": None,
                "downloads": 0,
            }).execute()
        return True
    except Exception as e:
        print(f"    [error] DB upsert failed: {e}")
        return False


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape FBLA event guidelines and upload to Supabase Storage")
    parser.add_argument("--dry-run", action="store_true", help="Do not upload; only fetch and report")
    parser.add_argument("--events", type=str, help="Comma-separated event names to process (default: all)")
    parser.add_argument("--list-events", action="store_true", help="List all events and exit")
    args = parser.parse_args()

    if args.list_events:
        for ev in FBLA_EVENTS:
            print(f"  {ev['name']} ({ev['category']})")
        sys.exit(0)

    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
        sys.exit(1)

    events_to_process = FBLA_EVENTS
    if args.events:
        names = [n.strip() for n in args.events.split(",") if n.strip()]
        events_to_process = [e for e in FBLA_EVENTS if e["name"] in names]
        if not events_to_process:
            print(f"ERROR: No matching events for: {args.events}")
            sys.exit(1)

    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    if not args.dry_run:
        ensure_bucket(supabase)

    ok = 0
    fail = 0
    for ev in events_to_process:
        name, cat = ev["name"], ev["category"]
        print(f"\n{name} ({cat})")
        url = get_guideline_url_from_event_page(name, cat)
        if not url:
            url = build_direct_pdf_url(name, cat)
            print(f"  Using direct URL: {url}")
        else:
            print(f"  Found URL from event page: {url}")

        pdf = fetch_pdf(url)
        if not pdf or len(pdf) < 500:
            print(f"  [fail] No PDF obtained")
            fail += 1
            continue
        if not pdf.startswith(b"%PDF"):
            print(f"  [fail] Response is not a valid PDF")
            fail += 1
            continue

        if not upload_to_storage(supabase, name, pdf, args.dry_run):
            fail += 1
            continue

        storage_path = get_storage_path(name)
        if upsert_resource_in_db(supabase, name, storage_path, args.dry_run):
            print(f"  [ok] Uploaded {len(pdf)} bytes, DB updated")
            ok += 1
        else:
            fail += 1

    print(f"\n--- Done: {ok} ok, {fail} failed ---")


if __name__ == "__main__":
    main()
