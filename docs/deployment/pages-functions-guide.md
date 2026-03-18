# Cloudflare Pages Bindings 配置指南

## 架构说明

当前项目使用 **Pages Functions 代理** 架构：

```
Frontend (Pages)
    ↓ fetch('/api/models')
Pages Functions (functions/api/[[path]].ts)
    ↓ 代理请求
Workers API (后端)
    ↓ 访问 D1 数据库
返回数据
```

**关键点：**
- ✅ **Pages Functions 不需要 D1 绑定**（它只是转发请求）
- ✅ **Workers 有 D1 绑定**（在 `apps/backend/wrangler.toml` 配置）
- ✅ Pages Functions 只需要 `WORKERS_API_URL` 环境变量

## 配置步骤

### 1. 配置 Workers (后端) - 已完成 ✅

`apps/backend/wrangler.toml` 已配置：
```toml
[[d1_databases]]
binding = "DB"
database_name = "openrouter-models"
database_id = "${D1_DATABASE_ID}"
```

部署时：
```bash
cd apps/backend
wrangler deploy
```

### 2. 配置 Pages (前端)

#### 方式 A：通过 Dashboard（推荐）

1. 进入 Cloudflare Dashboard → **Pages** → 你的项目
2. **Settings** → **Environment variables**
3. 添加变量：
   - **Production**: `WORKERS_API_URL` = `https://openrouter-free-models-api.hz-studio.workers.dev`
   - **Preview**: `WORKERS_API_URL` = `https://openrouter-free-models-api.hz-studio.workers.dev`

#### 方式 B：使用 wrangler.toml

将 `wrangler.toml.example` 重命名为 `wrangler.toml`：
```bash
cd apps/frontend
mv wrangler.toml.example wrangler.toml
```

然后部署：
```bash
cd apps/frontend
pnpm run deploy
```

### 3. 验证配置

部署后测试：
```bash
# 测试 API 代理
curl https://your-pages-domain.pages.dev/api/models

# 检查是否返回模型数据
```

## 如果 Pages Functions 需要直接访问 D1

如果将来需要在 Pages Functions 中直接访问数据库（不推荐当前架构），需要：

### 1. 创建共享 D1 数据库

```bash
# 创建 D1 数据库（如果还没有）
wrangler d1 create openrouter-models
```

### 2. 在 Pages 的 wrangler.toml 中配置

```toml
[[d1_databases]]
binding = "DB"
database_name = "openrouter-models"
database_id = "your-database-id"
```

### 3. 在 Pages Functions 中使用

```typescript
// functions/api/[[path]].ts
export async function onRequest(context) {
  const { request, env } = context;

  // 现在可以访问 env.DB
  const { results } = await env.DB.prepare("SELECT * FROM models").all();

  return Response.json(results);
}
```

## 当前架构的优势

1. **分离关注点**：
   - Frontend：只负责 UI
   - Pages Functions：只负责代理
   - Workers：负责业务逻辑和数据访问

2. **独立部署**：
   - 更新 Frontend 不影响 Backend
   - 更新 Backend 不影响 Frontend

3. **灵活扩展**：
   - 可以为多个前端提供同一个后端 API
   - 可以轻松切换后端 URL

## 环境变量参考

| 变量名 | 用途 | 配置位置 | 默认值 |
|--------|------|----------|--------|
| `WORKERS_API_URL` | 后端 API 地址 | Pages Settings 或 wrangler.toml | `https://openrouter-free-models-api.hz-studio.workers.dev` |
| `D1_DATABASE_ID` | D1 数据库 ID | Backend wrangler.toml 或 .dev.vars | - |
| `TELEGRAM_BOT_TOKEN` | Telegram Bot Token | Backend Settings 或 .dev.vars | - |
| `ADMIN_API_KEY` | 管理 API 密钥 | Backend Settings 或 .dev.vars | - |
| `CRON_SECRET` | Cron 任务密钥 | Backend Settings 或 .dev.vars | - |
