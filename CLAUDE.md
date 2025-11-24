# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm ci` - Install dependencies (preferred over npm install)
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:setup` - Automated database setup (creates all required tables)
- `npm run db:migrate` - Manual database migration
- `npm run db:migrate:auth` - Run authentication system migration
- `npm run db:migrate:feedback` - Run feedback system migration
- `npm run db:backup` - Create database backup
- `npm run db:restore <backup-file>` - Restore from backup
- `npm run db:status` - Check database status
- `npm run admin:manage` - Interactive admin role management tool
- `npm run service:setup` - Create service account for automated tasks (cron jobs)

## Project Architecture

This is a Next.js 15 football club registration website using **App Router** architecture with **React Query** for data management.

### App Router Structure
- `app/layout.tsx` - Root layout with QueryProvider, ErrorBoundary, ThemeProvider, and analytics
- `app/page.tsx` - Main registration page with random component selection
- `app/admin/page.tsx` - Admin dashboard for user management and banning
- `app/teams/page.tsx` - Team selection interface with drag-and-drop functionality
- `app/admin-logs/page.tsx` - Admin action logging interface
- `app/banned-players/page.tsx` - View and manage banned users
- `app/feedback/page.tsx` - Public feedback submission and voting interface
- `app/admin/feedback/page.tsx` - Admin feedback management and approval

### API Routes (App Router)
All API routes use Next.js 13+ App Router format with NextRequest/NextResponse:
- `app/api/register/route.ts` - Handle user registration/deletion with ban checking
- `app/api/users/route.ts` - Fetch registered users
- `app/api/allowed/route.ts` - Check if registration is currently allowed
- `app/api/verify/route.ts` - Verify user credentials
- `app/api/moneyDb/route.ts` - Financial tracking data
- `app/api/banned-users/route.ts` - Public banned users list
- `app/api/admin-logs/route.ts` - Admin action logs
- `app/api/feedback/route.ts` - Public feedback submission and retrieval (approved only)
- `app/api/feedback/vote/route.ts` - Vote on feedback submissions (upvote/downvote)
- `app/api/admin/` - Protected admin endpoints:
  - `auth/route.ts` - Admin authentication via Replit
  - `ban/route.ts` - Ban/unban users with logging
  - `banned/route.ts` - Admin-only banned users management
  - `users/route.ts` - Admin delete users
  - `users/verify/route.ts` - Toggle user verification status
  - `feedback/route.ts` - Admin feedback management (all submissions with user details)
  - `feedback/approve/route.ts` - Approve/reject feedback submissions
  - `feedback/status/route.ts` - Update feedback status (in_progress, completed)

### React Query Data Management
- **Provider Setup**: `providers/QueryProvider.tsx` with optimized caching and retry logic
- **Custom Hooks**: `hooks/useQueries.ts` - Centralized data fetching and mutations
- **Key Features**:
  - Automatic background refetching and caching
  - Optimistic updates with automatic cache invalidation
  - Consistent loading states and error handling across all components
  - React Query DevTools for debugging (development only)

### Data Fetching Hooks
Located in `hooks/useQueries.ts`:
- `useUsers()` - Registered users with 30s stale time
- `useAllowedStatus()` - Registration status with 30s refetch interval
- `useBannedUsers()` - Public banned users list
- `useMoney()` - Financial tracking data with 5min cache
- `useAdminAuth()` - Admin authentication (no retry on failure)
- `useAdminLogs()` - Admin action logs with 30s cache
- `useAdminBanned()` - Admin banned users management
- `useFeedback(type?)` - Public approved feedback with optional type filter
- `useUserVotes()` - Current user's votes on feedback
- `useAdminFeedback(filters?)` - Admin view of all feedback with filters

### Mutation Hooks
All mutations automatically invalidate related queries:
- `useRegisterUser()` - User registration with optimistic updates
- `useBanUser()` - Ban user with multi-cache invalidation
- `useUnbanUser()` - Unban user with logging
- `useAdminDeleteUser()` - Admin delete with logging
- `useVerifyUser()` - Toggle verification status
- `useSubmitFeedback()` - Submit new feedback (requires authentication)
- `useVoteFeedback()` - Vote on feedback (upvote/downvote)
- `useRemoveVote()` - Remove vote from feedback
- `useApproveFeedback()` - Admin approve/reject feedback
- `useUpdateFeedbackStatus()` - Admin update status (in_progress, completed)
- `useDeleteFeedback()` - Admin delete feedback submission

### Component Architecture
- `components/pages/` - Page components with React Query integration
- `components/` - Reusable components (ErrorBoundary, LoadingSpinner, TeamExporter, ThemeToggle)
- `contexts/ThemeContext.tsx` - Light/dark theme management (client-side)
- `providers/QueryProvider.tsx` - React Query configuration and DevTools

### Styling & CSS Architecture

**Tailwind CSS v4** is used throughout the application with a mobile-first, utility-first approach.

#### CSS Files
- `styles/globals.css` - **269 lines** (reduced from 1,022 lines)
  - Tailwind v4 imports: `@import "tailwindcss";`
  - Custom theme colors in `@theme` block
  - CSS variables for light/dark theme support
  - Toast notification styles (complex positioning)
  - Special event toast styles
- All page-specific CSS has been migrated to Tailwind utilities

#### Theme Configuration
**File**: `tailwind.config.ts`

Custom colors:
- `ft-primary`: #00babc (42 School teal)
- `ft-secondary`: #00807e (dark teal)
- `ft-accent`: #ff6b35 (orange accent)
- `ft-dark`: #1a1a1a (dark background)

Theme-aware CSS variables (support light/dark mode):
```css
[data-theme="light"] {
  --bg-primary: #ffffff
  --bg-secondary: #f6f9fc
  --bg-card: #fff0d4
  --text-primary: #525f7f
  --text-secondary: #424f6f
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a
  --bg-secondary: #2a2a2a
  --bg-card: #3a3a3a
  --text-primary: #e0e0e0
  --text-secondary: #b0b0b0
  /* ... */
}
```

#### Consistent Design Patterns

**Page Layout Structure** (use this for all pages):
```tsx
<div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
  <Navbar />
  <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
    <div className="max-w-6xl mx-auto"> {/* or max-w-7xl for wider pages */}
      {/* Page content */}
    </div>
  </main>
  <Footer />
