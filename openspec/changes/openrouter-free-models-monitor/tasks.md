# Implementation Tasks

## 1. Project Setup

- [x] 1.1 Initialize pnpm workspace with pnpm-workspace.yaml
- [x] 1.2 Create root package.json with workspace scripts
- [x] 1.3 Create TypeScript base configuration (tsconfig.base.json)
- [x] 1.4 Configure ESLint and Prettier
- [x] 1.5 Create vitest.config.ts for test configuration
- [x] 1.6 Create .gitignore for monorepo

## 2. Shared Package

- [x] 2.1 Create packages/shared/package.json
- [x] 2.2 Create packages/shared/tsconfig.json
- [x] 2.3 Define shared TypeScript types in packages/shared/src/types.ts
- [x] 2.4 Define shared constants in packages/shared/src/constants.ts
- [x] 2.5 Create packages/shared/src/index.ts barrel export
- [x] 2.6 Build shared package with tsc

## 3. Backend - Project Structure

- [x] 3.1 Create apps/backend/package.json with dependencies
- [x] 3.2 Create apps/backend/tsconfig.json
- [x] 3.3 Create apps/backend/wrangler.toml for Cloudflare Workers
- [x] 3.4 Create D1 database schema in scripts/schema.sql
- [x] 3.5 Create database initialization script in scripts/init-db.ts

## 4. Backend - Core Services

- [x] 4.1 Create OpenRouter API client (apps/backend/src/services/openrouter.ts)
- [x] 4.2 Implement fetchAllModels() method
- [x] 4.3 Implement fetchFreeModels() method with :free suffix filtering
- [x] 4.4 Implement fetchWithRetry() with exponential backoff
- [x] 4.5 Add API key authentication support

## 5. Backend - Database Layer

- [x] 5.1 Create database types (apps/backend/src/lib/db.ts)
- [x] 5.2 Implement StorageService class (apps/backend/src/services/storage.ts)
- [x] 5.3 Implement getActiveModels() query
- [x] 5.4 Implement getModelById() query
- [x] 5.5 Implement upsertModel() for insert/update
- [x] 5.6 Implement deactivateModel() for removed models
- [x] 5.7 Implement saveChanges() to write change records
- [x] 5.8 Implement getChanges() with pagination
- [x] 5.9 Implement getLastSync() timestamp

## 6. Backend - Change Detection

- [x] 6.1 Create DiffService class (apps/backend/src/lib/diff.ts)
- [x] 6.2 Implement detectChanges() algorithm
- [x] 6.3 Implement field-level comparison (name, description, pricing, etc.)
- [x] 6.4 Handle added models detection
- [x] 6.5 Handle removed models detection
- [x] 6.6 Handle modified models detection
- [x] 6.7 Ensure O(n) complexity with Map-based indexing

## 7. Backend - Notification Service

- [x] 7.1 Create NotificationService class (apps/backend/src/services/notification.ts)
- [x] 7.2 Implement buildSummary() for change summaries
- [x] 7.3 Implement sendEmail() placeholder (Resend integration)
- [x] 7.4 Implement sendWebhook() for HTTP POST notifications
- [x] 7.5 Add multi-channel support configuration

## 8. Backend - API Routes

- [x] 8.1 Create Hono app (apps/backend/src/index.ts)
- [x] 8.2 Configure CORS middleware
- [x] 8.3 Configure logger middleware
- [x] 8.4 Implement error handling
- [x] 8.5 Create 404 handler

## 9. Backend - Models API

- [x] 9.1 Create models router (apps/backend/src/routes/models.ts)
- [x] 9.2 Implement GET /api/models (real-time from OpenRouter)
- [x] 9.3 Implement GET /api/models/cached (from database)
- [x] 9.4 Implement GET /api/models/:id (single model)
- [x] 9.5 Implement GET /api/models/changes (with pagination)
- [x] 9.6 Implement POST /api/models/refresh (manual sync)

## 10. Backend - Health API

- [x] 10.1 Create health router (apps/backend/src/routes/health.ts)
- [x] 10.2 Implement GET /api/health endpoint
- [x] 10.3 Implement GET /api/info endpoint

## 11. Backend - Scheduled Sync

- [x] 11.1 Create GET /cron/sync endpoint
- [x] 11.2 Implement cron secret authentication
- [x] 11.3 Wire up OpenRouterService, StorageService, DiffService
- [x] 11.4 Configure cron trigger in wrangler.toml (0 * * * *)

## 12. Backend - Tests

- [x] 12.1 Create OpenRouterService tests (apps/backend/src/services/__tests__/openrouter.test.ts)
- [x] 12.2 Test fetchAllModels() success case
- [x] 12.3 Test fetchFreeModels() filtering
- [x] 12.4 Test fetch error handling
- [x] 12.5 Test retry with exponential backoff
- [x] 12.6 Create DiffService tests (apps/backend/src/lib/__tests__/diff.test.ts)
- [x] 12.7 Test change detection for added/removed/modified
- [x] 12.8 Test empty list handling
- [x] 12.9 Verify all tests pass with vitest

