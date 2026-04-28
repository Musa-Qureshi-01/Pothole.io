# Supabase to NeonDB Migration Summary

## Overview
This document summarizes the migration of Pothole.io from Supabase to NeonDB with Clerk authentication.

## Migration Date
April 28, 2026

## Changes Made

### 1. Authentication Migration
- **From**: Supabase Auth (email/password with JWT)
- **To**: Clerk (production-ready authentication service)
- **Reason**: Neon Auth SDK is in beta and unstable; Clerk provides a mature, India-safe authentication solution

**Files Changed:**
- `frontend/package.json` - Added `@clerk/clerk-react`, removed `@supabase/supabase-js`
- `frontend/src/main.tsx` - Replaced SupabaseAuthProvider with ClerkProvider
- `frontend/src/context/ClerkAuthContext.tsx` - New Clerk auth context
- `frontend/src/context/SupabaseAuthContext.tsx` - Deleted
- `frontend/src/lib/supabaseClient.ts` - Deleted
- `frontend/src/lib/clerk.ts` - Deleted (unused)
- `frontend/src/lib/neonAuth.ts` - Deleted (unused)

**All pages updated to use Clerk auth context:**
- LoginPage.tsx - Redirects to Clerk's built-in sign-in
- SignupPage.tsx - Redirects to Clerk's built-in sign-up
- ProfilePage.tsx
- WorkerTaskPage.tsx
- PredictionPage.tsx
- EnhancedPredictionPage.tsx
- EnhancedLeaderboardPage.tsx
- AdminDashboard.tsx
- ChatBot.tsx
- ProtectedRoute.tsx
- Layout.tsx
- App.tsx

### 2. Database Migration
- **From**: Supabase PostgreSQL with Supabase client SDK
- **To**: NeonDB with Neon Data API (REST endpoints)

**Schema Changes:**
- Created `backend/neon_schema.sql` with standard PostgreSQL schema
- Removed Supabase-specific features (auth.users dependency, RLS policies)
- Added standalone users table with password_hash
- Added auto-updating updated_at triggers
- Added proper indexes for performance

**Files Changed:**
- `backend/neon_schema.sql` - New Neon-compatible schema
- `frontend/src/lib/neonDataApi.ts` - New Neon Data API client
- `frontend/src/api/neon.ts` - New database operations using Neon Data API
- `frontend/src/api/reports.ts` - Re-exported Neon functions for backward compatibility
- `frontend/src/api/supabase.ts` - Deleted
- `frontend/src/hooks/useSupabase.ts` - Deleted

**Database Operations Migrated:**
- Users: create, fetch by ID, update
- Reports: save, fetch user reports, fetch all, update status
- Leaderboard: update, fetch
- Tasks: fetch worker tasks, update status
- Chat Messages: save, fetch history

### 3. Backend Migration
- **From**: Supabase Python client
- **To**: PostgreSQL via psycopg2 (prepared for future use)

**Files Changed:**
- `requirements.txt` - Replaced `supabase>=1.0` with `psycopg2-binary>=2.9`
- `backend/app/main.py` - Removed supabase_webhook router
- `backend/app/api/supabase_webhook.py` - Deleted

### 4. Storage Migration
- **Status**: Placeholder implementation
- **From**: Supabase Storage
- **To**: To be implemented (Cloudflare R2 recommended)
- **Current State**: Image upload functions return placeholder URLs

**Files with TODO comments for storage:**
- `frontend/src/api/reports.ts` - uploadImage function
- `frontend/src/pages/WorkerTaskPage.tsx` - uploadImage function
- `frontend/src/pages/PredictionPage.tsx` - Image upload logic

### 5. Environment Variables
- **From**: Supabase URL and keys
- **To**: Clerk publishable key and Neon Data API URL

**New Environment Variables:**
```env
# Frontend (.env.local)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
VITE_NEON_API_URL=https://ep-ancient-pond-aoaofy0n.apirest.c-2.ap-southeast-1.aws.neon.tech/neondb/rest/v1
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_API_URL=http://127.0.0.1:8000

# Backend (.env)
DATABASE_URL=postgresql://username:password@ep-ancient-pond-aoaofy0n.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
CORS_ORIGINS=http://localhost:5174,http://localhost:3000
```

**Removed Environment Variables:**
```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_KEY
```

## Setup Instructions

### 1. Clerk Setup
1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Get your publishable key from Clerk Dashboard
4. Add `VITE_CLERK_PUBLISHABLE_KEY` to `frontend/.env.local`

### 2. NeonDB Setup
1. Your Neon project is already configured:
   - Project ID: royal-rain-04612188
   - Data API URL: https://ep-ancient-pond-aoaofy0n.apirest.c-2.ap-southeast-1.aws.neon.tech/neondb/rest/v1
2. Run the schema migration:
   ```bash
   # Connect to Neon SQL Editor
   # Run the contents of backend/neon_schema.sql
   ```
3. Add `VITE_NEON_API_URL` to `frontend/.env.local`
4. Add `DATABASE_URL` to `backend/.env`

### 3. Install Dependencies
```bash
# Frontend
cd frontend
npm install
npm uninstall @supabase/supabase-js
npm install @clerk/clerk-react

# Backend
cd backend
pip install -r requirements.txt
```

### 4. Run the Application
```bash
# Terminal 1: Backend
cd backend
python app/main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

## Testing Checklist

### Authentication Flow
- [ ] Sign up with Clerk
- [ ] Sign in with Clerk
- [ ] Session persistence
- [ ] Sign out
- [ ] Role-based access (citizen/worker/admin)

### Database Operations
- [ ] Create user profile
- [ ] Submit pothole report
- [ ] Fetch user reports
- [ ] Update report status
- [ ] Leaderboard updates
- [ ] Chat message history

### Known Limitations
1. **Image Upload**: Currently returns placeholder URLs. Need to implement Cloudflare R2 or similar storage solution.
2. **Real-time Updates**: Neon Data API doesn't support real-time subscriptions. Implemented polling (30-second intervals) for leaderboard.
3. **Clerk UI**: Currently redirects to Clerk's built-in auth pages. Can implement custom Clerk components for branded experience.

## Rollback Plan

If issues arise, rollback steps:
1. Restore `frontend/package.json` with Supabase dependencies
2. Restore `frontend/src/lib/supabaseClient.ts`
3. Restore `frontend/src/context/SupabaseAuthContext.tsx`
4. Revert all page imports to use SupabaseAuthContext
5. Restore `backend/requirements.txt` with supabase client
6. Restore `backend/app/api/supabase_webhook.py`
7. Use Supabase database connection

## Next Steps

1. **Implement Storage Solution**: Set up Cloudflare R2 or similar for image uploads
2. **Custom Clerk UI**: Implement branded Clerk authentication components
3. **Backend PostgreSQL**: Implement direct PostgreSQL connections in backend if needed
4. **Data Migration**: Migrate existing data from Supabase to NeonDB (if any)
5. **Testing**: Comprehensive testing of all features
6. **Deployment**: Update deployment configurations with new environment variables

## Support

For issues related to:
- **Clerk**: https://clerk.com/docs
- **NeonDB**: https://neon.com/docs
- **This migration**: Check this document and the code changes
