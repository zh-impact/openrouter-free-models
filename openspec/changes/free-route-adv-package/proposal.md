# Proposal: Free Route Advanced Package

## Why

OpenRouter 的官方 `openrouter/route` 功能提供自动路由到可用免费模型的能力，但存在以下限制：
1. **缺乏可控性**：无法指定特定提供商（如 google、anthropic、meta）
2. **筛选能力弱**：无法按模态类型（text、image、text+image）、上下文长度等条件筛选
3. **灵活性不足**：无法进行关键词模糊匹配或组合多个筛选条件

这导致开发者在使用 OpenRouter 免费模型时，可能路由到不符合应用需求的模型，影响用户体验和应用性能。

## What Changes

- **新增 Package**: 创建 `@openrouter-free-models/free-route-adv` 独立 NPM package
- **模型获取功能**: 实现从 OpenRouter API 获取当前可用免费模型列表
- **多条件筛选器**: 提供灵活的筛选 API，支持：
  - 按提供商筛选（provider: google, anthropic, meta, mistral 等）
  - 按模态筛选（modality: text, text+image, image）
  - 按上下文长度筛选（minContextLength, maxContextLength）
  - 关键词模糊匹配（keyword: gemini 匹配 google 相关模型）
- **可选缓存层**: 提供可配置的缓存机制，减少 API 调用
- **TypeScript 支持**: 完整的类型定义和类型推断
- **环境兼容**: 同时支持浏览器环境、Node.js 和 Cloudflare Workers

## Capabilities

### New Capabilities

- **free-route-model-fetcher**: 获取并维护 OpenRouter 免费模型列表的能力，包括实时获取和可选缓存
- **free-route-filter**: 提供多条件组合筛选 API，支持按提供商、模态、上下文长度、关键词等条件过滤模型
- **free-route-client**: 统一的客户端 API，整合获取、筛选、缓存功能，提供简洁的调用接口
- **free-route-types**: TypeScript 类型定义，包括模型数据结构、筛选条件类型、返回值类型等

### Modified Capabilities

- 无（这是新增独立 package，不修改现有能力）

## Impact

### 新增代码
- `packages/free-route-adv/` - 新 package 目录
  - `src/` - 源代码
  - `src/types.ts` - 类型定义
  - `src/fetcher.ts` - 模型列表获取
  - `src/filter.ts` - 筛选逻辑
  - `src/client.ts` - 客户端 API
  - `src/cache.ts` - 缓存实现
  - `index.ts` - package 入口
  - `package.json` - package 配置
  - `tsconfig.json` - TypeScript 配置
  - `README.md` - 使用文档

### 依赖
- 复用现有类型：`@openrouter-free-models/shared` 中的 `OpenRouterModel` 类型定义
- 可选集成：可调用现有后端 `/api/models` 端点获取模型列表
- 测试工具：vitest 用于单元测试

### API 使用示例

```typescript
import { FreeRouteClient } from '@openrouter-free-models/free-route-adv';

const client = new FreeRouteClient({
  cacheEnabled: true,
  cacheTTL: 300000 // 5 minutes
});

// 获取所有 Google 相关的免费模型
const googleModels = await client.filter({
  providers: ['google'],
  modality: 'text'
});

// 获取高上下文长度的多模态模型
const multiModalModels = await client.filter({
  modality: 'text+image',
  minContextLength: 128000
});

// 关键词模糊匹配
const geminiModels = await client.filter({
  keyword: 'gemini'
});
```

### 非目标（Non-goals）

- 不替换 OpenRouter 官方的 `openrouter/route` 功能
- 不提供付费模型的筛选和路由
- 不实现模型评估、推荐或排名系统
- 不提供模型性能测试或 benchmark 功能
- 不实现复杂的 A/B 测试或流量分配逻辑

## Success Criteria

- [ ] Package 可独立安装和发布到 npm
- [ ] 支持浏览器、Node.js 和 Cloudflare Workers 三种环境
- [ ] 提供 TypeScript 类型定义，类型检查通过
- [ ] 筛选功能支持提供商、模态、上下文长度、关键词四种筛选条件
- [ ] 支持多条件组合筛选（AND 逻辑）
- [ ] 缓存功能可选且可配置 TTL
- [ ] 单元测试覆盖率 ≥ 80%
- [ ] 提供完整的使用文档和示例
- [ ] 与现有 `@openrouter-free-models/shared` 类型兼容
