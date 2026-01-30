#!/usr/bin/env python3
"""
FBLA Engage Database Seeding Script
Comprehensive script for seeding, verifying, and managing test data.
Targets the consolidated schema (sql/schema.sql), including social_connections,
oauth_states, and social_imports.

Features:
- Creates real Supabase Auth users
- Respects foreign keys, triggers, and RLS
- Avoids recursive chat relationships
- Generates realistic FBLA-specific content
- Deterministic and reproducible (uses seeds)
- Safe reset and reseed functionality
- Verification and cleanup utilities

Requirements:
    pip install supabase python-dotenv faker requests

Usage:
    python scripts/seed.py seed [--reset] [--count=20]
    python scripts/seed.py verify
    python scripts/seed.py cleanup-auth        # Delete seeded users only
    python scripts/seed.py cleanup-auth-all    # Delete ALL auth users
    python scripts/seed.py reset
"""

import os
import sys
import argparse
import requests
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from pathlib import Path
import random
import uuid
from faker import Faker

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
except ImportError:
    print("Error: Required packages not installed.")
    print("Please run: pip install supabase python-dotenv faker requests")
    sys.exit(1)

# Get the project root directory (parent of scripts/)
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_ROOT = SCRIPT_DIR.parent

# Load environment variables from .env file in project root
env_path = PROJECT_ROOT / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    # Fallback: try loading from current directory
    load_dotenv()

# Initialize Faker with seed for reproducibility
Faker.seed(42)
fake = Faker()
random.seed(42)

