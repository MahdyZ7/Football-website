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
- `npm run db:backup` - Create database backup
- `npm run db:restore <backup-file>` - Restore from backup
- `npm run db:status` - Check database status

## Project Architecture

This is a Next.js 15 football club registration website using **App Router** architecture with **React Query** for data management.

### App Router Structure
- `app/layout.tsx` - Root layout with QueryProvider, ErrorBoundary, ThemeProvider, and analytics
- `app/page.tsx` - Main registration page with random component selection
- `app/admin/page.tsx` - Admin dashboard for user management and banning
- `app/teams/page.tsx` - Team selection interface with drag-and-drop functionality
- `app/admin-logs/page.tsx` - Admin action logging interface
- `app/banned-players/page.tsx` - View and manage banned users

### API Routes (App Router)
All API routes use Next.js 13+ App Router format with NextRequest/NextResponse:
- `app/api/register/route.ts` - Handle user registration/deletion with ban checking
- `app/api/users/route.ts` - Fetch registered users
- `app/api/allowed/route.ts` - Check if registration is currently allowed
- `app/api/verify/route.ts` - Verify user credentials
- `app/api/moneyDb/route.ts` - Financial tracking data
- `app/api/banned-users/route.ts` - Public banned users list
- `app/api/admin-logs/route.ts` - Admin action logs
- `app/api/admin/` - Protected admin endpoints:
  - `auth/route.ts` - Admin authentication via Replit
  - `ban/route.ts` - Ban/unban users with logging
  - `banned/route.ts` - Admin-only banned users management
  - `users/route.ts` - Admin delete users
  - `users/verify/route.ts` - Toggle user verification status

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

### Mutation Hooks
All mutations automatically invalidate related queries:
- `useRegisterUser()` - User registration with optimistic updates
- `useBanUser()` - Ban user with multi-cache invalidation
- `useUnbanUser()` - Unban user with logging
- `useAdminDeleteUser()` - Admin delete with logging
- `useVerifyUser()` - Toggle verification status

### Component Architecture
- `components/pages/` - Page components with React Query integration
- `components/` - Reusable components (ErrorBoundary, LoadingSpinner, TeamExporter, ThemeToggle)
- `contexts/ThemeContext.tsx` - Light/dark theme management (client-side)
- `providers/QueryProvider.tsx` - React Query configuration and DevTools

### Utility Functions
Centralized in `lib/utils/`:
- `db.ts` - PostgreSQL connection pool
- `adminLogger.ts` - Admin action logging system
- `verify_login.tsx` - 42 API integration for user verification
- `allowed_times.tsx` - Time-based registration control logic
- `player_limit.tsx` - Player capacity management (21 guaranteed spots)

### Database Schema
PostgreSQL database with tables:
- `players` - User registrations (name, intra, verified, created_at)
- `money` - Payment tracking with status
- `expenses` - Expense management
- `inventory` - Inventory management
- `banned_users` - User ban system with reason, duration, and timestamps
- `admin_logs` - Admin action logging with full audit trail

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

### Authentication & Authorization
- **Admin Access**: Replit authentication with server and client-side fallbacks
- **User Verification**: 42 intra API OAuth2 flow with automatic name resolution
- **Ban System**: Time-based banning with predefined durations and custom reasons
- **Admin Logging**: All admin actions automatically logged with timestamps and details

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `resetuser` - Secret for admin reset functionality
- `UID` and `APP_SEC` - 42 API credentials for intra validation

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