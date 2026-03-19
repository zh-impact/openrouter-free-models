# Spec: Free Route Model Fetcher

模型列表获取能力定义了如何从 OpenRouter 获取当前可用的免费模型列表，包括数据源配置、请求处理、错误处理和缓存集成。

## ADDED Requirements

### Requirement: Fetch from OpenRouter API

系统 SHALL 支持从 OpenRouter API 获取当前可用的免费模型列表。

#### Scenario: Successful fetch from OpenRouter API
- **WHEN** 调用 fetcher 并配置 `apiBase` 为 `https://openrouter.ai/api/v1/models`
- **AND** 提供有效的 `apiKey`
- **THEN** 系统 SHALL 返回完整的模型列表数组
- **AND** 每个模型 SHALL 包含 id, name, description, context_length, pricing, architecture 字段

#### Scenario: Fetch from project backend API
- **WHEN** 调用 fetcher 并配置 `apiBase` 为 `/api/models`
- **THEN** 系统 SHALL 从项目后端 API 获取模型列表
- **AND** 不需要提供 `apiKey`

#### Scenario: Fetch with cache hit
- **WHEN** 调用 fetcher 且缓存已启用
- **AND** 缓存中存在未过期的数据
- **THEN** 系统 SHALL 直接返回缓存数据
- **AND** 不发起 HTTP 请求

### Requirement: Handle API errors

系统 SHALL 正确处理 API 请求失败的情况。

#### Scenario: Network error
- **WHEN** API 请求因网络错误失败
- **THEN** 系统 SHALL 抛出包含错误信息的 `FetchError`
- **AND** 错误信息 SHALL 包含原始错误详情

#### Scenario: API rate limit
- **WHEN** API 返回 429 状态码
- **THEN** 系统 SHALL 抛出 `RateLimitError`
- **AND** 错误信息 SHALL 说明触发了限流

#### Scenario: Invalid API key
- **WHEN** API 返回 401 状态码
- **THEN** 系统 SHALL 抛出 `AuthenticationError`
- **AND** 错误信息 SHALL 说明 API key 无效

### Requirement: Parse model data

系统 SHALL 正确解析 API 返回的模型数据。

#### Scenario: Parse standard model format
- **WHEN** API 返回标准的模型数据格式
- **THEN** 系统 SHALL 解析并转换为 `OpenRouterModel` 类型
- **AND** 所有必需字段 SHALL 存在且类型正确

#### Scenario: Filter free models only
- **WHEN** API 返回包含付费和免费的模型
- **THEN** 系统 SHALL 只返回 `pricing.prompt === "0"` 或 `pricing.prompt === "0.0"` 的模型
- **AND** 其他模型 SHALL 被过滤掉

### Requirement: Cache integration

系统 SHALL 支持与缓存层集成。

#### Scenario: Store fetched models in cache
- **WHEN** 成功从 API 获取模型列表
- **AND** 缓存已启用
- **THEN** 系统 SHALL 将模型列表存储在缓存中
- **AND** 使用配置的 TTL 作为缓存过期时间

#### Scenario: Force refresh
- **WHEN** 调用 `forceRefresh()` 方法
- **THEN** 系统 SHALL 忽略缓存
- **AND** 系统 SHALL 强制从 API 获取最新数据
- **AND** 系统 SHALL 更新缓存

### Requirement: TypeScript type support

系统 SHALL 提供完整的 TypeScript 类型定义。

#### Scenario: Type definitions
- **WHEN** 使用 fetcher API
- **THEN** 系统 SHALL 提供完整的类型推断
- **AND** 返回值类型 SHALL 为 `Promise<OpenRouterModel[]>`

#### Scenario: Configuration types
- **WHEN** 配置 fetcher 选项
- **THEN** 系统 SHALL 提供 `FetcherOptions` 类型
- **AND** 所有配置项 SHALL 有类型检查和智能提示