# Supabase configuration
# Try both with and without VITE_ prefix for flexibility
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv("VITE_SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("=" * 60)
    print("ERROR: Missing Environment Variables")
    print("=" * 60)
    print()
    print("Required variables in .env file:")
    print(f"  SUPABASE_URL={'✓' if os.getenv('SUPABASE_URL') or os.getenv('VITE_SUPABASE_URL') else '✗ MISSING'}")
    print(f"  SUPABASE_SERVICE_ROLE_KEY={'✓' if os.getenv('SUPABASE_SERVICE_ROLE_KEY') or os.getenv('VITE_SUPABASE_SERVICE_ROLE_KEY') else '✗ MISSING'}")
    print()
    print("To find your keys:")
    print("  1. Go to: Supabase Dashboard → Settings → API")
    print("  2. Copy 'Project URL' → SUPABASE_URL (or VITE_SUPABASE_URL)")
    print("  3. Copy 'service_role' key (NOT the anon/publishable key) → SUPABASE_SERVICE_ROLE_KEY")
    print()
    print("⚠ IMPORTANT: You need the SERVICE_ROLE key, not the anon/publishable key!")
    print("   The service_role key bypasses RLS and is required for admin operations.")
    print()
    print(f"Current .env path: {env_path}")
    if not env_path.exists():
        print(f"  ⚠ .env file not found at this location!")
    sys.exit(1)

# Validate the keys look correct
if not SUPABASE_URL.startswith("http"):
    print("⚠ Warning: SUPABASE_URL should start with 'https://'")
if len(SUPABASE_SERVICE_ROLE_KEY) < 100:
    print("⚠ Warning: SUPABASE_SERVICE_ROLE_KEY seems too short (should be ~200+ characters)")

try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    # Test the connection with a simple query
    test_result = supabase.table("schools").select("id").limit(1).execute()
    print("✓ Successfully connected to Supabase")
except Exception as e:
    error_msg = str(e)
    if "Invalid API key" in error_msg or "401" in error_msg or "unauthorized" in error_msg.lower():
        print("=" * 60)
        print("ERROR: Invalid API Key")
        print("=" * 60)
        print()
        print("The SUPABASE_SERVICE_ROLE_KEY appears to be invalid or incorrect.")
        print()
        print("Troubleshooting:")
        print("  1. Make sure you're using the SERVICE_ROLE key (not the anon/publishable key)")
        print("  2. Go to: Supabase Dashboard → Settings → API")
        print("  3. Find the 'service_role' key (it's longer, ~200+ characters, starts with 'eyJ...')")
        print("  4. Copy it to your .env file as SUPABASE_SERVICE_ROLE_KEY")
        print()
        print("⚠ IMPORTANT: The service_role key bypasses RLS policies.")
        print("  Keep it secret and never commit it to git!")
        print()
        print(f"Current SUPABASE_URL: {SUPABASE_URL[:50]}...")
        print(f"Current key length: {len(SUPABASE_SERVICE_ROLE_KEY)} characters")
        if SUPABASE_SERVICE_ROLE_KEY.startswith("eyJ"):
            print("  ✓ Key format looks correct (starts with 'eyJ')")
        else:
            print("  ⚠ Key format might be incorrect (should start with 'eyJ')")
    else:
        print(f"Error connecting to Supabase: {e}")
    sys.exit(1)

# FBLA Events (official list)
FBLA_EVENTS = [
    "Accounting", "Advanced Accounting", "Advertising", "Agribusiness",
    "Banking & Financial Systems", "Broadcast Journalism", "Business Communication",
    "Business Ethics", "Business Law", "Business Management", "Business Plan",
    "Career Portfolio", "Coding & Programming", "Community Service Project",
    "Computer Applications", "Computer Game & Simulation Programming",
    "Computer Problem Solving", "Customer Service", "Cybersecurity",
    "Data Analysis", "Data Science & AI", "Digital Animation",
    "Digital Video Production", "Economics", "Entrepreneurship", "Event Planning",
    "Financial Planning", "Financial Statement Analysis", "Future Business Educator",
    "Future Business Leader", "Graphic Design", "Healthcare Administration",
    "Hospitality & Event Management", "Human Resource Management",
    "Impromptu Speaking", "Insurance & Risk Management", "International Business",
    "Introduction to Business Communication", "Introduction to Business Concepts",
    "Introduction to Business Presentation", "Introduction to Business Procedures",
    "Introduction to FBLA", "Introduction to Information Technology",
    "Introduction to Marketing Concepts", "Introduction to Parliamentary Procedure",
    "Introduction to Programming", "Introduction to Public Speaking",
    "Introduction to Retail & Merchandising", "Introduction to Social Media Strategy",
    "Introduction to Supply Chain Management", "Job Interview", "Journalism",
    "Local Chapter Annual Business Report", "Management Information Systems",
    "Marketing", "Mobile Application Development", "Network Design",
    "Networking Infrastructures", "Organizational Leadership", "Parliamentary Procedure",
    "Personal Finance", "Project Management", "Public Administration & Management",
    "Public Service Announcement", "Public Speaking", "Real Estate",
    "Retail Management", "Sales Presentation", "Securities & Investments",
    "Social Media Strategies", "Sports & Entertainment Management",
    "Supply Chain Management", "Technology Support & Services", "Visual Design",
    "Website Coding & Development", "Website Design"
]

# FBLA-specific content
FBLA_SCHOOL_NAMES = [
    "Lincoln High School FBLA",
    "Washington High School FBLA",
    "Roosevelt High School FBLA",
    "Jefferson High School FBLA",
    "Madison High School FBLA",
    "Hamilton High School FBLA",
    "Franklin High School FBLA",
    "Adams High School FBLA"
]

FBLA_POST_CONTENT = [
    "Just qualified for State! So excited to represent our chapter! 🎉",
    "Practice test scores are improving every week. Hard work pays off! 💪",
    "Our chapter raised $5,000 for local charities this semester. Proud of everyone!",
    "Business Plan competition was intense! Learned so much from other teams.",
    "Networking event was incredible. Met so many inspiring business leaders!",
    "Accounting exam prep is going well. Thanks to everyone who shared study tips!",
    "Congratulations to all State qualifiers! Let's bring home the trophy! 🏆",
    "Leadership workshop changed my perspective. Highly recommend to everyone!",
    "Working on my coding project for the competition. Can't wait to present!",
    "Marketing strategy presentation went great! Feedback was really helpful.",
    "Community service project is making a real impact. So rewarding!",
    "Study group session was productive. Teamwork makes the dream work!",
    "Just finished my Business Ethics presentation. Feeling confident!",
    "Financial planning workshop was eye-opening. Everyone should attend!",
    "Our chapter won Chapter of the Year! So proud to be part of this team!"
]

FBLA_RESOURCE_TITLES = {
    "pdf": [
        "{event} Study Guide",
        "{event} Practice Test Questions",
        "{event} Competition Guidelines",
        "{event} Sample Problems",
        "{event} Review Materials",
        "{event} Quick Reference Guide",
        "{event} Test Preparation Workbook"
    ],
    "link": [
        "{event} Online Course",
        "{event} Tutorial Series",
        "{event} Official Competition Rules",
        "{event} Practice Platform",
        "{event} Study Resources",
        "{event} Video Tutorials",
        "{event} Interactive Learning"
    ],
    "video": [
        "{event} Competition Walkthrough",
        "{event} Tips and Strategies",
        "{event} Sample Presentation",
        "{event} Study Session Recording",
        "{event} Expert Interview",
        "{event} Competition Prep Guide"
    ]
}

RESOURCE_TYPES = ["pdf", "link", "video"]
EVENT_LEVELS = ["regional", "state", "national"]
CHAT_TYPES = ["direct", "group"]


# ============================================================================
# Auth User Management
# ============================================================================

def create_auth_user(email: str, password: str, user_id: str, name: str) -> bool:
    """Create an auth user using Supabase Admin API"""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_ROLE_KEY
    }
    
    data = {
        "email": email,
        "password": password,
        "email_confirm": True,
        "user_metadata": {
            "name": name,
            "full_name": name
        },
        "id": user_id
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, timeout=10)
        if response.status_code in [200, 201]:
            return True
        else:
            error_data = response.json() if response.content else {}
            if "User already registered" in str(error_data):
                return True
            return False
    except Exception as e:
        return False


def list_auth_users() -> list:
    """List all auth users"""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        if response.status_code == 200:
            return response.json().get("users", [])
        return []
    except Exception as e:
        return []


