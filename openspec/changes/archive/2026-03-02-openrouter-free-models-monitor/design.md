# Technical Design: OpenRouter Free Models Monitor

## Context

The OpenRouter Free Models Monitor is a full-stack web application designed to track free AI models available on the OpenRouter platform. The system needs to:

- **Fetch data periodically** from OpenRouter's public API
- **Detect changes** between current and previous model states
- **Store historical data** for change tracking and analysis
- **Serve data** via REST API to a web dashboard
- **Run serverlessly** on Cloudflare's edge platform for global availability
- **Scale automatically** without server management

### Constraints

- **Serverless-only**: Must run on Cloudflare Workers (no traditional servers)
- **Database limits**: D1 has size limits (currently 500MB per database)
- **Cron limits**: Cloudflare Cron triggers have minimum 1-minute intervals
- **API limits**: OpenRouter API has rate limits (though public endpoints are relatively open)
- **Edge execution**: All code must be compatible with V8 isolate runtime

## Goals / Non-Goals

**Goals:**
- Provide real-time visibility into OpenRouter's free model catalog
- Maintain accurate historical change records
- Deliver responsive web interface with < 2s page loads
- Enable hourly automatic synchronization
- Support manual refresh on demand
- Scale to handle hundreds of concurrent users

**Non-Goals:**
- Real-time WebSocket connections (polling/refresh is sufficient)
- User authentication (public monitoring tool)
- Payment integration or API key management
- Advanced analytics beyond basic change tracking
- Multi-tenant support

## Decisions

### 1. Cloudflare Workers + D1 (vs. Traditional Hosting)

**Decision:** Use Cloudflare Workers for API and D1 for database.

**Rationale:**
- **Zero cold starts**: Workers execute instantly at the edge
- **Global distribution**: Automatic deployment to 300+ locations
- **Free tier generous**: 100k requests/day free
- **D1 integration**: Native SQLite database binding
- **Cron triggers**: Built-in scheduled execution
- **No ops**: No server management or scaling concerns

**Alternatives considered:**
- **Vercel/Netlify + PostgreSQL**: Would require separate database hosting and higher cost
- **AWS Lambda + RDS**: More complex setup, higher latency, regional (not global)
- **Traditional VPS**: Requires manual scaling, maintenance, and DevOps overhead

### 2. Monorepo with pnpm Workspace (vs. Separate Repositories)

**Decision:** Use pnpm workspace with apps/ and packages/ structure.

**Rationale:**
- **Code sharing**: Type definitions and constants shared between frontend/backend
- **Atomic commits**: Changes across packages committed together
- **Simplified CI/CD**: Single repository for entire system
- **Type safety**: TypeScript types propagated across workspace boundaries
- **Development speed**: Changes tested together before deployment

**Alternatives considered:**
- **Separate repos**: Would complicate API contract synchronization
- **Single package**: No separation of concerns, harder to scale

### 3. Hono Framework (vs. Express/Fastify)

**Decision:** Use Hono for backend API.

**Rationale:**
- **Workers-native**: Designed specifically for Cloudflare Workers runtime
- **Type-safe**: Excellent TypeScript support with typed contexts
- **Small bundle**: < 20KB compared to Express's 500KB+
- **Modern**: Built for edge computing with Web standards
- **Hono middleware**: Built-in CORS, logging, etc.

**Alternatives considered:**
- **Workers native**: Would require more boilerplate for routing/middleware
- **itty-router**: Less mature, smaller community

### 4. React + Vite (vs. Next.js/Nuxt)

**Decision:** Use React with Vite for frontend.

**Rationale:**
- **Vite speed**: Instant HMR, fast builds (< 1s)
- **Simple deployment**: Static files deployable to Cloudflare Pages
- **No SSR needed**: API-driven SPA, server rendering not required
- **Smaller bundle**: Compared to Next.js full framework
- **Development experience**: Vite's dev server is faster than Next.js

**Alternatives considered:**
- **Next.js**: Overkill for API-driven SPA, Workers Edge Functions add complexity
- **Svelte**: Less ecosystem, harder to find developers

