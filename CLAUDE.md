# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm ci` - Install dependencies (preferred over npm install)
- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run start` - Start production server  
- `npm run lint` - Run ESLint

## Project Architecture

This is a Next.js football club registration website with the following key components:

### Core Pages
- `pages/index.tsx` - Main registration page with time-based submission controls
- `pages/teams.tsx` - Team selection interface with 3-star rating system and 3 teams of 7 players
- `pages/admin.tsx` - Admin dashboard for user management and banning system
- `pages/Navbar.tsx` - Navigation component
- `pages/footer.tsx` - Footer component

### API Routes
- `pages/api/register.ts` - Handle user registration/deletion with ban checking
- `pages/api/users.ts` - Fetch registered users
- `pages/api/allowed.ts` - Check if registration is currently allowed
- `pages/api/admin/` - Admin endpoints for user management and ban system

### Database Schema
PostgreSQL database with tables:
- `players` - User registrations (name, intra, verified, created_at)
- `money` - Payment tracking
- `expenses` - Expense management
- `inventory` - Inventory management
- `banned_users` - User ban system

### Key Features
- **Time-based Registration**: Only allowed Sunday/Wednesday 12 PM - 8 PM next day
- **Player Limit**: 21 guaranteed spots with waitlist
- **42 Intra Integration**: Validates users against 42 API
- **Admin Panel**: User management with ban/unban functionality
- **Team Management**: 3 teams of 7 players with star ratings
- **Toast Notifications**: Real-time user feedback

### Authentication
- Admin access via Replit auth (currently restricted to 'MahdyZ7')
- User verification through 42 intra API

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `resetuser` - Secret for admin reset functionality
- Various 42 API credentials for intra validation

### Styling
- Custom CSS in `styles/football.css`
- Theme system with light/dark mode support
- Responsive design with mobile-first approach

## Development Notes

- Registration timing controlled by `pages/utils/allowed_times.tsx`
- Player limit logic in `pages/utils/player_limit.tsx`
- User verification handled by `utils/verify_login.tsx`
- Error boundaries and loading states implemented throughout
- Toast notification system for user feedback