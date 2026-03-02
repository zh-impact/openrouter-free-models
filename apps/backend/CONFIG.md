# 配置说明

## 环境变量配置

本项目使用环境变量来管理敏感配置。请按以下步骤设置：

### 1. 创建环境变量文件

```bash
cp .dev.vars.example .dev.vars
```

### 2. 配置 D1 Database ID

**选项 A: 使用现有数据库**
```bash
# 查看现有数据库
npx wrangler d1 list
```

将数据库 ID 添加到 `.dev.vars`:
```
D1_DATABASE_ID=your-database-id-here
```

**选项 B: 创建新数据库**
```bash
npx wrangler d1 create openrouter-models
```

### 3. 本地开发

本地开发会自动读取 `.dev.vars` 文件：
```bash
pnpm dev
```

### 4. 部署

部署时需要设置环境变量：
```bash
# 方式 1: 使用 Cloudflare Dashboard
# Dashboard → Workers → Settings → Variables and Secrets

# 方式 2: 使用 wrangler secret
npx wrangler secret put D1_DATABASE_ID
```

## 配置文件说明

| 文件 | 状态 | 说明 |
|------|------|------|
| `wrangler.toml.template` | ✅ 提交 | 配置模板 |
| `.dev.vars` | ❌ 不提交 | 本地开发环境变量 |
| `.dev.vars.example` | ✅ 提交 | 环境变量示例 |

## 安全注意事项

- ✅ `.dev.vars` 已添加到 .gitignore
- ✅ `wrangler.toml` 使用环境变量占位符
- ❌ 不要将真实的 `database_id` 提交到 Git
- ✅ 定期轮换敏感密钥和令牌
