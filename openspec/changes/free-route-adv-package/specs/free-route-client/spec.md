# Spec: Free Route Client

客户端 API 定义了统一的入口点，整合模型获取、缓存和筛选功能，提供简洁易用的使用接口。

## ADDED Requirements

### Requirement: Initialize client

系统 SHALL 提供客户端构造函数用于初始化配置。

#### Scenario: Initialize with default settings
- **WHEN** 调用 `new FreeRouteClient()`
- **THEN** 系统 SHALL 使用默认配置初始化
- **AND** 默认 `apiBase` SHALL 为 `/api/models`
- **AND** 默认 `cacheEnabled` SHALL 为 `true`
- **AND** 默认 `cacheTTL` SHALL 为 `300000` (5分钟)

#### Scenario: Initialize with custom options
- **WHEN** 调用 `new FreeRouteClient({ apiBase: 'https://...', cacheEnabled: false })`
- **THEN** 系统 SHALL 使用提供的配置覆盖默认值

#### Scenario: Initialize with OpenRouter API
- **WHEN** 调用 `new FreeRouteClient({ apiBase: 'https://openrouter.ai/api/v1/models', apiKey: 'sk-...' })`
- **THEN** 系统 SHALL 配置为直接使用 OpenRouter API
- **AND** 系统 SHALL 在请求中包含 `Authorization: Bearer <apiKey>` 头

### Requirement: Filter models

系统 SHALL 提供统一的 filter 方法用于筛选模型。

#### Scenario: Call filter with options
- **WHEN** 调用 `client.filter({ providers: ['google'] })`
- **THEN** 系统 SHALL 返回 `Promise<OpenRouterModel[]>`
- **AND** 系统 SHALL 自动获取模型列表（如果需要）
- **AND** 系统 SHALL 应用筛选条件
- **AND** 系统 SHALL 返回筛选结果

#### Scenario: Call filter multiple times
- **WHEN** 多次调用 `client.filter()` 并使用相同筛选条件
- **AND** 缓存已启用
- **THEN** 系统 SHALL 只在第一次调用时获取数据
- **AND** 后续调用 SHALL 使用缓存数据

### Requirement: Chained filter API

系统 SHALL 提供链式调用 API 进行筛选。

#### Scenario: Chain filter methods
- **WHEN** 调用 `client.filterByProviders(['google']).filterByModality('text').exec()`
- **THEN** 系统 SHALL 返回 `Promise<OpenRouterModel[]>`
- **AND** 系统 SHALL 按链式顺序应用每个筛选条件
- **AND** 最终调用 `exec()` SHALL 返回筛选结果

#### Scenario: Chain without exec
- **WHEN** 调用 `client.filterByProviders(['google']).filterByModality('text')` 但不调用 `exec()`
- **THEN** 系统 SHALL 返回链式对象而非 Promise
- **AND** 系统 SHALL 不执行实际筛选

#### Scenario: Reset chain
- **WHEN** 在链式调用后调用 `reset()` 方法
- **THEN** 系统 SHALL 清除所有已配置的筛选条件
- **AND** 系统 SHALL 可以开始新的链式调用

### Requirement: Cache control

系统 SHALL 提供缓存控制方法。

#### Scenario: Clear cache
- **WHEN** 调用 `client.clearCache()`
- **THEN** 系统 SHALL 清除所有缓存数据
- **AND** 下次 filter 调用 SHALL 重新获取数据

#### Scenario: Force refresh
- **WHEN** 调用 `client.forceRefresh()`
- **THEN** 系统 SHALL 忽略缓存强制从 API 获取最新数据
- **AND** 系统 SHALL 更新缓存

#### Scenario: Get cache stats
- **WHEN** 调用 `client.getCacheStats()`
- **THEN** 系统 SHALL 返回缓存统计信息
- **AND** 统计信息 SHALL 包括：size, lastUpdate, hits, misses

### Requirement: Error handling

系统 SHALL 在客户端层面提供友好的错误处理。

#### Scenario: Network error in filter
- **WHEN** 调用 `client.filter()` 时发生网络错误
- **THEN** 系统 SHALL 捕获底层 FetchError
- **AND** 系统 SHALL 抛出 `FreeRouteClientError`
- **AND** 错误信息 SHALL 说明是网络问题

#### Scenario: Invalid filter options
- **WHEN** 调用 `client.filter()` 并提供无效的筛选条件
- **THEN** 系统 SHALL 抛出 `ValidationError`
- **AND** 错误信息 SHALL 说明哪个参数无效

#### Scenario: Retry on failure
- **WHEN** API 调用失败且配置了 `retryAttempts > 0`
- **THEN** 系统 SHALL 自动重试指定次数
- **AND** 每次重试 SHALL 有指数退避延迟

### Requirement: Type safety

系统 SHALL 提供完整的 TypeScript 类型支持。

#### Scenario: Filter options type
- **WHEN** 调用 `client.filter()` 并传入 options 对象
- **THEN** 系统 SHALL 提供 `FilterOptions` 类型检查
- **AND** 所有可选字段 SHALL 有智能提示

#### Scenario: Chained API type inference
- **WHEN** 使用链式 API
- **THEN** 系统 SHALL 在每个链式方法后提供正确的类型推断
- **AND** `exec()` 方法 SHALL 返回 `Promise<OpenRouterModel[]>`

### Requirement: Environment detection

系统 SHALL 自动检测运行环境并适配。

#### Scenario: Browser environment
- **WHEN** 在浏览器环境中运行
- **THEN** 系统 SHALL 使用 `fetch` API
- **AND** 系统 SHALL 支持 CORS 预检请求

#### Scenario: Node.js environment
- **WHEN** 在 Node.js 环境中运行
- **THEN** 系统 SHALL 使用 `node-fetch` 或原生 fetch (Node 18+)
- **AND** 系统 SHALL 正确处理环境差异