def delete_auth_user(user_id: str) -> bool:
    """Delete an auth user using Supabase Admin API"""
    url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"
    headers = {
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY
    }
    
    try:
        response = requests.delete(url, headers=headers, timeout=10)
        return response.status_code in [200, 204]
    except Exception as e:
        return False


# ============================================================================
# Database Reset
# ============================================================================

def reset_database(include_auth: bool = False) -> None:
    """Safely reset the database by deleting all data (respects foreign keys).
    Matches consolidated schema: includes social_imports, social_connections, oauth_states, chat_requests.
    """
    print("=" * 60)
    print("Resetting Database...")
    print("=" * 60)
    
    # Delete in reverse order of dependencies (matches sql/schema.sql)
    # Tables with "id" use neq("id", ...); oauth_states uses "state" as PK.
    tables_with_id = [
        "social_imports",
        "social_connections",
        "user_preferences",
        "messages",
        "chat_participants",
        "chats",
        "chat_requests",
        "event_registrations",
        "events",
        "student_follows",
        "school_roles",
        "likes",
        "comments",
        "media",
        "posts",
        "resources",
        "resource_categories",
        "notifications",
        "reports",
        "students",
        "schools",
    ]
    
    for table in tables_with_id:
        try:
            # Most tables have uuid "id"; composite-PK tables may not.
            # Supabase delete requires a filter; we use a no-op filter that matches all.
            if table in ("likes", "event_registrations", "student_follows", "chat_participants"):
                # Composite PK: filter on first column to match all rows
                col = "user_id" if table == "likes" else "event_id" if table == "event_registrations" else "follower_id" if table == "student_follows" else "chat_id"
                result = supabase.table(table).delete().neq(col, "00000000-0000-0000-0000-000000000000").execute()
            else:
                result = supabase.table(table).delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
            print(f"  ✓ Cleared {table}")
        except Exception as e:
            print(f"  ⚠ Could not clear {table}: {e}")
    
    # oauth_states: PK is "state" (text), no "id"
    try:
        supabase.table("oauth_states").delete().neq("state", "").execute()
        print("  ✓ Cleared oauth_states")
    except Exception as e:
        print(f"  ⚠ Could not clear oauth_states: {e}")
    
    print("  ✓ Database tables cleared")
    
    if include_auth:
        print()
        print("Cleaning up auth users...")
        users = list_auth_users()
        seeded_users = [u for u in users if u.get("email", "").startswith("student") and "@fbla.test" in u.get("email", "")]
        
        deleted = 0
        for user in seeded_users:
            if delete_auth_user(user.get("id")):
                deleted += 1
        
        print(f"  ✓ Deleted {deleted} auth users")
    else:
        print()
        print("  ⚠ Note: Auth users are NOT automatically deleted.")
        print("    Use 'python scripts/seed.py cleanup-auth' to delete seeded users")
        print("    Or use --auth flag: 'python scripts/seed.py reset --auth'")
    
    print()


# ============================================================================
# Data Creation Functions
# ============================================================================

def create_schools(count: int = 5) -> List[str]:
    """Create realistic FBLA schools/chapters"""
    print(f"Creating {count} schools...")
    school_ids = []
    created_count = 0
    skipped_count = 0
    
    for i in range(count):
        school_name = FBLA_SCHOOL_NAMES[i % len(FBLA_SCHOOL_NAMES)]
        if i >= len(FBLA_SCHOOL_NAMES):
            school_name = f"{fake.city()} High School FBLA"
        
        # Check if school already exists
        try:
            existing = supabase.table("schools").select("id").eq("name", school_name).execute()
            if existing.data and len(existing.data) > 0:
                school_ids.append(existing.data[0]["id"])
                skipped_count += 1
                print(f"  {school_name} - Already exists, skipping")
                continue
        except Exception as e:
            pass
        
        school_data = {
            "name": school_name,
            "address": fake.street_address(),
            "city": fake.city(),
            "state": fake.state_abbr(),
            "zip": fake.zipcode(),
            "email": f"fbla@{school_name.lower().replace(' ', '').replace('fbla', '')}.edu",
            "member_count": 0,
            "established_at": fake.date_between(start_date="-20y", end_date="-5y").isoformat()
        }
        
        try:
            result = supabase.table("schools").insert(school_data).execute()
            if result.data:
                school_ids.append(result.data[0]["id"])
                created_count += 1
                print(f"  ✓ Created: {school_data['name']}")
        except Exception as e:
            error_str = str(e)
            if "duplicate key" in error_str or "23505" in error_str:
                # School already exists, try to get its ID
                try:
                    existing = supabase.table("schools").select("id").eq("name", school_name).execute()
                    if existing.data and len(existing.data) > 0:
                        school_ids.append(existing.data[0]["id"])
                        skipped_count += 1
                        print(f"  ⚠ Already exists: {school_name}")
                except:
                    print(f"  ✗ Failed to create school: {e}")
            else:
                print(f"  ✗ Failed to create school: {e}")
    
    print(f"  Total: {len(school_ids)} schools ({created_count} created, {skipped_count} already existed)")
    return school_ids


