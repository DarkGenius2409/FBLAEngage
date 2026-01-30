# Social Media Integration Setup

This guide explains how to configure the Instagram and TikTok OAuth integration for FBLA Engage.

## Overview

The app supports connecting Instagram and TikTok accounts to:
- Display social profile links on user profiles
- Automatically import posts from connected accounts

## Prerequisites

- A Supabase project with Edge Functions enabled
- Meta Developer account (for Instagram)
- TikTok for Developers account

## Environment Variables

Add the following to your Supabase Edge Functions environment:

```bash
# Instagram (Meta) OAuth
INSTAGRAM_CLIENT_ID=your_instagram_app_id
INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
INSTAGRAM_REDIRECT_URI=https://your-project.supabase.co/functions/v1/instagram-callback

# TikTok OAuth
TIKTOK_CLIENT_KEY=your_tiktok_client_key
TIKTOK_CLIENT_SECRET=your_tiktok_client_secret
TIKTOK_REDIRECT_URI=https://your-project.supabase.co/functions/v1/tiktok-callback

# Encryption key for storing tokens (32 bytes)
OAUTH_ENCRYPTION_KEY=your_32_byte_encryption_key

# App URL scheme for redirects
APP_URL=fblaengage://
```

Also add to your frontend `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Platform Setup

### Instagram (Meta)

1. Go to [Meta for Developers](https://developers.facebook.com)
2. Create a new app or use an existing one
3. Add the **Instagram Basic Display** product
4. In Instagram Basic Display settings:
   - Add OAuth Redirect URI: `https://your-project.supabase.co/functions/v1/instagram-callback`
   - Add Deauthorize Callback URL
   - Add Data Deletion Request URL
5. Get your Instagram App ID and Secret
6. Add test users in App Roles > Roles (required for development)
7. Submit for App Review (required for production)

**Required Scopes:**
- `user_profile` - Access user profile info
- `user_media` - Access user's media

### TikTok

1. Go to [TikTok for Developers](https://developers.tiktok.com)
2. Create a new app
3. Enable **Login Kit** product
4. Add Redirect URI: `https://your-project.supabase.co/functions/v1/tiktok-callback`
5. Get your Client Key and Client Secret
6. Submit for App Review

**Required Scopes:**
- `user.info.basic` - Access user profile info
- `video.list` - Access user's videos

## Database Setup

Run the SQL migration to create the required tables:

```bash
# Using Supabase CLI
supabase db push sql/SOCIAL_CONNECTIONS_SCHEMA.sql

# Or run in Supabase SQL Editor
# Copy contents of sql/SOCIAL_CONNECTIONS_SCHEMA.sql
```

## Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy all functions
supabase functions deploy instagram-auth
supabase functions deploy instagram-callback
supabase functions deploy instagram-sync
supabase functions deploy tiktok-auth
supabase functions deploy tiktok-callback
supabase functions deploy tiktok-sync
supabase functions deploy social-disconnect
```

Set the environment variables:

```bash
supabase secrets set INSTAGRAM_CLIENT_ID=your_id
supabase secrets set INSTAGRAM_CLIENT_SECRET=your_secret
supabase secrets set INSTAGRAM_REDIRECT_URI=your_uri
supabase secrets set TIKTOK_CLIENT_KEY=your_key
supabase secrets set TIKTOK_CLIENT_SECRET=your_secret
supabase secrets set TIKTOK_REDIRECT_URI=your_uri
supabase secrets set OAUTH_ENCRYPTION_KEY=your_key
supabase secrets set APP_URL=fblaengage://
```

## Native App Configuration

### iOS

The URL scheme is already configured in `ios/App/App/Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>com.engage.fbla</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>fblaengage</string>
        </array>
    </dict>
</array>
```

### Android

The intent filter is already configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="fblaengage" />
</intent-filter>
```

## How It Works

### Connection Flow

1. User taps "Connect" on their profile
2. App calls the `{platform}-auth` edge function to get OAuth URL
3. In-app browser opens the OAuth authorization page
4. User logs in and approves access
5. Platform redirects to `{platform}-callback` edge function
6. Edge function exchanges code for access token
7. Tokens are encrypted and stored in `social_connections` table
8. Edge function redirects to `fblaengage://social-callback?status=success`
9. App detects the deep link and refreshes connection status

### Sync Flow

1. User taps "Sync Now" on their profile
2. App calls the `{platform}-sync` edge function
3. Edge function fetches recent posts from the platform
4. New posts are created in FBLA Engage with imported content
5. Import records are stored in `social_imports` table to prevent duplicates

## Security Considerations

1. **Token Encryption**: Access tokens are encrypted using AES-GCM before storage
2. **State Parameter**: OAuth flows use state parameter for CSRF protection
3. **Server-side Token Exchange**: Auth codes are exchanged on the server, not client
4. **Row Level Security**: Users can only access their own connections

## Troubleshooting

### "Invalid or expired state" error
- The OAuth flow took too long (>10 minutes)
- Try connecting again

### "Token expired" error
- The access token has expired
- Disconnect and reconnect the account
- (Future: implement automatic token refresh)

### Posts not importing
- Check that the account has public posts
- Ensure the app has the required permissions
- Check the Supabase function logs for errors

## Rate Limits

- **Instagram**: ~200 API calls per hour per user
- **TikTok**: Similar limits apply

The sync function fetches up to 20 recent posts per sync to stay within limits.
