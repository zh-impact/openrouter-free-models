# Design: Free Route Advanced Package

## Context

### Background
OpenRouter Free Models Monitor 项目已经建立了获取和监控免费模型的完整系统，包括后端 API (`/api/models`)、类型定义 (`@openrouter-free-models/shared`) 和前端展示。

当前项目复用了 `@openrouter-free-models/shared` package，其中定义了 `OpenRouterModel` 类型。新的 `free-route-adv` package 应该复用这些类型定义，避免重复。

### Current State
- 后端已有 `/api/models` 端点返回实时免费模型列表
- `@openrouter-free-models/shared` 定义了 `OpenRouterModel` 类型
- 前端直接使用这些数据，但缺乏灵活的筛选能力

### Constraints
- **类型兼容**: 必须与现有 `OpenRouterModel` 类型兼容
- **环境兼容**: 需要支持浏览器（使用 fetch API）、Node.js 和 Cloudflare Workers
- **零依赖**: 尽量减少外部依赖，保持轻量
- **TypeScript 优先**: 完整的类型支持

## Goals / Non-Goals

**Goals:**
- 提供简单易用的筛选 API，支持多条件组合
- 实现可选的内存缓存，提升性能
- 支持关键词模糊匹配（不仅仅是精确匹配）
- 提供完整的 TypeScript 类型定义
- 可作为独立 package 发布和使用

**Non-Goals:**
- 不实现持久化存储（缓存仅在内存中）
- 不提供实时推送或订阅功能
- 不实现复杂的评分或推荐算法
- 不替换或修改现有的后端 API

## Decisions

### 1. 架构设计：模块化分层

**Decision**: 采用三层架构

```
Client (统一入口)
  ↓
Fetcher (获取模型) + Cache (可选缓存)
  ↓
Filter (筛选逻辑)
```

**Rationale:**
- **关注点分离**: 获取、缓存、筛选各自独立，易于测试和维护
- **灵活性**: 用户可以只使用 Filter，或自定义 Fetcher
- **可扩展性**: 未来可以轻松添加新的数据源或筛选规则

**Alternatives Considered:**
- ❌ **单一类方案**: 所有功能在一个类中
  - 缺点：代码耦合，难以测试和扩展
- ❌ **函数式方案**: 纯函数，无状态管理
  - 缺点：缓存难以实现，使用体验差

### 2. 数据源策略：优先使用本地 API

**Decision**: 支持两种数据源模式

```typescript
// 模式 1: 使用项目后端 API（默认）
const client = new FreeRouteClient({
  apiBase: '/api/models'
});

// 模式 2: 直接请求 OpenRouter API
const client = new FreeRouteClient({
  apiBase: 'https://openrouter.ai/api/v1/models',
  apiKey: process.env.OPENROUTER_API_KEY
});
```

**Rationale:**
- **灵活性**: 支持不同使用场景（内部使用 vs 外部使用）
- **性能**: 本地 API 可能更快（有缓存、CDN）
- **降级策略**: 如果本地 API 不可用，可以切换到官方 API

### 3. 缓存实现：LRU 缓存

**Decision**: 使用 LRU (Least Recently Used) 缓存策略

```typescript
interface CacheOptions {
  enabled: boolean;
  ttl: number; // 毫秒
  maxSize: number; // 最大缓存条目数
}
```

**Rationale:**
- **内存效率**: LRU 自动淘汰最久未使用的数据，防止内存泄漏
- **性能**: 缓存命中时避免重复网络请求
- **可配置**: 用户可根据场景调整缓存策略

**Alternatives Considered:**
- ❌ **简单定时缓存**: 固定时间后失效
  - 缺点：无法控制内存使用，可能导致内存泄漏
- ❌ **持久化缓存**: 使用 localStorage 或 IndexedDB
  - 缺点：增加复杂度，异步操作影响性能

### 4. 筛选器设计：链式 API + 配置对象

**Decision:** 同时支持两种调用方式

```typescript
// 方式 1: 配置对象
const models = await client.filter({
  providers: ['google', 'anthropic'],
  modality: 'text',
  minContextLength: 32000
});

// 方式 2: 链式 API
const models = await client
  .filterByProviders(['google', 'anthropic'])
  .filterByModality('text')
  .filterByContextLength(32000)
  .exec();
```

**Rationale:**
- **灵活性**: 链式 API 提供更好的类型推断和代码提示
- **简洁性**: 配置对象适合简单场景
- **兼容性**: 两种方式底层使用相同逻辑

### 5. 环境兼容性：条件导出

**Decision:** 使用条件导出支持不同环境

```json
// package.json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "default": "./dist/index.js"
    }
  }
}
```

**Rationale:**
- **现代构建工具**: 支持 ES modules (ESM) 和 CommonJS (CJS)
- **TypeScript**: 完整的类型支持
- **向后兼容**: 支持旧版本的 Node.js

## Risks / Trade-offs

### Risk 1: OpenRouter API 限流
**Risk**: 频繁请求可能触发 API 限流
**Mitigation**: 实现缓存机制，默认启用缓存（TTL: 5分钟）

### Risk 2: 模型列表变更
**Risk**: OpenRouter 可能随时添加/删除模型，缓存数据可能过期
**Mitigation**:
- 提供 `forceRefresh()` 方法强制刷新
- 在缓存中存储 TTL，自动失效
- 文档中说明缓存策略