#### Scenario: Cloudflare Workers environment
- **WHEN** 在 Cloudflare Workers 环境中运行
- **THEN** 系统 SHALL 使用 Workers 提供的 fetch API
- **AND** 系统 SHALL 遵循 Workers 的 API 限制

### Requirement: Utility methods

系统 SHALL 提供实用的工具方法。

#### Scenario: Get all models
- **WHEN** 调用 `client.getAllModels()`
- **THEN** 系统 SHALL 返回所有可用免费模型
- **AND** 不应用任何筛选条件

#### Scenario: Get model by ID
- **WHEN** 调用 `client.getModelById('google/gemini-pro')`
- **THEN** 系统 SHALL 返回指定 ID 的模型对象
- **AND** 如果模型不存在 SHALL 返回 `null`

#### Scenario: Get providers list
- **WHEN** 调用 `client.getProviders()`
- **THEN** 系统 SHALL 返回所有可用的提供商列表
- **AND** 列表 SHALL 去重并排序

#### Scenario: Get modalities list
- **WHEN** 调用 `client.getModalities()`
- **THEN** 系统 SHALL 返回所有可用的模态类型列表
- **AND** 列表 SHALL 去重并排序

### Requirement: Empty result handling

系统 SHALL 友好地处理筛选结果为空的场景。

#### Scenario: Empty filter result with warning
- **WHEN** 调用 `client.filter()` 且没有模型满足条件
- **AND** 配置了 `throwOnEmpty: false` (默认)
- **THEN** 系统 SHALL 返回空数组
- **AND** 系统 SHALL 在控制台输出警告信息
- **AND** 警告信息 SHALL 说明筛选条件和建议

#### Scenario: Empty filter result throws error
- **WHEN** 调用 `client.filter()` 且没有模型满足条件
- **AND** 配置了 `throwOnEmpty: true`
- **THEN** 系统 SHALL 抛出 `NoModelsFoundError`
- **AND** 错误信息 SHALL 包含使用的筛选条件
- **AND** 错误信息 SHALL 包含恢复建议（如尝试放宽筛选条件）

#### Scenario: Empty result with fallback
- **WHEN** 调用 `client.filter()` 且结果为空
- **AND** 配置了 `fallbackProvider`
- **THEN** 系统 SHALL 自动使用 fallbackProvider 重新筛选
- **AND** 系统 SHALL 返回 fallback 提供商的模型
- **AND** 系统 SHALL 记录警告说明使用了 fallback

### Requirement: Model availability verification

系统 SHALL 提供验证模型是否真正可用的功能。

#### Scenario: Verify single model availability
- **WHEN** 调用 `client.verifyModelAvailability(modelId)`
- **THEN** 系统 SHALL 返回 `Promise<ModelAvailabilityResult>`
- **AND** 结果 SHALL 包含：
  - `available: boolean` - 是否可用
  - `reason?: string` - 如果不可用，说明原因
  - `suggestion?: string` - 解决建议

#### Scenario: Verify multiple models availability
- **WHEN** 调用 `client.verifyModelsAvailability([modelIds])`
- **THEN** 系统 SHALL 并发验证所有模型
- **AND** 返回 `Promise<Record<string, ModelAvailabilityResult>>`
- **AND** 每个 modelId 对应一个验证结果

#### Scenario: Model available
- **WHEN** 模型验证通过且可正常使用
- **THEN** `available` SHALL 为 `true`
- **AND** `reason` SHALL 为 undefined

#### Scenario: Model requires privacy settings
- **WHEN** 模型验证失败，原因是隐私设置问题
- **THEN** `available` SHALL 为 `false`
- **AND** `reason` SHALL 为 "privacy_settings_required"
- **AND** `suggestion` SHALL 为 "请在 OpenRouter 账户设置中开启隐私选项"
- **AND** 系统 SHALL 提供 OpenRouter 设置链接

#### Scenario: Model deprecated or removed
- **WHEN** 模型验证失败，模型已下架
- **THEN** `available` SHALL 为 `false`
- **AND** `reason` SHALL 为 "model_deprecated"
- **AND** `suggestion` SHALL 建议使用替代模型

### Requirement: Filter with availability check

系统 SHALL 支持在筛选时验证模型可用性。

#### Scenario: Filter with automatic verification
- **WHEN** 调用 `client.filter()` 并配置 `verifyAvailability: true`
- **THEN** 系统 SHALL 在筛选后验证每个模型的可用性
- **AND** 系统 SHALL 只返回真正可用的模型
- **AND** 系统 SHALL 添加性能警告（验证会增加请求时间）

#### Scenario: Filter results with partial availability
- **WHEN** 筛选结果中有部分模型不可用
- **AND** 配置了 `verifyAvailability: true`
- **THEN** 系统 SHALL 只返回可用的模型
- **AND** 系统 SHALL 记录不可用模型的警告
- **AND** 警告 SHALL 包含不可用的原因和建议

### Requirement: Privacy-aware recommendations

系统 SHALL 提供隐私设置相关的建议和警告。

#### Scenario: Warn about models requiring privacy settings
- **WHEN** 系统检测到某些模型需要隐私设置
- **THEN** 系统 SHALL 提供 `getModelsRequiringPrivacySettings()` 方法
- **AND** 该方法 SHALL 返回需要隐私设置的模型列表
- **AND** 每个模型 SHALL 包含设置说明链接

#### Scenario: Suggest alternative models
- **WHEN** 调用 `client.getAlternatives(modelId)`
- **THEN** 系统 SHALL 返回推荐的替代模型列表
- **AND** 替代模型 SHALL 相似（相同提供商或模态）
- **AND** 优先推荐不需要特殊设置的模型
