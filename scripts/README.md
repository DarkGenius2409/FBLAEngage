# Database Seeding Script

Single comprehensive script for seeding, verifying, and managing test data.

**Main Script:** `scripts/seed.py`

## Features

✅ **Creates Real Supabase Auth Users** - Automatically creates auth accounts  
✅ **Respects Foreign Keys** - Creates data in correct order  
✅ **Respects Triggers** - Lets database triggers update counts  
✅ **Respects RLS** - Uses Service Role Key to bypass policies safely  
✅ **Avoids Recursion** - Chat relationships are non-recursive  
✅ **FBLA-Specific Content** - Realistic events, resources, posts  
✅ **Deterministic** - Uses seeds for reproducible data  
✅ **Safe Reset** - Can reset database before seeding  

## Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. **Configure environment variables:**
   
   Add to your `.env` file:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   
   **Important:** Use the Service Role Key (not the publishable key) for seeding.
   
   Find it in: Supabase Dashboard → Settings → API → `service_role` key

## Usage

### Basic Seeding

```bash
python scripts/seed.py seed
```

### Reset and Reseed

```bash
python scripts/seed.py seed --reset
```

This will:
1. Delete all existing data (respecting foreign keys)
2. Seed fresh data

### Reset with Auth Cleanup

```bash
python scripts/seed.py seed --reset --auth
```

Also deletes seeded auth users during reset.

### Custom Student Count

```bash
python scripts/seed.py seed --count=50
```

### Verify Seeding

```bash
python scripts/seed.py verify
```

### Cleanup Auth Users

```bash
python scripts/seed.py cleanup-auth
```

### Reset Database Only

```bash
python scripts/seed.py reset
python scripts/seed.py reset --auth  # Also delete auth users
```

## What Gets Created

- **5 Schools/Chapters** - Realistic FBLA chapters with addresses
- **20 Students** (default, configurable) - With auth users, profiles, awards, interests
- **School Roles** - President, VP, Secretary, Treasurer, etc.
- **30 Posts** - FBLA-specific content
- **Likes & Comments** - Realistic engagement
- **60 Resources** - Linked to FBLA events (PDFs, links, videos)
- **12 Events** - Regional, State, National events with dates
- **Event Registrations** - Students registered for events
- **Follow Relationships** - Student connections
- **8 Chats** - Direct and group chats (non-recursive)
- **40 Messages** - Chat messages

## Login Credentials

All test users are created with:
- **Email format:** `student1@fbla.test`, `student2@fbla.test`, etc.
- **Password:** `FBLA2024!`

You can sign in immediately with these credentials.

## Database Constraints

The script respects:
- ✅ Foreign key relationships
- ✅ Database triggers (member counts, like counts, etc.)
- ✅ RLS policies (uses Service Role Key)
- ✅ Unique constraints
- ✅ Check constraints (no self-follows)
- ✅ Non-recursive chat relationships

## Reproducibility

The script uses fixed seeds (`Faker.seed(42)`, `random.seed(42)`) for deterministic, reproducible data. Running it multiple times with `--reset` will create identical data.

## Troubleshooting

### "Missing environment variables"
- Make sure `.env` file exists in project root
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### "RLS policy violation"
- Make sure you're using Service Role Key (not publishable key)
- Service Role Key bypasses all RLS policies

### "Foreign key constraint violation"
- Make sure you've run `sql/schema.sql` first
- The script creates data in correct dependency order

### "Auth user creation failed"
- Check that Service Role Key has admin permissions
- Verify Supabase URL is correct
- Some errors are expected if users already exist (script continues)

### "Chat recursion error"
- The script uses non-recursive chat creation
- If you see this, check that `sql/FIX_CHAT_POLICIES.sql` was run

## All Commands

| Command | Description |
|---------|-------------|
| `python scripts/seed.py seed` | Seed the database |
| `python scripts/seed.py seed --reset` | Reset and seed |
| `python scripts/seed.py seed --count=50` | Seed with custom student count |
| `python scripts/seed.py verify` | Verify seeding was successful |
| `python scripts/seed.py cleanup-auth` | Delete seeded auth users |
| `python scripts/seed.py reset` | Reset database only |
| `python scripts/seed.py reset --auth` | Reset database and auth users |

## Safety Features

- ✅ Confirmation prompts before destructive operations
- ✅ Error handling for duplicate data
- ✅ Graceful degradation (continues on non-critical errors)
- ✅ Clear progress indicators
- ✅ Summary of created data
- ✅ Non-destructive by default (use --reset flag for cleanup)

## Customization

Edit `seed_database.py` to customize:
- Number of schools, students, posts, etc.
- FBLA event selection
- Content templates
- Data distribution