### Risk 3: 关键词匹配不准确
**Risk**: 模糊匹配可能返回不相关的模型
**Mitigation**:
- 提供多种匹配策略（exact, includes, startsWith, regex）
- 在文档中说明各策略的适用场景
- 提供预定义的提供商别名映射（如 gemini → google）

### Risk 4: 浏览器 CORS 问题
**Risk**: 直接请求 OpenRouter API 可能遇到 CORS 限制
**Mitigation**:
- 默认使用项目后端 API（已处理 CORS）
- 在文档中说明如果直接使用官方 API 需要配置代理

### Risk 5: 筛选结果为空的用户体验
**Risk**: 用户调用 filter() 返回空数组，不知道原因和如何解决
**Mitigation**:
- 提供三种处理模式：静默返回空数组、抛出详细错误、使用 fallback provider
- 默认输出警告信息到控制台，说明筛选条件和建议
- `NoModelsFoundError` 包含 `suggestions` 字段提供解决建议
- 支持配置 `fallbackProvider` 自动降级到备用提供商

### Risk 6: 模型实际不可用（Privacy Settings 问题）
**Risk**: 模型ID存在于列表中，但调用 chat API 时返回 404（需要配置隐私设置）
**Mitigation**:
- 提供 `verifyModelAvailability()` 方法验证模型是否真正可用
- 支持在 filter 时配置 `verifyAvailability: true` 自动验证
- `ModelAvailabilityResult` 包含详细的错误原因和解决建议
- 对于 privacy settings 问题，提供 OpenRouter 设置链接
- 提供 `getAlternatives()` 方法推荐可用的替代模型

### Risk 7: 可用性验证的性能影响
**Risk**: 验证每个模型的可用性会增加大量 HTTP 请求，影响性能
**Mitigation**:
- 验证功能默认关闭 (`verifyAvailability: false`)
- 支持缓存验证结果（`cacheResults: true`）
- 提供批量验证方法 `verifyModelsAvailability()` 减少请求次数
- 在文档中明确说明性能影响，建议仅在必要时使用
- 支持超时配置（`timeout`）避免长时间等待

## Data Flow

```
┌─────────────────┐
│   User Code     │
│  (Filter Call)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      FreeRouteClient            │
│  (Orchestration & Validation)   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│         Cache Layer              │
│    (Check / Store / Invalidate)  │
└────────┬────────────────────────┘
         │
    Cache Miss?
         │
         ▼
┌─────────────────────────────────┐
│      ModelFetcher               │
│   (HTTP Request / Parse)        │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│      ModelFilter                │
│  (Apply Filters / Transform)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│     Filtered Models[]           │
└────────┬────────────────────────┘
         │
         verifyAvailability?
         │
         ▼
┌─────────────────────────────────┐
│    Availability Checker          │
│  (Verify Each Model / Cache)    │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│    Available Models[]            │
│   (Remove Unavailable)           │
└─────────────────────────────────┘
```

**Enhanced Flow (with Availability Check):**

1. **Empty Result Handling**:
   - Check if filtered array is empty
   - If `throwOnEmpty: true` → throw NoModelsFoundError
   - If `fallbackProvider` set → retry with fallback
   - Otherwise → return empty array with console warning

2. **Availability Verification** (optional):
   - For each model in filtered list
   - Make lightweight request to check if model is accessible
   - If returns 404 with privacy error → mark as unavailable
   - Remove unavailable models from results
   - Return only verified available models

3. **Error Recovery**:
   - If verification fails → log warning, return partial results
   - Include `availability: 'unknown'` flag for unverified models
   - Provide suggestions in error messages

## File Structure

```
packages/free-route-adv/
├── src/
│   ├── types.ts              # 类型定义
│   ├── cache.ts              # 缓存实现
│   ├── fetcher.ts            # 模型列表获取
│   ├── filter.ts             # 筛选逻辑
│   ├── availability.ts       # 模型可用性验证（新增）
│   ├── client.ts             # 客户端 API
│   ├── utils.ts              # 工具函数
│   └── index.ts              # 导出入口
├── tests/
│   ├── cache.test.ts
│   ├── fetcher.test.ts
│   ├── filter.test.ts
│   ├── availability.test.ts  # 可用性验证测试（新增）
│   └── client.test.ts
├── package.json
├── tsconfig.json
├── vite.config.ts            # 构建配置
├── README.md
└── CHANGELOG.md
```

## Testing Strategy

- **单元测试**: 每个模块独立测试，覆盖率 ≥ 80%
- **集成测试**: 测试 Client 端到端流程
- **Mock 测试**: Mock HTTP 响应，确保测试稳定性
- **环境测试**: 在浏览器、Node.js、Workers 三种环境中测试

## Open Questions

1. **是否需要支持流式响应?**
   - 当前设计不支持，因为筛选需要完整模型列表
   - 未来可考虑添加流式筛选功能

2. **是否需要支持自定义匹配器?**
   - 当前设计只支持预定义的筛选条件
   - 未来可考虑添加 `customMatcher` 参数

3. **是否需要提供 CLI 工具?**
   - 当前设计仅提供编程 API
   - 未来可考虑添加 `npx free-route-adv` 命令行工具