## 13. Frontend - Project Structure

- [x] 13.1 Create apps/frontend/package.json with dependencies
- [x] 13.2 Create apps/frontend/tsconfig.json
- [x] 13.3 Create apps/frontend/vite.config.ts
- [x] 13.4 Create apps/frontend/index.html
- [x] 13.5 Configure TailwindCSS (tailwind.config.js, postcss.config.js)
- [x] 13.6 Create apps/frontend/src/index.css with Tailwind directives

## 14. Frontend - Core Components

- [x] 14.1 Create App component (apps/frontend/src/App.tsx)
- [x] 14.2 Create Header component (apps/frontend/src/components/Header.tsx)
- [x] 14.3 Implement navigation between Models and Changes pages
- [x] 14.4 Implement dark mode toggle
- [x] 14.5 Create main.tsx entry point

## 15. Frontend - Model Display Components

- [x] 15.1 Create ModelCard component (apps/frontend/src/components/ModelCard.tsx)
- [x] 15.2 Display model name, description, context length, pricing
- [x] 15.3 Add modality badges with color coding
- [x] 15.4 Display model ID in code block
- [x] 15.5 Create ModelList component (apps/frontend/src/components/ModelList.tsx)
- [x] 15.6 Implement loading spinner
- [x] 15.7 Implement error state

## 16. Frontend - Search and Filter

- [x] 16.1 Create SearchBar component (apps/frontend/src/components/SearchBar.tsx)
- [x] 16.2 Add search icon with proper styling
- [x] 16.3 Implement case-insensitive search
- [x] 16.4 Add modality filter dropdown to ModelsPage
- [x] 16.5 Filter models by modality type

## 17. Frontend - Refresh Functionality

- [x] 17.1 Create RefreshButton component (apps/frontend/src/components/RefreshButton.tsx)
- [x] 17.2 Display "last updated" timestamp in human-readable format
- [x] 17.3 Implement manual refresh with loading state
- [x] 17.4 Call POST /api/models/refresh endpoint
- [x] 17.5 Show spinner during refresh

## 18. Frontend - Changes Page

- [x] 18.1 Create ChangesPage component (apps/frontend/src/pages/ChangesPage.tsx)
- [x] 18.2 Add page header with description
- [x] 18.3 Create ChangeTimeline component (apps/frontend/src/components/ChangeTimeline.tsx)
- [x] 18.4 Display timeline with vertical connectors
- [x] 18.5 Implement color-coded icons (added=green, removed=red, modified=yellow)
- [x] 18.6 Display change timestamps
- [x] 18.7 Implement "Load More" pagination

## 19. Frontend - Models Page

- [x] 19.1 Create ModelsPage component (apps/frontend/src/pages/ModelsPage.tsx)
- [x] 19.2 Integrate SearchBar and modality filter
- [x] 19.3 Display model count
- [x] 19.4 Integrate RefreshButton with manual sync
- [x] 19.5 Wire up useModels hook for data fetching

## 20. Frontend - Custom Hooks

- [x] 20.1 Create useModels hook (apps/frontend/src/hooks/useModels.ts)
- [x] 20.2 Fetch from /api/models/cached on mount
- [x] 20.3 Implement manual refresh function
- [x] 20.4 Handle loading, error, and data states
- [x] 20.5 Create useChanges hook (apps/frontend/src/hooks/useChanges.ts)
- [x] 20.6 Fetch changes with pagination
- [x] 20.7 Implement loadMore function

## 21. Frontend - Styling

- [x] 21.1 Define Tailwind card styles
- [x] 21.2 Define button styles (primary, secondary)
- [x] 21.3 Define input styles
- [x] 21.4 Implement responsive grid layout (1/2/3 columns)
- [x] 21.5 Add dark mode styles with dark: prefix
- [x] 21.6 Add transitions and hover effects

## 22. Frontend - Configuration

- [x] 22.1 Configure Vite proxy for /api routes during development
- [x] 22.2 Set up path aliases (@/*)
- [x] 22.3 Configure build output directory

## 23. Utility Scripts

- [x] 23.1 Create scripts/sync.ts for manual testing
- [x] 23.2 Add CLI script to fetch and display free models

## 24. Documentation

- [x] 24.1 Create README.md with project overview
- [x] 24.2 Document architecture diagram
- [x] 24.3 Document getting started steps
- [x] 24.4 Document API endpoints
- [x] 24.5 Document deployment process
- [x] 24.6 Document database schema

## 25. Deployment Preparation

- [x] 25.1 Install all workspace dependencies with pnpm install
- [x] 25.2 Typecheck all packages (shared, frontend, backend)
- [x] 25.3 Run all tests with vitest
- [x] 25.4 Prepare database migration script
- [x] 25.5 Create deployment instructions in README

## 26. OpenSpec Documentation

- [x] 26.1 Initialize OpenSpec with Claude tool
- [x] 26.2 Create proposal.md with project overview
- [x] 26.3 Create design.md with technical decisions
- [x] 26.4 Create specs for all 8 capabilities
- [x] 26.5 Create tasks.md with implementation checklist