</div>
```

**Button Styles** (use these patterns):
```tsx
// Primary action buttons
className="px-6 py-3 bg-ft-primary hover:bg-ft-secondary text-white font-medium rounded
           transition-all duration-200 transform hover:scale-105"

// Secondary/gray buttons
className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded
           transition-all duration-200"

// Delete/danger buttons
className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded
           transition-all duration-200"

// Back to home link
className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary
           text-white font-medium rounded transition-all duration-200 transform hover:scale-105"
```

**Card Styles**:
```tsx
// Standard card
className="rounded-lg shadow-md p-6"
style={{ backgroundColor: 'var(--bg-card)' }}

// Card with header
<div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
  <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>Title</h3>
  </div>
  <div className="p-6">{/* Content */}</div>
</div>
```

**Table Styles**:
```tsx
<div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <tr>
          <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Header
          </th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b" style={{ borderColor: 'var(--border-color)' }}>
          <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>Content</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

**Form Input Styles**:
```tsx
<input
  className="w-full px-4 py-3 rounded border transition-all duration-200
             focus:ring-2 focus:ring-ft-primary focus:outline-none"
  style={{
    backgroundColor: 'var(--input-bg)',
    borderColor: 'var(--border-color)',
    color: 'var(--text-primary)'
  }}
/>
```

**Loading States**:
```tsx
import LoadingSpinner from '../LoadingSpinner';

// Use this instead of custom loading text
{isLoading && (
  <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
    <LoadingSpinner message="Loading data..." />
  </div>
)}
```

**Mobile Navigation**:
- Fixed navbar at top with `fixed top-0 left-0 right-0 z-50`
- Hamburger menu on mobile (< 768px)
- Slide-out drawer with overlay
- All pages have `pt-24` on main content to account for fixed navbar

#### Responsive Breakpoints
- `sm:` - 640px (small tablets)
- `md:` - 768px (tablets)
- `lg:` - 1024px (laptops)
- `xl:` - 1280px (desktops)

#### Color Coding by Feature
- **Team 1**: blue (blue-500, blue-600)
- **Team 2**: green (green-500, green-600)
- **Team 3**: orange (orange-500, orange-600)
- **Verified/Success**: green-600
- **Error/Delete**: red-600
- **Warning/Accent**: ft-accent (orange)
- **Paid status**: var(--paid-bg) light blue/teal
- **Unpaid/Waitlist**: var(--unpaid-bg) light orange

