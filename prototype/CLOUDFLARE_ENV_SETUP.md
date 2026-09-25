# Cloudflare Pages Environment Variables Setup

## Required Environment Variables for AINA Frontend

The AINA frontend requires the following environment variables to be configured in Cloudflare Pages for authentication to work:

### Critical Authentication Variables (Required for Sign In to work)

1. **`VITE_SUPABASE_URL`**
   - Your Supabase project URL (e.g., `https://your-project.supabase.co`)
   - Must be a valid HTTPS URL
   - **Required** for Supabase client initialization

2. **`VITE_SUPABASE_PUBLISHABLE_KEY`**
   - Your Supabase anonymous/public key (not the service role key)
   - Found in Supabase dashboard under Project Settings > API
   - **Required** for Supabase client initialization

### Optional Variables

3. **`VITE_ADMIN_EMAIL`**
   - Admin email address for /admin access control
   - Default: `parthjbariya@gmail.com`
   - Must match RLS policies in `supabase/policies.sql`

4. **`VITE_USE_MOCK`**
   - Set to `false` to use live Supabase services
   - Set to `true` to use mock services (development only)
   - Default: `false`

### API Integration Variables (Optional)

5. **`VITE_S2_API_BASE_URL`**
   - S2 API base URL for map services
   - Leave empty if not using S2 integration

6. **`VITE_S3_API_BASE_URL`**
   - S3 API base URL for storage services
   - Leave empty if not using S3 integration

7. **`VITE_CHATBOT_API_URL`**
   - Chatbot API URL for AI features
   - Leave empty if not using chatbot integration

## How to Configure in Cloudflare Pages

1. Go to your Cloudflare Pages project dashboard
2. Navigate to **Settings** > **Environment variables**
3. Add the following variables:

   **Production environment:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   VITE_USE_MOCK=false
   ```

   **Preview environment:**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   VITE_ADMIN_EMAIL=your-admin-email@example.com
   VITE_USE_MOCK=false
   ```

## Important Notes

- **Never** commit the `.env` file to version control
- **Never** use service role keys in frontend environment variables
- The `VITE_` prefix is required for Vite to expose variables to the frontend
- After adding environment variables, you must redeploy your project for changes to take effect
- You can verify the configuration by checking the browser console for "Supabase is not configured" errors

## Troubleshooting

If the Sign In button still doesn't work after configuring environment variables:

1. Check the browser console for errors
2. Verify the environment variables are set in the correct environment (Production vs Preview)
3. Ensure the Supabase URL and key are correct
4. Check that your Supabase project is active and accessible
5. Verify email confirmation is enabled in Supabase Auth settings

## Current Status

The authentication code is correctly implemented but will fail silently if these environment variables are not configured. The error handling has been improved to display configuration errors to users.
