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
- **Docker** (for local PostgreSQL) - [Download here](https://www.docker.com/products/docker-desktop)
  - OR **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
  - OR use a managed service like [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app)
- **Git** - [Download here](https://git-scm.com/downloads)
- **42 API Credentials** (optional but recommended) - Get from [42 Intra Profile](https://profile.intra.42.fr/)

## Getting Started

### Quick Start (5 Minutes) 🚀

For developers who want to get up and running quickly:

```bash
# 1. Clone and install
git clone https://github.com/MahdyZ7/Football-website.git
cd Football-website
npm ci

# 2. Start PostgreSQL with Docker
docker run --name football-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=football_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# 3. Setup environment
cp .env.example .env
# Edit .env and set DATABASE_URL=postgresql://postgres:postgres@localhost:5432/football_db

# 4. Initialize database and seed with development data
npm run db:init
npm run db:seed:dev

# 5. Start the app
npm run dev
```

Your app is now running at [http://localhost:3000](http://localhost:3000)! 🎉

**Default Admin Account**: `admin@42school.com` (login via OAuth, then promote to admin with `npm run admin:manage`)

---

## Detailed Setup Guide

### 1. Clone the Repository

```bash
git clone https://github.com/MahdyZ7/Football-website.git
cd Football-website
```

### 2. Install Dependencies

```bash
npm ci
```

### 3. Set Up PostgreSQL Database

Choose one of these options:

#### Option A: Docker PostgreSQL (Recommended for Development)

```bash
# Start PostgreSQL container
docker run --name football-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=football_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Verify it's running
docker ps

# Your DATABASE_URL will be:
# postgresql://postgres:postgres@localhost:5432/football_db
```

**Useful Docker Commands:**
```bash
# Stop the container
docker stop football-postgres

# Start the container
docker start football-postgres

# View logs
docker logs football-postgres

# Remove the container (destroys all data!)
docker rm -f football-postgres

# Connect to PostgreSQL shell
docker exec -it football-postgres psql -U postgres -d football_db
```

#### Option B: Local PostgreSQL Installation

Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/) and create a database:

```bash
# Using psql
createdb football_db

# Or in PostgreSQL shell
CREATE DATABASE football_db;
```

#### Option C: Managed PostgreSQL Service

Use a cloud provider:
- **Neon** (serverless) - [neon.tech](https://neon.tech) - Free tier available
- **Supabase** - [supabase.com](https://supabase.com) - Free tier available
- **Railway** - [railway.app](https://railway.app) - Free tier available

### 4. Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Now edit `.env` and configure the following variables:

#### Database Configuration

```bash
# For Docker PostgreSQL (from Quick Start):
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/football_db

# For local PostgreSQL:
# DATABASE_URL=postgresql://postgres:password@localhost:5432/football_db

# For Neon (managed PostgreSQL):
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

### 5. Initialize the Database

#### Option A: Fresh Setup with Development Data (Recommended) 🎯

Perfect for new developers who want realistic data to work with:

```bash
# 1. Initialize database schema (creates all tables)
npm run db:init

# 2. Populate with development data
npm run db:seed:dev

# 3. Check database status
npm run db:status
```

**What you get:**
- ✅ 20 users (1 admin, 1 service account, 18 regular users)
- ✅ 21 player registrations (15 verified, 6 unverified)
- ✅ 21 payment records (12 paid, 9 unpaid)
- ✅ 5 expense records
- ✅ 6 inventory items
- ✅ 2 banned users with different ban durations
- ✅ 4 admin log entries
- ✅ 6 feedback submissions (4 approved, 2 pending)
- ✅ Realistic feedback votes

**Development Accounts:**

| Email | Role | Use Case |
|-------|------|----------|
| admin@42school.com | Admin | Testing admin features |
| jdoe@student.42.fr | User | Regular user testing |
| jsmith@student.42.fr | User | Regular user testing |

**Note**: After logging in via OAuth, promote your account to admin:
```bash
npm run admin:manage
# Select option 2, then enter the email you logged in with
```

#### Option B: Empty Database (Production-like)

For a clean start without dummy data:

```bash
# Initialize schema only
npm run db:init
```

#### Option C: Legacy Migration (Upgrading from old version)

```bash
# Create core tables
npm run db:migrate

# Add authentication system
npm run db:migrate:auth

# Add feedback system
npm run db:migrate:feedback
```

### 6. Run the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000) 🚀

### 7. Create Your First Admin (If Not Using Development Data)

If you started with an empty database:

1. **Sign in** using Google, GitHub, or 42 OAuth
2. **Promote yourself to admin**:
   ```bash
   npm run admin:manage
   ```
3. Follow the prompts to promote your email to admin role

### 8. Optional: Set Up Service Account for Automation

For automated tasks (cron jobs, scheduled resets):

```bash
npm run service:setup
```

This generates a service account and API key. Add the output to your `.env` file.

## Common Development Scenarios

### Starting Fresh After Breaking Changes

```bash
# Reset everything and start over
npm run db:reset
# Answer "yes" to both prompts
# Answer "yes" to seed with development data

# Restart the app
npm run dev
```

### Working with Docker PostgreSQL

```bash
# Start PostgreSQL (first time)
docker run --name football-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=football_db \
  -p 5432:5432 \
  -d postgres:16-alpine

# Stop PostgreSQL (keeps data)
docker stop football-postgres

# Start PostgreSQL (subsequent times)
docker start football-postgres

# View PostgreSQL logs
docker logs -f football-postgres

# Connect to database
docker exec -it football-postgres psql -U postgres -d football_db

# Backup database before experimenting
npm run db:backup

# Complete reset (removes container and all data)
docker rm -f football-postgres
# Then recreate the container and run db:init + db:seed:dev
```

### Testing Different User Scenarios

After seeding development data, you have 21 players to test with:

```bash
# 1. Seed the database
npm run db:seed:dev

# 2. Start the app
npm run dev

# 3. Test as different users:
# - admin@42school.com - Admin features
# - jdoe@student.42.fr - Verified player
# - jsmith@student.42.fr - Verified player
# - user19@student.42.fr - Unverified player
```

### Switching Between Development and Production Data

```bash
# Development database (with dummy data)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/football_db
npm run db:init
npm run db:seed:dev

# Production-like database (empty)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/football_prod
npm run db:init
# Don't seed - add real data through the app
```

### Before Making a Pull Request

```bash
# 1. Reset to clean state
npm run db:reset

# 2. Run tests
npm test

# 3. Check for linting issues
npm run lint

# 4. Test the app manually
npm run dev

# 5. Create a backup of your test data (if needed)
npm run db:backup
```

### Troubleshooting Common Issues

**Issue**: "relation 'users' does not exist"
```bash
# Solution: Initialize the database
npm run db:init
```

**Issue**: "Connection refused" to PostgreSQL
```bash
# Check if Docker container is running
docker ps

# If not running, start it
docker start football-postgres

# If container doesn't exist, create it
docker run --name football-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=football_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

**Issue**: "Cannot sign in with OAuth"
```bash
# 1. Check your .env file has OAuth credentials
cat .env | grep -E "(GOOGLE_CLIENT_ID|GITHUB_ID|FT_CLIENT_ID)"

# 2. Verify NEXTAUTH_URL is correct
cat .env | grep NEXTAUTH_URL

# 3. Generate new NEXTAUTH_SECRET if needed
openssl rand -base64 32
```

**Issue**: Database tables exist but empty
```bash
# Populate with development data
npm run db:seed:dev
```

**Issue**: Made breaking changes and need fresh start
```bash
# Nuclear option - complete reset
npm run db:reset
# Answer "yes" to all prompts
```

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
│   ├── init-database.sql     # Complete schema definition
│   ├── init-database.ts      # Database initialization
│   ├── seed-dev-data.ts      # Development data seeding
│   ├── reset-database.ts     # Complete database reset
│   ├── database-migration.js # Legacy migrations & backups
│   ├── migrate_auth.ts       # Auth system migration
│   ├── migrate_feedback.ts   # Feedback system migration
│   ├── manage_admins.ts      # Admin role management
│   ├── setup_service_account.ts # Service account setup
│   ├── test-db-setup.js      # Test database schema
│   ├── test-db-seed.js       # Test data seeding
│   └── README.md             # Database scripts documentation
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
# Core database commands
npm run db:init          # Initialize database schema (all tables)
npm run db:seed:dev      # Populate with development dummy data
npm run db:reset         # Drop all tables and reinitialize (with confirmation)
npm run db:status        # Check database status

# Legacy & migration commands
npm run db:setup         # Automated database setup (legacy)
npm run db:migrate       # Run basic migrations
npm run db:migrate:auth  # Migrate authentication system
npm run db:migrate:feedback # Migrate feedback system

# Backup & restore
npm run db:backup        # Create database backup (JSON)
npm run db:restore <file> # Restore from backup
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
