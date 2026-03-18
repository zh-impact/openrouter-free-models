# OpenRouter Free Models Monitor - Documentation

欢迎来到项目文档中心！本文档索引了所有项目相关的技术文档。

## 📚 文档分类

### 🚀 Deployment (部署相关)
- [Workers 环境配置指南](deployment/workers-env-setup.md) - Cloudflare Workers 环境变量配置
- [Pages Functions 配置指南](deployment/pages-functions-guide.md) - Cloudflare Pages Functions 代理配置

### 🔧 Backend (后端相关)
- [API 认证与保护](backend/api-auth.md) - API 端点认证机制和安全最佳实践
- [配置说明](backend/configuration.md) - 后端环境变量和配置文件说明

### 🎨 Frontend (前端相关)
- [路由说明](frontend/routing.md) - React Router v7 路由配置和使用

### ✨ Features (功能相关)
- [邮件订阅状态说明](features/email-subscription-status.md) - 邮件订阅功能的当前状态和重新启用指南

## 🔗 相关资源

- **项目说明**: [README.md](../README.md) - 项目概述和快速开始
- **Claude 配置**: [claude.md](../claude.md) - Claude Code AI 助手配置和指令
- **OpenSpec**: [openspec/](../openspec/) - 规范驱动的开发流程和变更管理

## 📖 快速导航

### 新手入门
1. 从 [README.md](../README.md) 了解项目概述
2. 查看 [配置说明](backend/configuration.md) 配置开发环境
3. 阅读 [Workers 环境配置指南](deployment/workers-env-setup.md) 设置生产环境

### 功能开发
- 后端开发: [API 认证与保护](backend/api-auth.md)
- 前端开发: [路由说明](frontend/routing.md)
- 部署上线: [Pages Functions 配置指南](deployment/pages-functions-guide.md)

### 功能参考
- 邮件订阅: [邮件订阅状态说明](features/email-subscription-status.md)
- Telegram Bot: 参见 [API 认证与保护](backend/api-auth.md) 的 Telegram 端点部分

## 🤝 贡献指南

文档应该与代码保持同步。在修改功能时，请同步更新相关文档：

- 添加新 API 端点 → 更新 `backend/api-auth.md`
- 修改环境变量 → 更新 `backend/configuration.md` 和 `deployment/workers-env-setup.md`
- 添加新路由 → 更新 `frontend/routing.md`
- 修改功能状态 → 更新 `features/` 目录下的相关文档

## 📝 文档规范

- 使用清晰的中文表述
- 提供代码示例和使用场景
- 保持文档与实际代码一致
- 添加适当的 emoji 增强可读性
- 使用 Markdown 格式，保持结构清晰