### 5. SQLite via D1 (vs. PostgreSQL/MySQL)

**Decision:** Use Cloudflare D1 (SQLite) for database.

**Rationale:**
- **Edge-native**: Built for Cloudflare Workers
- **Free tier**: 5GB storage, 5M reads/day free
- **Simple schema**: Relational data fits SQLite well
- **No connections**: Direct binding, no connection pooling needed
- **Replication**: Automatic replication across edge locations

**Alternatives considered:**
- **Neon/PlanetScale**: Would add external dependency, higher cost
- **Worker KV**: Not relational, limited query capabilities

### 6. Cron-Triggered Sync (vs. Event-Driven)

**Decision:** Use Cloudflare Cron triggers for hourly sync.

**Rationale:**
- **Simple**: Built-in scheduling, no external services
- **Reliable**: Automatically retries on failure
- **Cost-effective**: Included in Workers free tier
- **Sufficient**: Hourly updates adequate for model catalog changes

**Alternatives considered:**
- **GitHub Actions**: Would require worker webhook endpoint
- **Event-driven (webhooks)**: OpenRouter doesn't provide change webhooks
- **Queue-based**: Overkill for this use case

### 7. Change Detection Algorithm

**Decision:** Use Map-based comparison with field-level diffing.

**Rationale:**
- **O(n) complexity**: Single pass through models using Map lookups
- **Memory efficient**: Only stores current state in memory
- **Accurate**: Field-level comparison catches pricing/description changes
- **Deterministic**: Same inputs produce same diff output

**Algorithm:**
```
1. Create Map from previous models (id -> model)
2. Iterate current models:
   - If not in previous → ADDED
   - If in previous but changed → MODIFIED
   - If in previous and unchanged → (no change)
3. Find previous models not in current → REMOVED
```

### 8. API Design (REST vs. GraphQL)

**Decision:** Use REST API with JSON responses.

**Rationale:**
- **Simple**: Easy to understand, debug, and cache
- **HTTP-native**: Leverages caching headers, status codes
- **Mobile-friendly**: Easy to consume from any HTTP client
- **Overfetching acceptable**: Model list is ~50 items, not massive

**Alternatives considered:**
- **GraphQL**: Overkill for this simple API, adds complexity
- **tRPC**: Type-safe but couples frontend/backend, limits flexibility

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Browser                            │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages (CDN)                       │
│                   Frontend Static Assets                        │
│              (React SPA built with Vite)                        │
└─────────────────────────────────────────────────────────────────┘
                              │ API Calls
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Cloudflare Workers (Edge)                      │
│                      Hono API                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Routes:                                                │   │
│  │  - GET  /api/models        → Fetch from OpenRouter      │   │
│  │  - GET  /api/models/cached → Fetch from D1             │   │
│  │  - GET  /api/models/:id    → Get specific model         │   │
│  │  - GET  /api/models/changes→ Get change history         │   │
│  │  - POST /api/models/refresh → Trigger sync              │   │
│  │  - GET  /api/health        → Health check               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────┬────────────────────────────────────┬──────────────┘
              │                                    │
              ▼                                    ▼
┌─────────────────────────┐        ┌──────────────────────────────┐
│   Cloudflare D1         │        │    External APIs              │
│   (SQLite Database)     │        │    - OpenRouter /api/v1/models│
│  ┌──────────────────┐   │        │    - Resend (email)          │
│  │ - models         │   │        │    - Custom webhooks         │
│  │ - model_changes  │   │        └──────────────────────────────┘
│  │ - notifications  │   │
│  └──────────────────┘   │
└─────────────────────────┘

         ▲
         │
         │  (Hourly Trigger)