#### Best Practices
1. **Always use theme-aware CSS variables** for backgrounds and text colors (not hardcoded colors)
2. **Use Tailwind utilities** for spacing, sizing, and layout
3. **Use inline styles with CSS variables** for theme-specific colors
4. **Follow the button patterns** for consistency across all pages
5. **Use LoadingSpinner component** instead of custom loading states
6. **Keep the layout structure** (min-h-screen, flex, flex-col, pt-24)
7. **Make all tables responsive** with overflow-x-auto wrapper

### Utility Functions
Centralized in `lib/utils/`:
- `db.ts` - PostgreSQL connection pool
- `adminLogger.ts` - Admin action logging system
- `verify_login.tsx` - 42 API integration for user verification
- `allowed_times.tsx` - Time-based registration control logic
- `player_limit.tsx` - Player capacity management (21 guaranteed spots)

### Database Schema
PostgreSQL database with tables:

**Core Registration Tables:**
- `players` - User registrations (name, intra, verified, created_at, user_id)
- `money` - Payment tracking with status
- `expenses` - Expense management
- `inventory` - Inventory management
- `banned_users` - User ban system with reason, duration, timestamps, and user_id
- `admin_logs` - Admin action logging with full audit trail and performed_by_user_id

**NextAuth.js Authentication Tables:**
- `users` - Authenticated users with role-based access (id, name, email, is_admin, created_at, updated_at)
- `accounts` - OAuth provider accounts linked to users (supports 42 Intra OAuth)
- `sessions` - Active user sessions with expiration tracking
- `verification_tokens` - Email verification tokens

**Feedback System Tables:**
- `feedback_submissions` - Feature requests, bug reports, and user feedback (type, title, description, status, is_approved, user_id, approved_by_user_id, timestamps)
- `feedback_votes` - User votes on approved feedback (feedback_id, user_id, vote_type)

**Database Relationships:**
- `players.user_id` → `users.id` (links football registrations to authenticated accounts)
- `banned_users.user_id` → `users.id` (links bans to user accounts)
- `admin_logs.performed_by_user_id` → `users.id` (tracks which admin performed actions)
- `feedback_submissions.user_id` → `users.id` (links feedback to submitters)
- `feedback_submissions.approved_by_user_id` → `users.id` (tracks which admin approved)
- `feedback_votes.user_id` → `users.id` (tracks who voted)
- `feedback_votes.feedback_id` → `feedback_submissions.id` (links votes to feedback)

### Key Features
- **Time-based Registration**: Only allowed Sunday/Wednesday 12 PM - 8 PM next day
- **Player Limit**: 21 guaranteed spots with waitlist system
- **42 Intra Integration**: OAuth2 validation against 42 API
- **Admin Panel**: User management with ban/unban via Replit auth (restricted to 'MahdyZ7')
- **Team Management**: 3 teams of 7 players with drag-and-drop and star ratings
- **Real-time Updates**: React Query auto-syncing with background refetch
- **Toast Notifications**: Consistent user feedback across all operations
- **PDF Export**: Generate team sheets and player lists
- **Responsive Design**: Mobile-first approach with light/dark themes
- **Feedback System**: User feedback submission with admin approval workflow and voting

### Feedback System

The feedback system allows authenticated users to submit feature requests, bug reports, and general feedback. All submissions require admin approval before becoming publicly visible, and approved submissions can be voted on by other users.

**Key Features:**
- **Three Submission Types**: Feature requests, bug reports, and general feedback
- **Admin Approval Workflow**: All submissions start in "pending" status and require admin approval
- **Privacy Controls**: Submitter name and email are only visible to admins
- **Voting System**: Users can upvote or downvote approved submissions (one vote per user)
- **Status Tracking**: Admins can mark submissions as pending, approved, rejected, in_progress, or completed
- **Vote Scoring**: Submissions are ranked by vote score (upvotes - downvotes)

**User Workflow:**
1. Navigate to `/feedback` page
2. Click "Submit Feedback" (requires authentication)
3. Select type (feature/bug/feedback), enter title and description
4. Submit for admin review
5. Vote on approved submissions (upvote/downvote)
6. View submissions filtered by type

**Admin Workflow:**
1. Navigate to `/admin/feedback` page (admin only)
2. Review pending submissions with full user details
3. Approve or reject submissions
4. Update status for approved items (in_progress, completed)
5. Delete inappropriate submissions
6. All actions are logged to `admin_logs` table

**Database Migration:**
```bash
npm run db:migrate:feedback
```

