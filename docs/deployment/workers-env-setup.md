# Cloudflare Workers 环境变量配置指南

## 问题诊断

通过调试端点发现，`TELEGRAM_BOT_TOKEN` 环境变量在生产环境未配置。

需要配置的环境变量：
- `TELEGRAM_BOT_TOKEN` - Telegram Bot Token
- `TELEGRAM_WEBHOOK_URL` - Telegram Webhook URL（可选）

## 配置步骤

### 方式 1：通过 Cloudflare Dashboard（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 选择 **openrouter-free-models-api** Worker
4. 点击 **Settings** → **Variables and Secrets**
5. 添加以下环境变量：

| 变量名 | 值 | 类型 |
|--------|-----|------|
| `TELEGRAM_BOT_TOKEN` | `8602430457:AAH7-HbpD3OjeoF0Ti26SwS4A2vk1AU22Ik` | 加密 |
| `TELEGRAM_WEBHOOK_URL` | `https://openrouter-free-models-api.hz-studio.workers.dev/api/telegram/webhook` | 可选 |

6. 点击 **Deploy** 重新部署 Worker

### 方式 2：通过 wrangler.toml（需要更新 wrangler.toml）

编辑 `apps/backend/wrangler.toml`，添加 [vars] 部分：

```toml
name = "openrouter-free-models-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

# Environment variables
[vars]
APP_NAME = "OpenRouter Free Models Monitor"
TELEGRAM_BOT_TOKEN = "8602430457:AAH7-HbpD3OjeoF0Ti26SwS4A2vk1AU22Ik"
TELEGRAM_WEBHOOK_URL = "https://openrouter-free-models-api.hz-studio.workers.dev/api/telegram/webhook"

# D1 Database binding
[[d1_databases]]
binding = "DB"
database_name = "openrouter-models"
database_id = "518efbbb-f3aa-4142-b611-737f16dcc011"

# Cron triggers - run every hour
[triggers]
crons = ["0 * * * *"]
```

然后重新部署：
```bash
cd apps/backend
pnpm run deploy
```

## 验证配置

配置完成后，访问调试端点验证：
```bash
curl https://openrouter-free-models-api.hz-studio.workers.dev/api/debug/env
```

应该返回：
```json
{
  "telegram_bot_token": "SET",
  "telegram_bot_token_length": 51,
  "telegram_webhook_url": "SET",
  "has_telegram_token": true
}
```

## 测试 Telegram Bot

配置完成后测试：
```bash
# 测试 bot info 端点
curl https://openrouter-free-models-api.hz-studio.workers.dev/api/telegram/info

# 应该返回
{
  "username": "openrouter_free_models_bot",
  "link": "https://t.me/openrouter_free_models_bot"
}
```

## 相关文档

- Bot 信息：https://t.me/openrouter_free_models_bot
- Bot Token 前缀：`8602430457:AAH7-HbpD3OjeoF0Ti26SwS4A2vk1AU22Ik