┌────────┴────────┐
│  Cloudflare Cron │
│  "0 * * * *"    │
└─────────────────┘
```

### Data Flow

**Sync Flow (Cron or Manual):**
1. Cron triggers `/cron/sync` endpoint (authenticated)
2. `OpenRouterService.fetchFreeModels()` fetches from OpenRouter API
3. `StorageService.getActiveModels()` gets current state from D1
4. `DiffService.detectChanges()` compares and identifies changes
5. `StorageService.saveChanges()` upserts models and creates change records
6. `NotificationService.sendChanges()` sends alerts (if configured)

**Frontend Data Fetch:**
1. User visits `/` or `/changes`
2. `useModels()` or `useChanges()` hooks call API endpoints
3. API fetches from D1 (cached) or OpenRouter (real-time)
4. React components render with data

### Database Schema

```sql
-- Models table: Current and historical free models
CREATE TABLE models (
  id TEXT PRIMARY KEY,              -- OpenRouter model ID (e.g., "openai/gpt-3.5-turbo:free")
  name TEXT NOT NULL,               -- Display name
  description TEXT,                 -- Model description
  context_length INTEGER,           -- Max context tokens
  pricing_prompt TEXT,              -- Prompt price (usually "0")
  pricing_completion TEXT,          -- Completion price (usually "0")
  architecture TEXT,                -- JSON string of architecture details
  first_seen_at TEXT,               -- ISO timestamp first detected
  last_seen_at TEXT,                -- ISO timestamp last seen
  is_active BOOLEAN DEFAULT 1       -- Still available as free
);

-- Changes table: Historical change records
CREATE TABLE model_changes (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL,
  change_type TEXT NOT NULL,        -- 'added', 'removed', 'modified'
  detected_at TEXT NOT NULL,        -- ISO timestamp
  old_data TEXT,                    -- JSON of previous state (null for added)
  new_data TEXT,                    -- JSON of new state (null for removed)
  FOREIGN KEY (model_id) REFERENCES models(id)
);

