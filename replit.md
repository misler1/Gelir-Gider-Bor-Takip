# FinTracker - Personal Finance Application

## Overview

FinTracker is a personal finance management application for tracking income, expenses, and bank debts. The application allows users to create recurring financial entries with 24-month planning schedules, manage payment tracking, and view cash balance projections. Built with a React frontend and Express backend, it uses PostgreSQL for data persistence with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state caching and synchronization
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Build Tool**: Vite with hot module replacement

The frontend follows a page-based structure where each major feature (Income, Expenses, Banks) has a dashboard page and an add/edit page. Components are organized into reusable UI components (`client/src/components/ui/`) and feature-specific components.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all database table definitions

The backend uses a storage abstraction layer (`server/storage.ts`) that implements database operations. Routes are registered in `server/routes.ts` and validate inputs using Zod schemas shared between frontend and backend.

### Data Models

**Incomes**: Support recurring entries with `monthlySchedule` stored as JSONB array containing month, amount, date, and approval status for 24-month planning.

**Expenses**: Similar structure to incomes with `monthlySchedule` for recurring expense tracking and paid status.

**Banks**: Track debt accounts with interest rates, minimum payments, payment due days, and active status for debt simulation features.

### Key Design Patterns
- **Shared Types**: Schema definitions in `shared/` are used by both frontend and backend
- **API Contract**: Route definitions include method, path, input schema, and response schemas
- **Optimistic Updates**: React Query mutations invalidate related queries on success
- **Form State**: Local React state for form handling with validation before submission

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and migrations
- **connect-pg-simple**: PostgreSQL session storage (available but sessions not currently implemented)

### Frontend Libraries
- **@tanstack/react-query**: Server state management
- **date-fns**: Date manipulation and formatting for financial projections
- **Radix UI**: Accessible component primitives (dialog, select, checkbox, etc.)
- **Tailwind CSS**: Utility-first styling

### Build & Development
- **Vite**: Development server and production bundler
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development

### Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (required)
- Database migrations managed via `drizzle-kit push`