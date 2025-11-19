# [Football Registration site](https://42football.replit.com)

This website is a registration site for the 42 Football Club. It is built using React and Next.js with a PostgreSQL database.

## Features

- **NextAuth.js Authentication**: Full OAuth2 authentication with 42 Intra integration
- **Role-Based Access Control**: Admin role management with interactive CLI tool
- **Time-based Registration**: Registration only allowed Sunday/Wednesday 12 PM - 8 PM next day
- **Player Limit**: 21 guaranteed spots with waitlist system
- **42 Intra Integration**: Validates users against 42 API
- **Admin Panel**: User management with ban/unban functionality and action logging
- **Team Management**: 3 teams of 7 players with 3-star rating system
- **Session Management**: Secure user sessions with automatic expiration
- **Toast Notifications**: Real-time user feedback
- **Responsive Design**: Mobile-first approach with light/dark theme

## How to run

To run this project, you need to have Node.js installed. You can install it from [here](https://nodejs.org/en/)

A .env file is also required to run this project. Follow the .env.example file to create your own .env file. You will need to have PostgreSQL database URL to run this project.

- You can get the PostgreSQL database URL from any PostgreSQL database [provider](neon.com) or you run your own PostgreSQL database server.

### Database Setup

Use the automated setup script to create all required tables:

```bash
npm run db:setup
```

Or manually run migrations:

```bash
node scripts/database-migration.js migrate
```

### Running the Application

After installing Node.js and setting up the database, run:

```bash
npm ci
npm run dev
```

The default port is 3000. You can change it by setting port to a different value in the package.json file.

## Database Schema

The database contains the following tables:

### Core Registration Tables

#### Players table
```sql
create table players (
	name varchar(255),
	intra varchar(255) primary key,
	verified boolean default false,
	created_at timestamp with time zone default now(),
	user_id text references users(id) on delete set null
);
```

#### Money table
```sql
create table money (
	date date,
	name varchar(255),
	intra varchar(255),
	amount integer,
	paid boolean
);
```

#### Expenses table
```sql
create table expenses (
	name varchar(255) not null,
	amount integer not null,
	date date not null,
	invoice_id varchar(255) not null,
	primary key (name, date)
);
```

#### Inventory table
```sql
create table inventory (
	name varchar(255) not null,
	amount integer not null
);
```

#### Banned Users table
```sql
create table banned_users (
	id varchar(50) primary key,
	name varchar(100) not null,
	reason text not null,
	banned_at timestamp with time zone default now(),
	banned_until timestamp with time zone not null,
	user_id text references users(id) on delete set null
);
```

#### Admin Logs table
```sql
create table admin_logs (
	id serial primary key,
	admin_user varchar(100) not null,
	action varchar(100) not null,
	target_user varchar(100),
	target_name varchar(200),
	details text,
	timestamp timestamp default current_timestamp,
	performed_by_user_id text references users(id) on delete set null
);
```

### NextAuth.js Authentication Tables

#### Users table
```sql
create table users (
	id text primary key default gen_random_uuid()::text,
	name text,
	email text unique not null,
	email_verified timestamp with time zone,
	image text,
	is_admin boolean default false,
	created_at timestamp with time zone default current_timestamp,
	updated_at timestamp with time zone default current_timestamp
);
```

#### Accounts table
```sql
create table accounts (
	id text primary key default gen_random_uuid()::text,
	user_id text not null references users(id) on delete cascade,
	type text not null,
	provider text not null,
	provider_account_id text not null,
	refresh_token text,
	access_token text,
	expires_at bigint,
	token_type text,
	scope text,
	id_token text,
	session_state text,
	created_at timestamp with time zone default current_timestamp,
	updated_at timestamp with time zone default current_timestamp,
	unique(provider, provider_account_id)
);
```

#### Sessions table
```sql
create table sessions (
	id text primary key default gen_random_uuid()::text,
	session_token text unique not null,
	user_id text not null references users(id) on delete cascade,
	expires timestamp with time zone not null,
	created_at timestamp with time zone default current_timestamp,
	updated_at timestamp with time zone default current_timestamp
);
```

#### Verification Tokens table
```sql
create table verification_tokens (
	identifier text not null,
	token text unique not null,
	expires timestamp with time zone not null,
	primary key (identifier, token)
);
```

## Database Management

The `scripts/` directory contains database management tools:

```bash
# Create database backup
npm run db:backup

# Restore from backup
npm run db:restore <backup-file>

# Check database status
npm run db:status

# List available backups
npm run db:list-backups

# Run authentication system migration
npm run db:migrate:auth

# Manage admin roles (interactive)
npm run admin:manage
```

### Admin Role Management

The admin management tool (`npm run admin:manage`) provides an interactive CLI interface to:

1. **List all users** - View all registered users with their current admin status
2. **Promote to admin** - Grant admin privileges to any user by ID
3. **Remove admin** - Revoke admin privileges from a user by ID

This tool directly modifies the `users.is_admin` field to control access to protected admin endpoints.

### Authentication Migration

If you're upgrading from a pre-NextAuth version, run the authentication migration to create the required tables and link existing data:

```bash
npm run db:migrate:auth
```

This migration:
- Creates NextAuth.js tables (`users`, `accounts`, `sessions`, `verification_tokens`)
- Adds `user_id` foreign keys to existing tables (`players`, `banned_users`, `admin_logs`)
- Creates necessary indexes for optimal performance
- Sets up automatic timestamp triggers

For more details, see `scripts/README.md`.

## how to contribute

fork this project and make a pull request. Pull requets will only be merged if the additions are clear, simple and easy to understand. Do not make a multi-purpose pull request. Make a separate pull request for each feature you want to add.

report bugs and request features by creating an issue.

## Under construction

<!-- Welcome to the NextJS base template bootstrapped using the `create-next-app`. This template supports TypeScript, but you can use normal JavaScript as well.

## Getting Started

Hit the run button to start the development server.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on `/api/hello`. This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Productionizing your Next App

To make your next App run smoothly in production make sure to deploy your project with [Repl Deployments](https://docs.replit.com/hosting/deployments/about-deployments)!

You can also produce a production build by running `npm run build` and [changing the run command](https://docs.replit.com/programming-ide/configuring-repl#run) to `npm run start`. -->
