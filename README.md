# 42 Football Club Registration Website

A comprehensive football club management system built with Next.js 15, featuring time-based registration, team management, admin controls, and a feedback system.

## Live Demo

[https://42football.vercel.com](https://42football.vercel.com)

## Features

### User Features
- **Time-Based Registration** - Register only during allowed time windows (Sunday/Wednesday 12 PM - 8 PM next day)
- **Player Limit System** - 21 guaranteed spots with automatic waitlist management
- **OAuth Authentication** - Secure login via 42 Intra, Google, or GitHub
- **Team Selection** - View and join teams with drag-and-drop interface
- **Player Roster** - View all registered players and their verification status
- **Rules Page** - Clear guidelines to minimize disputes
- **Feedback System** - Submit feature requests, bug reports, and general feedback
- **Voting System** - Vote on approved feedback submissions (upvote/downvote)
- **Light/Dark Theme** - Toggle between themes with persistent preference
- **Toast Notifications** - Real-time feedback for all user actions
- **Responsive Design** - Mobile-first approach with optimized layouts

### Admin Features
- **User Management** - View all registered users with verification toggles
- **Ban System** - Ban/unban users with predefined durations and custom reasons
- **Action Logging** - Comprehensive audit trail of all admin actions
- **Feedback Moderation** - Approve/reject feedback submissions before public visibility
- **Status Management** - Update feedback status (pending, in_progress, completed)
- **User Deletion** - Remove users with full cascade handling
- **Verification Control** - Toggle user verification status
- **Admin Role Management** - Interactive CLI tool to promote/demote admins

### Financial Management
- **Payment Tracking** - Track player payments and dues
- **Expense Management** - Record and manage club expenses
- **Inventory System** - Track equipment and supplies

### Technical Features
- **React Query Integration** - Optimized data fetching with automatic caching
- **Optimistic Updates** - Instant UI feedback with background sync
- **Background Refetching** - Keep data fresh without manual refreshes
- **Error Boundaries** - Graceful error handling throughout the app
- **Skeleton Screens** - Professional loading states for all pages
- **Service Account System** - Automated tasks via secure API key authentication
- **Database Migrations** - Automated schema updates and data migration
- **CI/CD Pipeline** - Automated testing and deployment via GitHub Actions
- **Comprehensive Test Suite** - Unit and integration tests with dummy data

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/) or use a managed service like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
- **Git** - [Download here](https://git-scm.com/downloads)
- **42 API Credentials** (optional but recommended) - Get from [42 Intra Profile](https://profile.intra.42.fr/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/MahdyZ7/Football-website.git
cd Football-website
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Now edit `.env` and configure the following variables:

#### Database Configuration

```bash
# Production database
DATABASE_URL=postgresql://username:password@host:port/database_name

# Example for local PostgreSQL:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/football_db

# Example for Neon (managed PostgreSQL):
# DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

#### NextAuth.js Configuration (Required)

```bash
# Generate a secure secret key:
# Run: openssl rand -base64 32
NEXTAUTH_SECRET=your-generated-secret-key-here

# Your application URL (change in production)
NEXTAUTH_URL=http://localhost:3000
```

#### OAuth Providers (At least one required)

**Google OAuth** - [Get credentials](https://console.cloud.google.com/)
1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

```bash
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**GitHub OAuth** - [Get credentials](https://github.com/settings/developers)
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

```bash
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

**42 School OAuth** - [Get credentials](https://profile.intra.42.fr/)
1. Login to 42 Intra
2. Go to API section in your profile
3. Create new application
4. Set Redirect URI: `http://localhost:3000/api/auth/callback/42-school`

```bash
FT_CLIENT_ID=your-42-client-id
FT_CLIENT_SECRET=your-42-client-secret
```

#### 42 API Credentials (For intra verification)

These are different from the OAuth credentials above. Used for verifying user credentials:

```bash
UID=your-42-api-uid
APP_SEC=your-42-api-secret
```

#### Service Account (Optional - for automated tasks)

These will be generated automatically when you run `npm run service:setup`:

```bash
SERVICE_ACCOUNT_USER_ID=auto-generated-by-setup
SERVICE_API_KEY=auto-generated-by-setup
```

#### Timezone Configuration

```bash
# Force UTC timezone for consistent timestamps
TZ=UTC
```

### 4. Set Up the Database

Choose one of the following options:

#### Option A: Automated Setup (Recommended)

```bash
npm run db:setup
```

This creates all required tables, indexes, and relationships.

#### Option B: Manual Migration

```bash
# Create core tables
npm run db:migrate

# Add authentication system
npm run db:migrate:auth

# Add feedback system
npm run db:migrate:feedback
```

### 5. Development with Dummy Data

For development, you can populate your database with realistic test data:

#### Create a Test Database

1. Create a separate test database in PostgreSQL:

```bash
# Using psql
createdb football_test

# Or in PostgreSQL shell
CREATE DATABASE football_test;
```

2. Create a `.env.test` file:

```bash
cp .env.example .env.test
```

3. Update `.env.test` with your test database URL:

```bash
DATABASE_URL=postgresql://username:password@localhost:5432/football_test
```

#### Populate Test Data

```bash
# Setup test database schema
npm run test:db:setup

# Seed with dummy data
npm run test:db:seed
```

This creates:
- **6 test users** (1 admin, 4 regular users, 1 service account)
- **5 test players** (with various verification statuses)
- **4 money records** (mix of paid and unpaid)
- **3 expenses** (field rental, equipment, referee fees)
- **5 inventory items** (footballs, cones, jerseys, water bottles)
- **1 banned user** (with ban reason and duration)
- **3 admin log entries** (ban, verification actions)
- **4 feedback submissions** (features, bugs, feedback with various statuses)
- **5 feedback votes** (upvotes and downvotes)

#### Test Users Credentials

After seeding, you can use these test accounts:

| Email | Role | Password |
|-------|------|----------|
| admin@test.com | Admin | Use OAuth login |
| john@test.com | User | Use OAuth login |
| jane@test.com | User | Use OAuth login |
| bob@test.com | User | Use OAuth login |
| alice@test.com | User | Use OAuth login |

**Note**: Since the app uses OAuth, you'll need to sign in via Google/GitHub/42, then promote your account to admin using:

```bash
npm run admin:manage
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 7. Create Your First Admin

Run the admin management tool to promote your user to admin:

```bash
npm run admin:manage
```

Follow the interactive prompts to:
1. List all users
2. Promote a user to admin by their ID

## Project Structure

```
Football-website/
├── app/                      # Next.js 15 App Router
│   ├── page.tsx              # Registration page
│   ├── layout.tsx            # Root layout with providers
│   ├── admin/                # Admin pages
│   │   ├── page.tsx          # User management
│   │   └── feedback/         # Feedback moderation
│   ├── admin-logs/           # Admin action logs
│   ├── banned-players/       # Ban management
│   ├── teams/                # Team selection
│   ├── roster/               # Player roster
│   ├── rules/                # Club rules
│   ├── feedback/             # Public feedback
│   ├── auth/                 # Authentication pages
│   └── api/                  # API routes
│       ├── register/         # Registration endpoints
│       ├── admin/            # Protected admin endpoints
│       ├── feedback/         # Feedback endpoints
│       └── auth/             # NextAuth.js endpoints
├── components/               # React components
│   ├── pages/                # Page-specific components
│   ├── Navbar.tsx            # Navigation
│   ├── Footer.tsx            # Footer
│   ├── Skeleton.tsx          # Loading states
│   └── ErrorBoundary.tsx     # Error handling
├── contexts/                 # React contexts
│   └── ThemeContext.tsx      # Theme management
├── hooks/                    # Custom React hooks
│   └── useQueries.ts         # React Query hooks
├── lib/                      # Utilities
│   ├── auth.ts               # NextAuth configuration
│   └── utils/                # Helper functions
│       ├── db.ts             # Database connection
│       ├── adminLogger.ts    # Admin logging
│       ├── verify_login.tsx  # 42 API integration
│       ├── allowed_times.tsx # Time-based registration
│       └── player_limit.tsx  # Player capacity
├── providers/                # React providers
│   └── QueryProvider.tsx     # React Query setup
├── scripts/                  # Database and admin tools
│   ├── database-migration.js # Database migrations
│   ├── migrate_auth.ts       # Auth system migration
│   ├── migrate_feedback.ts   # Feedback system migration
│   ├── manage_admins.ts      # Admin role management
│   ├── setup_service_account.ts # Service account setup
│   ├── test-db-setup.js      # Test database schema
│   └── test-db-seed.js       # Test data seeding
├── styles/                   # Global styles
│   └── globals.css           # Tailwind + custom CSS
├── __tests__/                # Test suite
├── .env.example              # Environment template
├── .github/workflows/        # CI/CD pipeline
├── tailwind.config.ts        # Tailwind configuration
├── jest.config.js            # Jest configuration
└── package.json              # Dependencies and scripts
```

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS v4** - Utility-first CSS
- **Framer Motion** - Animation library
- **React Query** - Data fetching and state management
- **Sonner** - Toast notifications
- **Lucide React** - Icon library
- **jsPDF** - PDF generation
- **html2canvas** - Screenshot capture

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **NextAuth.js v5** - Authentication system
- **PostgreSQL** - Relational database
- **node-postgres (pg)** - Database driver

### Development
- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Jest** - Testing framework
- **Supertest** - API testing
- **Vercel Analytics** - Performance monitoring

## Available Scripts

### Development

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### Database Management

```bash
npm run db:setup         # Automated database setup
npm run db:migrate       # Run migrations
npm run db:migrate:auth  # Migrate authentication system
npm run db:migrate:feedback # Migrate feedback system
npm run db:backup        # Create database backup
npm run db:restore       # Restore from backup
npm run db:status        # Check database status
npm run db:list-backups  # List available backups
```

### Testing

```bash
npm test                 # Run test suite
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
npm run test:ci          # CI optimized test run
npm run test:db:setup    # Setup test database
npm run test:db:seed     # Populate test data
npm run test:db:teardown # Clean up test database
```

### Admin Tools

```bash
npm run admin:manage     # Manage admin roles (interactive CLI)
npm run service:setup    # Create service account for automation
```

## Database Schema

### Authentication Tables (NextAuth.js)
- `users` - User accounts with role-based access
- `accounts` - OAuth provider accounts
- `sessions` - Active user sessions
- `verification_tokens` - Email verification

### Core Tables
- `players` - Football registrations
- `money` - Payment tracking
- `expenses` - Club expenses
- `inventory` - Equipment inventory
- `banned_users` - User ban system
- `admin_logs` - Admin action audit trail
- `feedback_submissions` - User feedback
- `feedback_votes` - Feedback voting system

See [Database Schema Documentation](README.md#database-schema) for detailed table structures.

## Key Features Explained

### Time-Based Registration

Registration is only allowed during specific time windows:
- **Sunday**: 12:00 PM - 8:00 PM (next day)
- **Wednesday**: 12:00 PM - 8:00 PM (next day)

This is controlled by `lib/utils/allowed_times.tsx`.

### Player Limit System

- **21 guaranteed spots** for registered players
- Automatic **waitlist** after capacity is reached
- Waitlist players are notified when spots open up

### Feedback System Workflow

1. **User submits feedback** (requires authentication)
2. **Admin reviews submission** in admin panel
3. **Admin approves/rejects** feedback
4. **Approved feedback** becomes publicly visible
5. **Users vote** on approved submissions
6. **Admin tracks progress** (pending → in_progress → completed)

### Service Account System

For automated tasks (cron jobs, scheduled resets):

1. Run setup: `npm run service:setup`
2. Save generated credentials to `.env`
3. Use API key in automation scripts
4. All actions are logged with proper attribution

See [docs/SERVICE_ACCOUNT_SETUP.md](docs/SERVICE_ACCOUNT_SETUP.md) for details.

## Environment Configuration

### Production Deployment

When deploying to production:

1. **Update `NEXTAUTH_URL`** to your production domain
2. **Update OAuth redirect URIs** in provider settings
3. **Use strong `NEXTAUTH_SECRET`** (generate new one)
4. **Enable SSL** for PostgreSQL connection (add `?sslmode=require`)
5. **Set up service account** for automated tasks

### OAuth Provider Setup

Each OAuth provider requires proper configuration:

- **Redirect URIs** must match your domain
- **Scopes** should request email and profile
- **Credentials** should be kept secure in environment variables

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Write clear commit messages**
4. **Add tests** for new features
5. **Ensure tests pass**: `npm test`
6. **Submit a pull request**

### Pull Request Guidelines

- One feature per PR
- Clear description of changes
- Include screenshots for UI changes
- Update documentation if needed
- Follow existing code style

### Reporting Issues

Report bugs and request features by [creating an issue](https://github.com/MahdyZ7/Football-website/issues).

## Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

Tests include:
- API endpoint testing
- Database operations
- Authentication flows
- User registration logic
- Admin operations
- Feedback system

## Documentation

Additional documentation available in the `docs/` directory:

- [Testing and CI/CD Guide](docs/TESTING_AND_CI_CD.md)
- [Quick Start Testing](docs/QUICK_START_TESTING.md)
- [Service Account Setup](docs/SERVICE_ACCOUNT_SETUP.md)
- [Security Audit](docs/SECURITY_AUDIT.md)
- [Test Setup Complete](docs/TEST_SETUP_COMPLETE.md)

## License

ISC License - See [LICENSE](LICENSE) file for details

## Acknowledgments

- Built for the 42 School Football Club
- Powered by Next.js and Vercel
- Icons by [Lucide](https://lucide.dev)
- UI components with [Tailwind CSS](https://tailwindcss.com)

## Support

For questions or issues:

- **GitHub Issues**: [Report a bug](https://github.com/MahdyZ7/Football-website/issues)
- **Email**: Contact the maintainers
