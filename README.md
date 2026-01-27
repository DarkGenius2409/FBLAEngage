# FBLA Engage

A social networking platform for FBLA (Future Business Leaders of America) members to connect, share resources, and collaborate.

## Features

- **Social Feed**: LinkedIn-style post feed with likes, comments, and shares
- **Calendar**: Color-coded events (Regional, State, National) with detailed information
- **Direct Messaging**: Real-time chat with video meeting capabilities
- **Profile Pages**: LinkedIn-style profiles with social media sync (Instagram/TikTok)
- **Resources**: Study materials, AI test generator, and chatbot assistant
- **Video Meetings**: Practice presentations with screen sharing via JitsiMeet

## Tech Stack

- **Frontend**: Vite + React + TypeScript + ShadCN UI
- **Backend**: Supabase (Database + Auth)
- **Video**: JitsiMeet
- **AI**: Google Gemini
- **Mobile**: Capacitor (for iOS/Android)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a [Supabase account](https://supabase.com) and create a new project
2. Go to Project Settings > API to get your project URL and publishable key
3. Run the database migrations (see Database Setup below)

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key

# Database (for Drizzle ORM - optional if using Supabase client)
DATABASE_URL=your_postgres_connection_string

# Google Gemini API (for AI features - Required for Test Generator and Chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key
# Get your key from: https://aistudio.google.com/app/apikey

# JitsiMeet (for video meetings)
VITE_JITSI_DOMAIN=meet.jit.si

# Instagram API (for social sync)
VITE_INSTAGRAM_CLIENT_ID=your_instagram_client_id
VITE_INSTAGRAM_CLIENT_SECRET=your_instagram_client_secret

# TikTok API (for social sync)
VITE_TIKTOK_CLIENT_KEY=your_tiktok_client_key
VITE_TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
```

### 4. Database Setup

The database schema and migration files are in the `sql/` directory:

1. **Full Schema**: Run `sql/schema.sql` in your Supabase SQL Editor to create all tables, types, triggers, and policies
2. **Updates Only**: If you already have the schema, use:
   - `sql/SCHEMA_UPDATE_ONLY.sql` - Adds missing RLS policies only
   - `sql/FIX_CHAT_POLICIES.sql` - Fixes chat policy recursion issues
   - `sql/UPDATE_RESOURCES_SCHEMA.sql` - Adds event_name field to resources table

Run the appropriate SQL file in your Supabase SQL Editor based on your setup needs.

### 5. Seed Test Data (Optional)

To populate the database with test data for development:

1. **Install Python dependencies:**
   ```bash
   pip install -r scripts/requirements.txt
   ```

2. **Add Service Role Key to `.env`:**
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
   Find this in Supabase Dashboard → Settings → API → `service_role` key

3. **Run the seeding script:**
   ```bash
   python scripts/seed.py seed
   ```
   
   Or reset and reseed:
   ```bash
   python scripts/seed.py seed --reset
   ```

   This creates:
   - 5 schools/chapters
   - 20 students (profiles)
   - 30 posts with likes and comments
   - 50 resources linked to FBLA events
   - 10 events with registrations
   - Follow relationships, chats, and messages

   **Note:** The script automatically creates auth users. All test users can sign in immediately.

See `scripts/README.md` for detailed instructions.

### 6. Enable Google OAuth (Optional)

1. In Supabase Dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials

### 7. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Authentication

The app uses Supabase Auth for authentication. Currently supported:

- Email/Password sign up and sign in
- Google OAuth (requires configuration in Supabase)

After sign up, a user profile is automatically created in the `students` table.

## Project Structure

```
src/
├── components/        # React components
│   ├── HomePage.tsx  # Main feed page
│   ├── CalendarPage.tsx
│   ├── ChatPage.tsx
│   ├── ProfilePage.tsx
│   ├── ResourcesPage.tsx
│   └── ui/           # ShadCN UI components
├── lib/
│   └── supabase.ts   # Supabase client configuration
├── supabase/
│   ├── schema.ts     # Database schema (Drizzle ORM)
│   ├── models.ts     # TypeScript types
│   └── db.ts         # Database client
└── App.tsx           # Main app component
```

## Development Status

✅ **Completed:**
- UI components and layouts
- Supabase authentication integration
- Database schema definition

🚧 **In Progress:**
- Backend API integration
- Real-time features

📋 **Todo:**
- Connect pages to Supabase database
- Implement media uploads
- Integrate JitsiMeet
- Integrate Gemini AI
- Set up Capacitor for mobile

## Original Design

The original project design is available at [Figma](https://www.figma.com/design/igT1YnKNMQmbKs5JHUyyFe/Social-Networking-App).
  