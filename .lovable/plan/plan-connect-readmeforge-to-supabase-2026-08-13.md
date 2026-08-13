# Plan - Connect READMEForge to Supabase

Connect the frontend to Lovable Cloud (Supabase) for data persistence and authentication, replacing mock data while preserving the existing UI and functionality.

## User Review Required

> [!IMPORTANT]
> - Do you want a dedicated `/auth` page for login/signup, or should I integrate it directly into the landing page?
> - Should I keep the demo data available for unauthenticated users, or redirect them to sign in immediately when accessing the dashboard?

## Proposed Changes

### Database & Security
- Refine the existing schema to match the specific column requirements (adding `existing_readme`, granular scores, etc.).
- Ensure robust RLS policies are in place so users only access their own data.
- Add performance indexes for `user_id` and `repository_id` fields.

### Authentication
- Implement Supabase Auth.
- Create an `Auth` component/page for user onboarding.
- Update `src/routes/__root.tsx` to handle authentication state globally.
- Protect `/dashboard`, `/analyzer`, `/editor`, `/health`, and `/settings` routes using a route guard.

### Data Integration
- **Dashboard**: Replace static mock repositories with a query to the `repositories` table.
- **Analyzer**: Update the simulation to save the "analyzed" repository data into `repositories` and `repository_analyses` tables upon completion.
- **Editor**: Implement saving and loading of README documents to/from the `readme_documents` table.
- **Health Score**: Link the health report to data stored in the `readme_scores` table.
- **Settings**: Enable updating the `profiles` table for user display names and avatars.

### Infrastructure
- Ensure `src/start.ts` includes the necessary middleware to attach the Supabase bearer token to server functions (if any are added, though primarily using client-side SDK for this scope).

## Technical Details
- Use `@supabase/supabase-js` for client-side data operations.
- Utilize TanStack Query (`useQuery`, `useMutation`) for efficient data fetching and caching, integrated with the existing TanStack Start architecture.
- Follow the "Security Definer" pattern for any complex logic that needs to bypass RLS safely on the server.
