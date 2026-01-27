# Clean Start Instructions for Supabase

This guide will help you completely reset your Supabase database and start fresh.

## ⚠️ WARNING
**This will DELETE ALL DATA** including:
- All users (auth and database)
- All tables
- All data in tables
- All policies, triggers, and functions

Make sure you have backups if you need any existing data!

## Step 1: Clear Authentication Users

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Select all users (or use the checkbox at the top)
4. Click **Delete** and confirm

Alternatively, you can use SQL:
```sql
-- Delete all auth users (run in SQL Editor)
DELETE FROM auth.users;
```

## Step 2: Clean Database Schema

1. Go to **SQL Editor** in Supabase Dashboard
2. Open the file `sql/CLEAN_DATABASE.sql`
3. Copy the entire contents
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl+Enter)
6. Wait for it to complete (should show "Success")

This will:
- Disable RLS on all tables
- Drop all policies
- Drop all triggers and functions
- Drop all tables
- Drop all custom types

## Step 3: Recreate Schema

1. In the SQL Editor, open `sql/schema.sql`
2. Copy the entire contents
3. Paste into the SQL Editor
4. Click **Run**
5. Wait for it to complete

This will create:
- All custom types
- All tables
- All triggers and functions
- All RLS policies

## Step 4: Verify Setup

Run this query to verify everything was created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

You should see all your tables and policies listed.

## Step 5: Test Authentication

1. Go to **Authentication** → **Users**
2. Try signing up a new user through your app
3. Verify the user appears in both `auth.users` and `public.students`

## Troubleshooting

### If you get "type already exists" errors:
- The CLEAN_DATABASE script should have removed them
- If not, manually drop types: `DROP TYPE IF EXISTS public.media_type CASCADE;` (repeat for all types)

### If you get "table already exists" errors:
- The CLEAN_DATABASE script should have removed them
- Check if tables still exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`
- Manually drop any remaining tables

### If policies still cause recursion:
- Make sure you ran the full `schema.sql` (not just parts)
- The updated schema should have non-recursive policies

## Next Steps

After a clean start:
1. Test user signup/signin
2. Test creating posts
3. Test creating chats
4. Test all major features

Your database is now fresh and ready to go! 🚀