def create_students_with_auth(school_ids: List[str], count: int = 20) -> List[str]:
    """Create students with corresponding auth users"""
    print(f"\nCreating {count} students with auth users...")
    student_ids = []
    default_password = "FBLA2024!"
    created_count = 0
    skipped_count = 0
    
    for i in range(count):
        name = fake.name()
        email = f"student{i+1}@fbla.test"
        school_id = school_ids[i % len(school_ids)] if school_ids else None
        
        # Check if student already exists
        try:
            existing = supabase.table("students").select("id").eq("email", email).execute()
            if existing.data and len(existing.data) > 0:
                student_id = existing.data[0]["id"]
                student_ids.append(student_id)
                skipped_count += 1
                print(f"  User {i+1}/{count}: {name} ({email}) - Already exists, skipping")
                
                # Ensure preferences exist for existing student
                try:
                    existing_prefs = supabase.table("user_preferences").select("id").eq("student_id", student_id).execute()
                    if not existing_prefs.data or len(existing_prefs.data) == 0:
                        preferences_data = {
                            "student_id": student_id,
                            "font_size": "medium",
                            "high_contrast": False,
                            "reduced_motion": False,
                            "screen_reader_optimized": False,
                            "keyboard_navigation_enhanced": False,
                            "color_blind_mode": "none"
                        }
                        supabase.table("user_preferences").insert(preferences_data).execute()
                except Exception:
                    pass
                
                continue
        except Exception as e:
            pass
        
        # Generate new UUID for new student
        student_id = str(uuid.uuid4())
        
        print(f"  Creating user {i+1}/{count}: {name}...")
        auth_created = create_auth_user(email, default_password, student_id, name)
        
        if not auth_created:
            # Check if auth user already exists (might have been created in previous run)
            existing_auth = list_auth_users()
            existing_auth_user = next((u for u in existing_auth if u.get("email") == email), None)
            if existing_auth_user:
                student_id = existing_auth_user.get("id")
                print(f"    ⚠ Auth user exists, using existing ID")
            else:
                print(f"    ⚠ Skipping student profile (auth creation failed)")
                continue
        
        student_data = {
            "id": student_id,
            "name": name,
            "email": email,
            "school_id": school_id,
            "bio": random.choice([
                f"Passionate about {random.choice(['business', 'marketing', 'finance', 'technology'])}. Competing in {random.choice(FBLA_EVENTS[:5])}.",
                f"FBLA member since {random.randint(2020, 2023)}. Love competing and learning!",
                f"Future business leader. Excited about {random.choice(['entrepreneurship', 'accounting', 'management'])}!",
                None
            ]),
            "follower_count": 0,
            "following_count": 0,
            "awards": [
                {
                    "title": random.choice(["State Champion", "Regional Winner", "National Qualifier", "Chapter Award"]),
                    "event": random.choice(FBLA_EVENTS[:15]),
                    "icon": random.choice(["🏆", "🥇", "⭐", "🎖️"])
                }
            ] if random.random() > 0.4 else [],
            "interests": random.sample([
                "Business", "Marketing", "Finance", "Technology", "Leadership",
                "Entrepreneurship", "Accounting", "Management", "Economics"
            ], k=random.randint(2, 5))
        }
        
        try:
            result = supabase.table("students").insert(student_data).execute()
            if result.data:
                student_ids.append(student_id)
                created_count += 1
                print(f"    ✓ Created: {name} ({email})")
                
                # Create default user preferences for the student
                try:
                    preferences_data = {
                        "student_id": student_id,
                        "font_size": "medium",
                        "high_contrast": False,
                        "reduced_motion": False,
                        "screen_reader_optimized": False,
                        "keyboard_navigation_enhanced": False,
                        "color_blind_mode": "none"
                    }
                    supabase.table("user_preferences").insert(preferences_data).execute()
                except Exception as pref_error:
                    # Preferences creation is optional, don't fail the whole student creation
                    pass
        except Exception as e:
            error_str = str(e)
            if "duplicate key" in error_str or "23505" in error_str:
                # Student already exists, try to get their ID
                try:
                    existing = supabase.table("students").select("id").eq("email", email).execute()
                    if existing.data and len(existing.data) > 0:
                        student_id = existing.data[0]["id"]
                        student_ids.append(student_id)
                        skipped_count += 1
                        print(f"    ⚠ Already exists, using existing: {name} ({email})")
                        
                        # Ensure preferences exist for existing student
                        try:
                            existing_prefs = supabase.table("user_preferences").select("id").eq("student_id", student_id).execute()
                            if not existing_prefs.data or len(existing_prefs.data) == 0:
                                preferences_data = {
                                    "student_id": student_id,
                                    "font_size": "medium",
                                    "high_contrast": False,
                                    "reduced_motion": False,
                                    "screen_reader_optimized": False,
                                    "keyboard_navigation_enhanced": False,
                                    "color_blind_mode": "none"
                                }
                                supabase.table("user_preferences").insert(preferences_data).execute()
                        except Exception:
                            pass
                    else:
                        print(f"    ✗ Failed to create student profile: {e}")
                except:
                    print(f"    ✗ Failed to create student profile: {e}")
            else:
                print(f"    ✗ Failed to create student profile: {e}")
    
    print(f"\n  ✓ Total: {len(student_ids)} students ({created_count} created, {skipped_count} already existed)")
    print(f"  Default password for all users: {default_password}")
    return student_ids