This creates the `feedback_submissions` and `feedback_votes` tables with proper foreign key relationships to the `users` table.

### Authentication & Authorization
- **NextAuth.js Integration**: Full OAuth2 authentication system supporting 42 Intra provider
- **Role-Based Access Control**: Users table with `is_admin` flag for admin privileges
- **Admin Management**: Interactive CLI tool (`npm run admin:manage`) to promote/demote admins
- **Session Management**: Secure session tracking with automatic expiration
- **User Verification**: 42 intra API OAuth2 flow with automatic name resolution
- **Ban System**: Time-based banning with predefined durations and custom reasons
- **Admin Logging**: All admin actions automatically logged with user tracking via `performed_by_user_id`
- **Database Migration**: Automated migration scripts to link legacy data with auth system

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `SERVICE_ACCOUNT_USER_ID` - Service account user ID for automated tasks (generated by `npm run service:setup`)
- `SERVICE_API_KEY` - Secure API key for cron jobs and automated operations (generated by `npm run service:setup`)
- `UID` and `APP_SEC` - 42 API credentials for intra validation
- `resetuser` - **DEPRECATED** Legacy secret for admin reset (use `SERVICE_API_KEY` instead)

### Service Account System

The application uses a dedicated service account for automated tasks (cron jobs, scheduled resets). This provides:
- **Full audit trail**: All automated actions logged to `admin_logs` table
- **Secure authentication**: API key-based authentication instead of shared secrets
- **Easy key rotation**: Change keys without modifying cron jobs
- **Proper authorization**: Uses database user accounts with `role='service'`

**Setup:**
1. Run `npm run service:setup` to create the service account and generate API key
2. Add `SERVICE_ACCOUNT_USER_ID` and `SERVICE_API_KEY` to your `.env` file
3. Configure your cron job to use the API key (see `docs/SERVICE_ACCOUNT_SETUP.md`)

**API Endpoint:**
- `DELETE /api/register` - Reset player list (requires `x-api-key` header)
  - Empty body: Resets entire player list
  - With `{intra: "username"}`: Deletes specific user
  - All actions are logged to `admin_logs` with service account attribution

**Documentation:** See `docs/SERVICE_ACCOUNT_SETUP.md` for complete setup guide including:
- Initial configuration
- Cron job examples (curl, GitHub Actions, Vercel Cron)
- API key rotation
- Troubleshooting

### Development Notes
- **Data Fetching**: All components use React Query hooks from `hooks/useQueries.ts`
- **Client Components**: Use 'use client' directive for any component using hooks or browser APIs
- **Error Handling**: React Query provides consistent error states; components handle UI feedback
- **Loading States**: All mutations show loading indicators to prevent double-submission
- **Cache Strategy**:
  - Users: 30s stale time with immediate invalidation on mutations
  - Admin data: 30s-1min cache with automatic invalidation
  - Static data: 5min cache (money, verification status)
- **Registration Logic**: Time windows controlled by `lib/utils/allowed_times.tsx`
- **Ban Management**: Predefined reasons with auto-calculated durations in admin interface
- **Toast System**: Centralized user feedback with auto-dismiss and manual close options

### Performance Optimizations
- **React Query Caching**: Eliminates unnecessary API calls through intelligent caching
- **Background Sync**: Data stays fresh without user-initiated refreshes
- **Request Deduplication**: Multiple components requesting same data share single request
- **Optimistic Updates**: UI updates immediately while background sync ensures consistency
- **Component-level Error Boundaries**: Prevent cascade failures

## Database Management

Use the scripts in the `scripts/` directory for database operations. The automated setup script handles table creation and initial configuration. All admin actions are automatically logged to the `admin_logs` table for audit purposes.

### Admin Role Management

The `scripts/manage_admins.ts` tool provides an interactive CLI for managing admin roles:

```bash
npm run admin:manage
```

**Features:**
1. **List all users** - View all registered users with their admin status
2. **Promote to admin** - Grant admin privileges to any user
3. **Remove admin** - Revoke admin privileges from a user

The tool directly modifies the `users.is_admin` field in the database. Use this to manage who has access to protected admin endpoints.

### Authentication Migration

If upgrading from a pre-auth version of the system, run the migration:

```bash
npm run db:migrate:auth
```

This creates the NextAuth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`) and adds foreign key columns to existing tables (`players.user_id`, `banned_users.user_id`, `admin_logs.performed_by_user_id`).