-- Notifications table: Delivery tracking
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,
  change_id TEXT,                   -- References model_changes.id
  sent_at TEXT NOT NULL,
  status TEXT NOT NULL,             -- 'pending', 'sent', 'failed'
  error_message TEXT,
  FOREIGN KEY (change_id) REFERENCES model_changes(id)
);
```

### Package Structure

```
openrouter-free-models/
├── apps/
│   ├── backend/                   # Cloudflare Workers API
│   │   ├── src/
│   │   │   ├── routes/           # API route handlers
│   │   │   │   ├── models.ts     # Model endpoints
│   │   │   │   └── health.ts     # Health endpoints
│   │   │   ├── services/         # Business logic
│   │   │   │   ├── openrouter.ts # OpenRouter API client
│   │   │   │   ├── storage.ts    # D1 database operations
│   │   │   │   └── notification.ts # Notification service
│   │   │   └── lib/              # Utilities
│   │   │       ├── db.ts         # Database types
│   │   │       └── diff.ts       # Change detection algorithm
│   │   ├── wrangler.toml         # Cloudflare config
│   │   └── package.json
│   │
│   └── frontend/                  # React + Vite SPA
│       ├── src/
│       │   ├── components/       # React components
│       │   │   ├── Header.tsx
│       │   │   ├── ModelCard.tsx
│       │   │   ├── ModelList.tsx
│       │   │   ├── ChangeTimeline.tsx
│       │   │   ├── RefreshButton.tsx
│       │   │   └── SearchBar.tsx
│       │   ├── hooks/           # Custom React hooks
│       │   │   ├── useModels.ts
│       │   │   └── useChanges.ts
│       │   ├── pages/           # Page components
│       │   │   ├── ModelsPage.tsx
│       │   │   └── ChangesPage.tsx
│       │   └── main.tsx
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── packages/
│   └── shared/                   # Shared types and constants
│       ├── src/
│       │   ├── types.ts         # TypeScript interfaces
│       │   └── constants.ts     # API endpoints, constants
│       └── package.json
│
├── scripts/                     # Utility scripts
│   ├── schema.sql              # D1 database migration
│   ├── init-db.ts              # DB initialization script
│   └── sync.ts                 # Manual sync script
│
├── pnpm-workspace.yaml          # Monorepo configuration
├── package.json
└── tsconfig.base.json
```

## Risks / Trade-offs

### Risk: D1 Database Size Limits

**Risk**: D1 databases currently limited to 500MB. With hundreds of models and years of change history, could exceed limit.

**Mitigation**:
- Change history grows slowly (~50 models × 365 days × small records)
- Implement cleanup job to archive changes older than 1 year
- Monitor storage via `wrangler d1 info`
- Can migrate to larger D1 instance or alternative if needed

### Risk: OpenRouter API Rate Limiting

**Risk**: OpenRouter may rate limit or require authentication in future.

**Mitigation**:
- Cache results in D1 to minimize API calls
- Only fetch hourly via cron (not per-request)
- Support optional API key configuration
- Graceful degradation: serve cached data if API fails

### Risk: Cron Job Failures

**Risk**: Cron trigger could fail silently, leaving data stale.

**Mitigation**:
- Implement health check endpoint that reports `last_sync` timestamp
- Alert if `last_sync` is > 2 hours old
- Manual refresh available via `/api/models/refresh`
- Cloudflare Workers logs for debugging

### Risk: False Change Detection

**Risk**: OpenRouter API might return data in different order/format, triggering false "modified" changes.

**Mitigation**:
- Normalize data before comparison (sort arrays, trim strings)
- Compare only meaningful fields (ignore timestamps, ordering)
- Test against real API responses

### Trade-off: Real-time vs. Cached Data

**Decision**: Provide both real-time (`/api/models`) and cached (`/api/models/cached`) endpoints.

**Trade-off**:
- **Real-time**: Always accurate but slower (API call + parsing)
- **Cached**: Fast (< 50ms) but may be up to 1 hour stale

**Rationale**: Users can choose based on use case. Dashboard defaults to cached for speed, refresh button fetches real-time.

### Trade-off: Notification Frequency

**Decision**: Send one notification per sync batch, not per model change.

**Trade-off**:
- **Per-change**: More granular but potentially spammy
- **Per-batch**: Higher signal-to-noise but less immediate

**Rationale**: Hourly batch is reasonable. Users can check dashboard for details.

## Migration Plan

### Deployment Steps

1. **Create D1 Database**
   ```bash
   npx wrangler d1 create openrouter-models
   # Copy database_id to wrangler.toml
   ```

2. **Run Migrations**
   ```bash
   npx wrangler d1 execute openrouter-models --local --file=./scripts/schema.sql
   npx wrangler d1 execute openrouter-models --file=./scripts/schema.sql
   ```

3. **Deploy Backend**
   ```bash
   pnpm --filter backend build
   pnpm --filter backend deploy
   ```

4. **Build and Deploy Frontend**
   ```bash
   pnpm --filter frontend build
   npx wrangler pages deploy dist --project-name=openrouter-free-models
   ```

5. **Verify Cron**
   - Check Cloudflare Dashboard > Workers > Scheduled Events
   - Verify cron trigger executes hourly

6. **Test Endpoints**
   ```bash
   curl https://your-worker.workers.dev/api/health
   curl https://your-worker.workers.dev/api/models
   ```

### Rollback Strategy

- **Backend**: `wrangler rollback` to previous deployment
- **Frontend**: Cloudflare Pages has rollback in dashboard
- **Database**: D1 changes are additive, no destructive migrations
- **Cron**: Can be disabled in `wrangler.toml` and redeploy

### Monitoring

- **Health endpoint**: `GET /api/health` returns `last_sync` timestamp
- **Logs**: Cloudflare Workers Logs in dashboard
- **Analytics**: Cloudflare Web Analytics for frontend
- **Alerting**: Set up via Cloudflare Email Workers (future)

## Open Questions

1. **Notification channels**: Should we add Slack/Discord notifications?
   - Decision: Email/webhook extensible, add later if requested

2. **Change retention**: How long to keep change history?
   - Decision: Keep 1 year by default, configurable via cleanup job

3. **API authentication**: Should we require API keys for some endpoints?
   - Decision: Public monitoring tool, no auth needed now. Add if abused.

4. **Model details**: Should we fetch additional model metadata (e.g., benchmarks)?
   - Decision: Current OpenRouter API response sufficient. Add if data becomes available.

5. **Rate limiting**: Should we implement rate limiting on API?
   - Decision: Cloudflare Workers has built-in DDoS protection. Add application-level rate limit if abused.