def create_school_roles(student_ids: List[str], school_ids: List[str]) -> None:
    """Create school roles for students"""
    print(f"\nCreating school roles...")
    
    role_counts = {"President": 1, "Vice President": 1, "Secretary": 1, "Treasurer": 1, "Historian": 1}
    
    for school_id in school_ids:
        school_students = [s for i, s in enumerate(student_ids) if i % len(school_ids) == school_ids.index(school_id)]
        
        if not school_students:
            continue
        
        assigned_roles = []
        for role, count in role_counts.items():
            if school_students and len(assigned_roles) < len(school_students):
                student_id = school_students[len(assigned_roles)]
                role_data = {
                    "student_id": student_id,
                    "school_id": school_id,
                    "role": role
                }
                try:
                    supabase.table("school_roles").insert(role_data).execute()
                    assigned_roles.append(role)
                    print(f"  ✓ {role} at school")
                except:
                    pass
        
        for student_id in school_students[len(assigned_roles):]:
            role_data = {
                "student_id": student_id,
                "school_id": school_id,
                "role": "Member"
            }
            try:
                supabase.table("school_roles").insert(role_data).execute()
            except:
                pass


def create_posts(student_ids: List[str], count: int = 30) -> List[str]:
    """Create realistic FBLA posts"""
    print(f"\nCreating {count} posts...")
    post_ids = []
    
    for _ in range(count):
        author_id = random.choice(student_ids) if student_ids else None
        if not author_id:
            continue
        
        post_data = {
            "content": random.choice(FBLA_POST_CONTENT),
            "author_id": author_id,
            "like_count": 0,
            "comment_count": 0
        }
        
        try:
            result = supabase.table("posts").insert(post_data).execute()
            if result.data:
                post_ids.append(result.data[0]["id"])
        except Exception as e:
            pass
    
    print(f"  ✓ Created {len(post_ids)} posts")
    return post_ids


def create_likes(post_ids: List[str], student_ids: List[str]) -> None:
    """Create likes for posts"""
    print(f"\nCreating likes...")
    like_count = 0
    
    for post_id in post_ids:
        num_likes = random.randint(0, min(8, len(student_ids)))
        likers = random.sample(student_ids, k=num_likes) if student_ids else []
        
        for student_id in likers:
            like_data = {
                "post_id": post_id,
                "user_id": student_id
            }
            try:
                supabase.table("likes").insert(like_data).execute()
                like_count += 1
            except:
                pass
    
    print(f"  ✓ Created {like_count} likes")


def create_comments(post_ids: List[str], student_ids: List[str], count: int = 25) -> None:
    """Create comments on posts"""
    print(f"\nCreating {count} comments...")
    comment_count = 0
    
    comment_texts = [
        "Great job! Keep it up!", "This is so inspiring!", "Congratulations!",
        "You've got this!", "Amazing work!", "Good luck at State!",
        "So proud of you!", "This is awesome!", "Keep pushing forward!",
        "You're doing great!", "Can't wait to see you compete!",
        "Our chapter is rooting for you!", "Well deserved!", "Incredible achievement!"
    ]
    
    for _ in range(count):
        post_id = random.choice(post_ids) if post_ids else None
        author_id = random.choice(student_ids) if student_ids else None
        
        if not post_id or not author_id:
            continue
        
        comment_data = {
            "content": random.choice(comment_texts),
            "author_id": author_id,
            "post_id": post_id
        }
        
        try:
            supabase.table("comments").insert(comment_data).execute()
            comment_count += 1
        except:
            pass
    
    print(f"  ✓ Created {comment_count} comments")


