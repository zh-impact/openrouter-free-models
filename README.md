# OpenRouter Free Models Monitor

A monitoring system for tracking free AI models on OpenRouter. This application tracks changes to free models, provides historical data, and sends notifications when new models become available.

## Features

- 📊 **Real-time Model Tracking** - Monitor all free models available on OpenRouter
- 📜 **Change History** - View historical changes with timeline visualization
- 🔔 **Notifications** - Get notified when new models are added or removed
- 🌓 **Dark Mode** - Full dark mode support
- 🔍 **Search & Filter** - Find models by name, description, or modality
- ⚡ **Serverless** - Built on Cloudflare Workers for global availability
- 🔄 **Auto-sync** - Hourly automatic updates via Cron triggers

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  React Frontend │◄────┤  Hono API       │
│  (Vite)         │     │  (Cloudflare)   │
└─────────────────┘     └────────┬────────┘
                                 │
                         ┌───────┴────────┐
                         │                │
                    ┌────▼────┐    ┌─────▼────┐
                    │ D1 DB   │    │ Cron Job │
                    │(SQLite) │    │(hourly)  │
                    └─────────┘    └────┬─────┘
                                        │
                                  ┌─────▼─────────┐
                                  │ OpenRouter API│
                                  │ /api/v1/models│
                                  └───────────────┘
```

## Project Structure

```
openrouter-free-models/
├── apps/
│   ├── frontend/          # React + Vite frontend
│   │   ├── src/
│   │   │   ├── components/    # UI components
│   │   │   ├── hooks/         # Custom React hooks
│   │   │   ├── pages/         # Page components
│   │   │   └── main.tsx
│   │   └── package.json
│   │
│   └── backend/           # Hono + Cloudflare Workers
│       ├── src/
│       │   ├── routes/        # API routes
│       │   ├── services/      # Business logic
│       │   ├── lib/           # Utilities
│       │   └── index.ts
│       ├── wrangler.toml
│       └── package.json
│
├── packages/
│   └── shared/            # Shared types and constants
│       └── src/
│           ├── types.ts
│           └── constants.ts
│
└── scripts/               # Utility scripts
    ├── schema.sql         # Database schema
    ├── init-db.ts         # DB initialization
    └── sync.ts            # Manual sync
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Cloudflare account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd openrouter-free-models
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:

```bash
# Create D1 database
npx wrangler d1 create openrouter-models

# Update the database_id in apps/backend/wrangler.toml

# Run schema migration (local)
npx wrangler d1 execute openrouter-models --local --file=./scripts/schema.sql

# Run schema migration (production)
npx wrangler d1 execute openrouter-models --file=./scripts/schema.sql
```

### Development

1. Start the backend (Cloudflare Workers):
```bash
pnpm dev:backend
```

2. Start the frontend (Vite dev server):
```bash
pnpm dev:frontend
```

Or start both simultaneously:
```bash
pnpm dev
```

3. Open your browser to `http://localhost:5173`

### Building

```bash
pnpm build
```

## API Endpoints

### Models

- `GET /api/models` - Fetch current free models (real-time from OpenRouter)
- `GET /api/models/cached` - Fetch cached models from database
- `GET /api/models/:id` - Get a specific model by ID
- `GET /api/models/changes?limit=50&offset=0` - Get change history
- `POST /api/models/refresh` - Manually trigger a refresh

### Health

- `GET /api/health` - Health check endpoint
- `GET /api/info` - Application info

## Deployment

### Backend (Cloudflare Workers)

```bash
pnpm --filter backend deploy
```

### Frontend (Cloudflare Pages)

First, build the frontend:
```bash
pnpm --filter frontend build
```

Then deploy to Cloudflare Pages:
```bash
npx wrangler pages deploy dist --project-name=openrouter-free-models-frontend
```

## Configuration

### Environment Variables

Configure these in your Cloudflare Workers dashboard or `.dev.vars`:

- `OPENROUTER_API_KEY` - Optional API key for OpenRouter
- `CRON_SECRET` - Secret for securing cron endpoint
- `NOTIFICATION_EMAIL` - Email address for notifications
- `RESEND_API_KEY` - API key for sending emails via Resend

📖 **详细配置说明**: 查看 [docs/backend/configuration.md](docs/backend/configuration.md)

### Cron Schedule

The default cron schedule runs every hour (`0 * * * *`). Modify this in `wrangler.toml`:

```toml
[triggers]
crons = ["0 * * * *"]  # Every hour
```

## Testing

Run tests:
```bash
pnpm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Documentation

📚 **完整文档**: 查看 [docs/](docs/) 目录获取详细技术文档

### 文档分类

- **部署相关**
  - [Workers 环境配置指南](docs/deployment/workers-env-setup.md)
  - [Pages Functions 配置指南](docs/deployment/pages-functions-guide.md)

- **后端相关**
  - [API 认证与保护](docs/backend/api-auth.md)
  - [配置说明](docs/backend/configuration.md)

- **前端相关**
  - [路由说明](docs/frontend/routing.md)

- **功能相关**
  - [邮件订阅状态说明](docs/features/email-subscription-status.md)

### Claude Code 配置

如果你使用 Claude Code AI 助手，请查看 [claude.md](claude.md) 获取项目特定的配置和指令。

## License

MIT License - feel free to use this project for any purpose.

## Acknowledgments

- [OpenRouter](https://openrouter.ai/) for providing the API
- [Hono](https://hono.dev/) for the lightweight web framework
- [Cloudflare](https://workers.cloudflare.com/) for the serverless platform
