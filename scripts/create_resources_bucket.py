#!/usr/bin/env python3
"""
Create the Supabase Storage 'resources' bucket for event guideline PDFs.
Run this if you see "Bucket not found" when downloading resources.

Usage:
    python scripts/create_resources_bucket.py

Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
"""

import os
from pathlib import Path

try:
    from supabase import create_client
    from dotenv import load_dotenv
except ImportError:
    print("Run: pip install supabase python-dotenv")
    exit(1)

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / ".env")

url = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
if not url or not key:
    print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

client = create_client(url, key)
bucket_name = "resources"

try:
    client.storage.get_bucket(bucket_name)
    print(f"Bucket '{bucket_name}' already exists.")
except Exception:
    try:
        client.storage.create_bucket(bucket_name, options={"public": True})
        print(f"Bucket '{bucket_name}' created successfully (public).")
    except Exception as e:
        print(f"Failed to create bucket: {e}")
        exit(1)