def create_resources(count: int = 60) -> None:
    """Create resources linked to FBLA events using event_name"""
    print(f"\nCreating {count} resources...")
    resource_count = 0
    
    # More detailed descriptions based on resource type
    description_templates = {
        "pdf": "This comprehensive study guide covers all the essential topics you need to master for {event} FBLA competitions. It includes practice problems, detailed explanations, real-world examples, and expert tips to help you succeed.",
        "video": "Step-by-step video tutorials for {event} competitive event. Learn from experienced FBLA competitors and coaches as they walk you through key concepts, strategies, and common pitfalls to avoid.",
        "link": "Access our comprehensive online course for {event}. This interactive learning platform includes modules, quizzes, progress tracking, and certification upon completion. Perfect for self-paced study."
    }
    
    for _ in range(count):
        event_name = random.choice(FBLA_EVENTS)
        resource_type = random.choice(RESOURCE_TYPES)
        template = random.choice(FBLA_RESOURCE_TITLES[resource_type])
        
        # Generate more realistic descriptions
        description = description_templates.get(
            resource_type,
            f"Comprehensive {resource_type.upper()} resource for {event_name} competitive event. Perfect for students preparing for FBLA competitions."
        ).format(event=event_name)
        
        resource_data = {
            "title": template.format(event=event_name),
            "description": description,
            "type": resource_type,
            "event_name": event_name,  # Primary way to link resources to events
            "category_id": None,  # Optional, kept for backward compatibility
            "url": (
                fake.url() if resource_type == "link" 
                else f"https://storage.supabase.co/object/public/media/{event_name.lower().replace(' ', '-').replace('&', 'and')}/{fake.uuid4()}.{resource_type}"
            ),
            "downloads": random.randint(0, 2000),
            # created_at and updated_at will be set automatically by database defaults
        }
        
        try:
            result = supabase.table("resources").insert(resource_data).execute()
            if result.data:
                resource_count += 1
        except Exception as e:
            # Print error for debugging but continue
            if "event_name" in str(e).lower() or "column" in str(e).lower():
                print(f"  ⚠ Warning: {e}")
                print(f"    Make sure you've run the schema migration to add event_name column!")
            pass
    
    print(f"  ✓ Created {resource_count} resources")
    if resource_count < count:
        print(f"  ⚠ Note: {count - resource_count} resources failed to create. Check database schema.")


def create_events(school_ids: List[str], count: int = 12) -> List[str]:
    """Create realistic FBLA events"""
    print(f"\nCreating {count} events...")
    event_ids = []
    
    event_templates = [
        ("Regional Leadership Conference", "regional"),
        ("State Business Competition", "state"),
        ("National FBLA Convention", "national"),
        ("Regional Skills Challenge", "regional"),
        ("State Entrepreneurship Fair", "state"),
        ("Regional Marketing Expo", "regional"),
        ("State Accounting Competition", "state"),
        ("Regional Technology Showcase", "regional"),
        ("State Business Plan Pitch", "state"),
        ("Regional Career Development", "regional"),
        ("State Public Speaking Championship", "state"),
        ("Regional Coding Competition", "regional")
    ]
    
    for i in range(count):
        template_idx = i % len(event_templates)
        title, level = event_templates[template_idx]
        
        days_offset = random.randint(0, 180)
        start_date = (datetime.now() + timedelta(days=days_offset)).date()
        end_date = start_date + timedelta(days=random.randint(1, 3))
        
        event_data = {
            "title": title,
            "description": f"Join us for the {level.title()} {title}. This event brings together FBLA members from across the region to compete, network, and develop leadership skills. Features include competitive events, workshops, and keynote speakers.",
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "location": f"{fake.city()}, {fake.state_abbr()}",
            "level": level,
            "organizer_id": random.choice(school_ids) if school_ids else None
        }
        
        try:
            result = supabase.table("events").insert(event_data).execute()
            if result.data:
                event_ids.append(result.data[0]["id"])
                print(f"  ✓ Created: {title}")
        except Exception as e:
            pass
    
    return event_ids


def create_event_registrations(event_ids: List[str], student_ids: List[str]) -> None:
    """Create event registrations"""
    print(f"\nCreating event registrations...")
    registration_count = 0
    
    for event_id in event_ids:
        num_registrations = random.randint(3, min(10, len(student_ids)))
        registrants = random.sample(student_ids, k=num_registrations) if student_ids else []
        
        for student_id in registrants:
            registration_data = {
                "event_id": event_id,
                "student_id": student_id
            }
            try:
                supabase.table("event_registrations").insert(registration_data).execute()
                registration_count += 1
            except:
                pass
    
    print(f"  ✓ Created {registration_count} registrations")


def create_follows(student_ids: List[str]) -> None:
    """Create follow relationships (avoid self-follows)"""
    print(f"\nCreating follow relationships...")
    follow_count = 0
    
    for _ in range(min(40, len(student_ids) * 2)):
        follower_id = random.choice(student_ids)
        following_id = random.choice(student_ids)
        
        if follower_id == following_id:
            continue
        
        follow_data = {
            "follower_id": follower_id,
            "following_id": following_id
        }
        
        try:
            supabase.table("student_follows").insert(follow_data).execute()
            follow_count += 1
        except:
            pass
    
    print(f"  ✓ Created {follow_count} follow relationships")


