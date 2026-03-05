# OpenRouter Free Models Monitor

Claude Code 项目配置和自定义指令。

## 项目概述

一个监控 OpenRouter 免费 AI 模型的服务，提供实时模型列表、变更历史追踪和 Web 界面。

## 技术栈

- **语言**: TypeScript
- **后端**: Hono + Cloudflare Workers
- **前端**: React + Vite + TailwindCSS
- **数据库**: Cloudflare D1 (SQLite)
- **工具链**: pnpm workspace, Vitest
- **部署**: Cloudflare Pages + Workers

## 项目结构

```
├── apps/
│   ├── backend/          # Hono API (Cloudflare Workers)
│   │   ├── src/
│   │   │   ├── routes/   # API 路由
│   │   │   ├── services/ # 业务逻辑
│   │   │   └── lib/      # 工具库
│   │   └── wrangler.toml
│   └── frontend/         # React + Vite SPA
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   └── pages/
│       └── functions/    # Cloudflare Pages Functions
└── packages/
    └── shared/           # 共享类型和常量
```

## 开发命令

### 本地开发
```bash
# 后端 (端口 8788)
pnpm --filter backend dev

# 前端 (端口 5173)
pnpm --filter frontend dev

# 测试
pnpm test
```

### 构建
```bash
# 类型检查
pnpm --filter shared typecheck
pnpm --filter backend typecheck
pnpm --filter frontend typecheck

# 构建
pnpm --filter backend build
pnpm --filter frontend build
```

### 部署
```bash
# 后端到 Workers
cd apps/backend && pnpm run deploy

# 前端到 Pages
cd apps/frontend && pnpm run deploy
```

## 环境配置

### 环境变量

后端需要以下环境变量（在 `.dev.vars` 中配置）：
```
D1_DATABASE_ID=<database-id>
CRON_SECRET=<optional-secret>
```

### 数据库迁移

```bash
# 本地数据库
wrangler d1 execute openrouter-models --local --file=scripts/schema.sql

# 远程数据库
wrangler d1 execute openrouter-models --remote --file=scripts/schema.sql
```

## API 端点

- `GET /api/models` - 实时获取模型
- `GET /api/models/cached` - 从缓存获取
- `GET /api/models/:id` - 获取单个模型
- `GET /api/models/changes` - 变更历史
- `POST /api/models/refresh` - 手动刷新
- `GET /api/health` - 健康检查

## 工作流

### 使用 OPSX 管理变更

项目使用 OpenSpec (OPSX) 进行变更管理：

```bash
# 创建新变更
/opsx:new "add new feature"

# 查看变更状态
openspec status --change <change-name>

# 同步规范
/opsx:sync

# 验证实现
/opsx:verify

# 归档变更
/opsx:archive
```

### 变更目录

- **活动变更**: `openspec/changes/`
- **已归档**: `openspec/changes/archive/`
- **主规范**: `openspec/specs/`

## 代码规范

- **TypeScript**: 严格模式，ESM
- **风格**: Prettier + ESLint
- **提交**: Conventional Commits
- **分支**: main

## 重要文件

- `README.md` - 项目文档
- `packages/shared/src/types.ts` - 共享类型定义
- `packages/shared/src/constants.ts` - 常量配置
- `scripts/schema.sql` - 数据库迁移脚本

## 部署环境

- **Beta**: https://openrouter-free-models-frontend.pages.dev
- **API**: https://openrouter-free-models-api.hz-studio.workers.dev

## 注意事项

1. **本地开发** 使用 `.dev.vars` 配置（不提交到 Git）
2. **生产部署** 需要在 Cloudflare Dashboard 设置环境变量
3. **数据库 ID** 通过环境变量配置，不要硬编码
4. **Pages Functions** 用于代理 API 请求到 Workers 后端

## 获取帮助

```bash
# 查看所有可用命令
/opsx:explore

# OpenSpec 导览
openspec list

# 状态检查
openspec status
```
