# OpenRouter Free Models Monitor

## Why

OpenRouter provides numerous AI models with free tiers, but these free models change frequently without any centralized tracking. Users and developers need a reliable way to:
- Discover currently available free models
- Track when new free models are added
- Get notified when free models are removed or modified
- Access historical data about free model availability

This project solves that problem by building a complete monitoring system that tracks OpenRouter's free models in real-time and provides a web interface for browsing and historical analysis.

## What Changes

This is a new project that introduces:

- **Real-time Model Monitoring**: Backend service that fetches free models from OpenRouter API hourly
- **Change Detection System**: Tracks additions, removals, and modifications to free models
- **Web Dashboard**: React-based UI for browsing current free models with search and filtering
- **Change History**: Timeline view of all historical changes to the free model catalog
- **Notification System**: Email/webhook alerts when new free models are detected
- **Serverless Architecture**: Built on Cloudflare Workers + D1 for global availability

## Capabilities

### New Capabilities

- **model-fetching**: Capability to fetch and parse models from OpenRouter's `/api/v1/models` endpoint, filtering for models ending with `:free` suffix. Includes retry logic and error handling.

- **change-detection**: Capability to compare current model state against previous state, detecting additions, removals, and modifications. Generates change records with timestamps.

- **model-storage**: Capability to persist models and changes in Cloudflare D1 database (SQLite). Supports upsert operations, active/inactive model tracking, and change history queries.

- **model-api**: REST API endpoints for:
  - `GET /api/models` - Real-time model list from OpenRouter
  - `GET /api/models/cached` - Cached model list from database
  - `GET /api/models/changes` - Paginated change history
  - `POST /api/models/refresh` - Manual trigger for sync
  - `GET /api/health` - Health check endpoint

- **web-dashboard**: Web interface with:
  - Model list page with search, filtering by modality (text/image/video)
  - Model cards displaying context length, pricing, and architecture
  - Dark mode support
  - Real-time refresh capability

- **change-timeline**: Visual timeline interface showing historical changes with color-coded indicators for added (green), removed (red), and modified (yellow) models.

- **scheduled-sync**: Cron-triggered hourly synchronization that:
  - Fetches latest models from OpenRouter
  - Detects changes
  - Updates database
  - Triggers notifications

- **notifications**: Notification service supporting:
  - Email notifications (via Resend integration)
  - Webhook notifications (HTTP POST to configured URL)
  - Configurable notification channels

### Modified Capabilities

None - this is a new project.

## Impact

### Technology Stack
- **Backend**: Hono framework on Cloudflare Workers (serverless)
- **Frontend**: React + Vite + TailwindCSS
- **Database**: Cloudflare D1 (SQLite)
- **Package Manager**: pnpm workspace (monorepo)
- **Testing**: Vitest
- **Deployment**: Cloudflare Pages (frontend) + Workers (backend)

### API Integration
- **OpenRouter API**: Fetches models from `https://openrouter.ai/api/v1/models` (no auth required for public endpoints)
- **Optional API Key**: Supports `OPENROUTER_API_KEY` for authenticated requests

### Database Schema
- `models` table: Current and historical free models
- `model_changes` table: Change records with type (added/removed/modified)
- `notifications` table: Notification delivery tracking
- Indexes for performant queries on active models and change history

### Environment Variables
- `OPENROUTER_API_KEY`: Optional API key for OpenRouter
- `CRON_SECRET`: Secret for securing cron endpoint
- `NOTIFICATION_EMAIL`: Email address for notifications
- `RESEND_API_KEY`: API key for sending emails

### Dependencies
- **Runtime**: Cloudflare Workers runtime, Node.js 20+
- **Build**: TypeScript 5.3+, Vite 5
- **Dev**: pnpm 8+, Wrangler CLI

### Deployment Considerations
- Requires Cloudflare account with Workers and D1 enabled
- D1 database must be created and migrated before first deployment
- Cron trigger configured for hourly execution
- Frontend proxy configuration for API calls during development

### Files Created
- 47 source files across backend, frontend, and shared packages
- Database migration script (`scripts/schema.sql`)
- Test suites for core services (diff detection, OpenRouter client)
- Comprehensive README with setup instructions