def create_chats(student_ids: List[str], count: int = 8) -> List[str]:
    """Create chats (avoiding recursive relationships)"""
    print(f"\nCreating {count} chats...")
    chat_ids = []
    
    for _ in range(count):
        chat_type = random.choice(CHAT_TYPES)
        creator_id = random.choice(student_ids) if student_ids else None
        
        if not creator_id:
            continue
        
        chat_data = {
            "type": chat_type,
            "created_by": creator_id
        }
        
        try:
            result = supabase.table("chats").insert(chat_data).execute()
            if result.data:
                chat_id = result.data[0]["id"]
                chat_ids.append(chat_id)
                
                if chat_type == "direct":
                    other_participant = random.choice([s for s in student_ids if s != creator_id])
                    participants = [creator_id, other_participant]
                else:
                    others = random.sample(
                        [s for s in student_ids if s != creator_id],
                        k=min(random.randint(2, 4), len(student_ids) - 1)
                    )
                    participants = [creator_id] + others
                
                for student_id in participants:
                    participant_data = {
                        "chat_id": chat_id,
                        "student_id": student_id
                    }
                    try:
                        supabase.table("chat_participants").insert(participant_data).execute()
                    except:
                        pass
                
                print(f"  ✓ Created {chat_type} chat with {len(participants)} participants")
        except Exception as e:
            pass
    
    return chat_ids


def create_messages(chat_ids: List[str], student_ids: List[str], count: int = 40) -> None:
    """Create messages in chats"""
    print(f"\nCreating {count} messages...")
    message_count = 0
    
    message_texts = [
        "Hey! How's your preparation going?",
        "Good luck on your competition!",
        "See you at the meeting tomorrow",
        "Great job on your presentation!",
        "Can you help me with the study guide?",
        "Thanks for sharing the resources!",
        "Let's practice together this weekend",
        "Congratulations on qualifying for State!",
        "The event was amazing!",
        "Looking forward to working together",
        "Our chapter meeting is at 3pm",
        "Don't forget about the practice test",
        "See you at Regionals!",
        "Thanks for the study tips!"
    ]
    
    for _ in range(count):
        chat_id = random.choice(chat_ids) if chat_ids else None
        author_id = random.choice(student_ids) if student_ids else None
        
        if not chat_id or not author_id:
            continue
        
        message_data = {
            "content": random.choice(message_texts),
            "author_id": author_id,
            "chat_id": chat_id
        }
        
        try:
            supabase.table("messages").insert(message_data).execute()
            message_count += 1
        except:
            pass
    
    print(f"  ✓ Created {message_count} messages")


# ============================================================================
# Verification and Cleanup
# ============================================================================

def verify_seeding() -> None:
    """Verify that seeding was successful"""
    print("=" * 60)
    print("Verifying Database Seeding")
    print("=" * 60)
    print()
    
    tables = {
        "schools": 1,
        "students": 1,
        "posts": 1,
        "resources": 1,
        "events": 1,
        "chats": 1,
        "likes": 0,
        "comments": 0,
        "event_registrations": 0,
        "user_preferences": 1,
        "social_connections": 0,
        "social_imports": 0,
        "oauth_states": 0,
        "chat_requests": 0,
    }
    
    all_good = True
    for table, min_count in tables.items():
        try:
            pk = "state" if table == "oauth_states" else "id"
            result = supabase.table(table).select(pk, count="exact").limit(1).execute()
            count = result.count if hasattr(result, "count") else (len(result.data) if result.data else 0)
            status = "✓" if count >= min_count else "✗"
            print(f"{status} {table:20s} {count:4d} records")
            if count < min_count:
                all_good = False
        except Exception as e:
            print(f"✗ {table:20s} Error: {e}")
            all_good = False
    
    print()
    if all_good:
        print("✓ All tables have data!")
    else:
        print("✗ Some tables are missing data. Run 'python scripts/seed.py seed'")
    
    # Check auth users
    try:
        result = supabase.table("students").select("id, email").limit(5).execute()
        if result.data:
            print()
            print("Sample students (auth users should exist for these):")
            for student in result.data:
                print(f"  - {student['email']} (ID: {student['id']})")
    except:
        pass


def cleanup_auth_users() -> None:
    """Delete seeded auth users"""
    print("=" * 60)
    print("Cleanup Auth Users")
    print("=" * 60)
    print()
    
    users = list_auth_users()
    
    if not users:
        print("No auth users found.")
        return
    
    seeded_users = [u for u in users if u.get("email", "").startswith("student") and "@fbla.test" in u.get("email", "")]
    
    if not seeded_users:
        print("No seeded test users found.")
        print(f"Total users: {len(users)}")
        return
    
    print(f"Found {len(seeded_users)} seeded test users:")
    for user in seeded_users[:10]:
        print(f"  - {user.get('email')} (ID: {user.get('id')})")
    if len(seeded_users) > 10:
        print(f"  ... and {len(seeded_users) - 10} more")
    
    print()
    response = input(f"Delete {len(seeded_users)} seeded test users? (yes/no): ")
    if response.lower() not in ["yes", "y"]:
        print("Cancelled.")
        return
    
    deleted = 0
    for user in seeded_users:
        if delete_auth_user(user.get("id")):
            deleted += 1
            print(f"  ✓ Deleted: {user.get('email')}")
    
    print()
    print(f"✓ Deleted {deleted} auth users")


