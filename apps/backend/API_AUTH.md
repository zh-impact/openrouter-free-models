# API 认证与保护文档

本文档说明 OpenRouter Free Models Monitor API 的认证和保护机制。

## 🔐 认证方式

### 1. 管理员 API Key

用于保护管理端点，如查看订阅者、广播消息等。

**配置方式：**

在 `.dev.vars` 文件中添加：
```bash
ADMIN_API_KEY=your-secure-api-key-here
```

生成安全的 API Key：
```bash
# 使用 OpenSSL 生成随机密钥
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**使用方式：**

```bash
# 在请求头中添加 Authorization
curl -H "Authorization: Bearer your-admin-api-key-here" \
  http://localhost:8787/api/subscriptions/list
```

### 2. Cron Secret

用于保护定时任务端点（如数据同步、每日摘要）。

**配置方式：**

```bash
CRON_SECRET=your-cron-secret-here
```

**使用方式：**

```bash
# Cron 任务配置
curl -H "Authorization: Bearer your-cron-secret-here" \
  http://localhost:8787/cron/daily-digest
```

### 3. Unsubscribe Token

用于用户退订邮件订阅，通过邮件中的链接自动验证。

**Token 格式：** UUID v4

**示例：**
```
GET /api/subscriptions/unsubscribe?token=e52e825c-22a2-4126-9575-2c0dd57f0096
```

## 📋 API 端点分类

### 🔓 公开端点（无需认证）

| 端点 | 方法 | 描述 | 频率限制 |
|------|------|------|----------|
| `/api/models` | GET | 获取当前免费模型 | 100/分钟 |
| `/api/models/cached` | GET | 获取缓存的模型列表 | 100/分钟 |
| `/api/models/:id` | GET | 获取单个模型详情 | 100/分钟 |
| `/api/models/changes` | GET | 获取变更历史 | 100/分钟 |
| `/api/health` | GET | 健康检查 | 无限制 |
| `/api/subscriptions` | POST | 订阅邮件通知 | 5/分钟/IP |
| `/api/subscriptions/unsubscribe` | GET | 取消订阅 | 无限制 |
| `/api/subscriptions/confirm` | GET | 确认订阅 | 无限制 |
| `/api/subscriptions/status` | GET | 查看订阅状态 | 无限制 |
| `/api/telegram/info` | GET | 获取 Telegram Bot 信息 | 100/分钟 |
| `/api/telegram/webhook` | POST | Telegram Webhook | Telegram 验证 |

### 🔒 管理端点（需要 Admin API Key）

| 端点 | 方法 | 描述 | 所需权限 |
|------|------|------|----------|
| `/api/subscriptions/list` | GET | 查看所有邮件订阅者 | Admin API Key |
| `/api/subscriptions/:id` | DELETE | 删除订阅者 | Admin API Key |
| `/api/telegram/send` | POST | 发送消息给指定订阅者 | Admin API Key |
| `/api/telegram/broadcast` | POST | 广播消息给所有订阅者 | Admin API Key |
| `/api/telegram/subscribers` | GET | 查看所有 Telegram 订阅者 | Admin API Key |

### ⏰ 定时任务端点（需要 Cron Secret）

| 端点 | 方法 | 描述 | 所需权限 |
|------|------|------|----------|
| `/cron/sync` | GET | 同步模型数据 | Cron Secret |
| `/cron/daily-digest` | GET | 发送每日摘要 | Cron Secret |

### 🧪 测试端点（仅开发环境）

| 端点 | 方法 | 描述 | 注意事项 |
|------|------|------|----------|
| `/api/telegram/test/add` | POST | 添加测试订阅者 | 仅本地开发 |
| `/api/telegram/test/list` | GET | 查看测试订阅者 | 仅本地开发 |
| `/api/telegram/test/send` | POST | 发送测试消息 | 仅本地开发 |
| `/api/telegram/test/broadcast` | POST | 广播测试消息 | 仅本地开发 |
| `/api/telegram/test/daily-digest` | POST | 测试每日摘要格式 | 仅本地开发 |

## 🛡️ 保护机制

### 频率限制

**订阅端点：** 5 次/分钟/IP
**其他公开端点：** 100 次/分钟/IP

超过限制返回：
```json
{
  "error": "Too many requests",
  "retryAfter": 45
}
```

### Token 验证

**Unsubscribe Token：** UUID 格式验证
- 必须是有效的 UUID v4 格式
- 验证失败返回 400 错误

### 开发环境豁免

在开发环境（`DEBUG=true`），Cron Secret 验证可以被跳过：

```bash
# .dev.vars
DEBUG=true
```

## 📝 使用示例

### 查看所有邮件订阅者

```bash
curl -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  http://localhost:8787/api/subscriptions/list
```

响应：
```json
{
  "total": 42,
  "subscribers": [
    {
      "id": "...",
      "email": "user@example.com",
      "status": "active",
      "subscribed_at": "2026-03-06T10:30:00Z",
      "last_notified_at": "2026-03-06T09:00:00Z"
    }
  ]
}
```

### 发送 Telegram 广播

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message": "🎉 System update complete!"}' \
  http://localhost:8787/api/telegram/broadcast
```

响应：
```json
{
  "success": true,
  "total": 15,
  "sent": 14,
  "failed": 1
}
```

### 手动触发每日摘要

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:8787/cron/daily-digest
```

## ⚠️ 安全最佳实践

1. **使用强随机密钥**
   - 至少 32 字符
   - 包含大小写字母、数字、特殊字符

2. **定期轮换密钥**
   - 每季度更换 API Key
   - 怀疑泄露时立即更换

3. **限制 API Key 访问范围**
   - 不同的密钥用于不同的环境
   - 生产环境使用独立密钥

4. **监控 API 使用**
   - 记录管理端点调用日志
   - 设置异常使用告警

5. **HTTPS 传输**
   - 生产环境必须使用 HTTPS
   - 防止中间人攻击

6. **环境变量保护**
   - 不要提交 `.dev.vars` 到 Git
   - 使用 Cloudflare Secrets 管理生产环境变量