def cleanup_auth_users_all() -> None:
    """Delete ALL auth users (seeded and non-seeded). Use with caution."""
    print("=" * 60)
    print("Cleanup ALL Auth Users")
    print("=" * 60)
    print()
    
    users = list_auth_users()
    
    if not users:
        print("No auth users found.")
        return
    
    print(f"Found {len(users)} auth user(s) in total.")
    print()
    for user in users[:15]:
        print(f"  - {user.get('email', '?')} (ID: {user.get('id', '?')})")
    if len(users) > 15:
        print(f"  ... and {len(users) - 15} more")
    print()
    print("⚠ WARNING: This will delete ALL auth users, including non-seeded accounts.")
    print("  This cannot be undone.")
    print()
    response = input("Type 'yes' to delete ALL auth users: ")
    if response.strip().lower() not in ["yes", "y"]:
        print("Cancelled.")
        return
    
    deleted = 0
    for user in users:
        if delete_auth_user(user.get("id")):
            deleted += 1
            print(f"  ✓ Deleted: {user.get('email', '?')}")
    
    print()
    print(f"✓ Deleted {deleted} auth users")


# ============================================================================
# Main Seeding Function
# ============================================================================

def seed_database(count: int = 20) -> None:
    """Main seeding function"""
    try:
        # Create data in order (respecting foreign keys)
        school_ids = create_schools(count=5)
        student_ids = create_students_with_auth(school_ids, count=count)
        create_school_roles(student_ids, school_ids)
        post_ids = create_posts(student_ids, count=30)
        create_likes(post_ids, student_ids)
        create_comments(post_ids, student_ids, count=25)
        create_resources(count=60)
        event_ids = create_events(school_ids, count=12)
        create_event_registrations(event_ids, student_ids)
        create_follows(student_ids)
        chat_ids = create_chats(student_ids, count=8)
        create_messages(chat_ids, student_ids, count=40)
        
        print()
        print("=" * 60)
        print("✓ Database seeding completed successfully!")
        print("=" * 60)
        print()
        print("Summary:")
        print(f"  - Schools: {len(school_ids)}")
        print(f"  - Students: {len(student_ids)}")
        print(f"  - Posts: {len(post_ids)}")
        print(f"  - Resources: 60")
        print(f"  - Events: {len(event_ids)}")
        print(f"  - Chats: {len(chat_ids)}")
        print()
        print("Login Credentials:")
        print(f"  Email format: student1@fbla.test, student2@fbla.test, etc.")
        print(f"  Password: FBLA2024!")
        print()
        print("⚠ Note: All users have been created with auth accounts.")
        print("  You can sign in immediately with the credentials above.")
        
    except Exception as e:
        print()
        print("=" * 60)
        print("✗ Error during seeding:")
        print(f"  {str(e)}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        sys.exit(1)


# ============================================================================
# CLI Interface
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="FBLA Engage Database Seeding and Management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/seed.py seed                    # Seed database
  python scripts/seed.py seed --reset            # Reset and seed
  python scripts/seed.py seed --count=50         # Seed with 50 students
  python scripts/seed.py verify                  # Verify seeding
  python scripts/seed.py cleanup-auth            # Delete seeded auth users only
  python scripts/seed.py cleanup-auth-all        # Delete ALL auth users
  python scripts/seed.py reset                   # Reset database only
  python scripts/seed.py reset --auth            # Reset database and auth users
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Seed command
    seed_parser = subparsers.add_parser("seed", help="Seed the database")
    seed_parser.add_argument("--reset", action="store_true", help="Reset database before seeding")
    seed_parser.add_argument("--count", type=int, default=20, help="Number of students to create (default: 20)")
    seed_parser.add_argument("--auth", action="store_true", help="Also reset auth users when using --reset")
    
    # Verify command
    subparsers.add_parser("verify", help="Verify database seeding")
    
    # Cleanup commands
    subparsers.add_parser("cleanup-auth", help="Delete seeded auth users only (student*@fbla.test)")
    subparsers.add_parser("cleanup-auth-all", help="Delete ALL auth users (use with caution)")
    
    # Reset command
    reset_parser = subparsers.add_parser("reset", help="Reset database (delete all data)")
    reset_parser.add_argument("--auth", action="store_true", help="Also delete auth users")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    if args.command == "seed":
        if args.reset:
            response = input("This will DELETE ALL DATA and reset the database. Continue? (yes/no): ")
            if response.lower() not in ["yes", "y"]:
                print("Seeding cancelled.")
                return
            reset_database(include_auth=args.auth)
        else:
            response = input("This will populate your database with test data. Continue? (yes/no): ")
            if response.lower() not in ["yes", "y"]:
                print("Seeding cancelled.")
                return
        
        seed_database(count=args.count)
    
    elif args.command == "verify":
        verify_seeding()
    
    elif args.command == "cleanup-auth":
        cleanup_auth_users()
    
    elif args.command == "cleanup-auth-all":
        cleanup_auth_users_all()
    
    elif args.command == "reset":
        response = input("This will DELETE ALL DATA. Continue? (yes/no): ")
        if response.lower() not in ["yes", "y"]:
            print("Reset cancelled.")
            return
        reset_database(include_auth=args.auth)


if __name__ == "__main__":
    main()
