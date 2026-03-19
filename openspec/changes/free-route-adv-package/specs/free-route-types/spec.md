# Spec: Free Route Types

类型定义能力定义了 package 中所有 TypeScript 类型和接口，确保类型安全和良好的开发体验。

## ADDED Requirements

### Requirement: OpenRouterModel compatibility

系统 SHALL 复用 `@openrouter-free-models/shared` 中的 `OpenRouterModel` 类型。

#### Scenario: Import shared type
- **WHEN** 在 package 中使用 `OpenRouterModel` 类型
- **THEN** 系统 SHALL 从 `@openrouter-free-models/shared` 导入该类型
- **AND** 不应重复定义相同的类型

#### Scenario: Type compatibility
- **WHEN** package 返回模型数据
- **THEN** 返回值类型 SHALL 兼容 `OpenRouterModel`
- **AND** 所有字段类型 SHALL 匹配

### Requirement: Filter options types

系统 SHALL 定义完整的筛选选项类型。

#### Scenario: FilterOptions interface
- **WHEN** 使用 filter 方法
- **THEN** 系统 SHALL 提供 `FilterOptions` 接口
- **AND** 接口 SHALL 包含以下可选字段：
  - `providers?: string[]`
  - `modality?: string`
  - `minContextLength?: number`
  - `maxContextLength?: number`
  - `keyword?: string`
  - `matchStrategy?: 'exact' | 'includes' | 'startsWith' | 'regex'`
  - `verifyAvailability?: boolean` - 是否验证模型可用性
  - `fallbackProvider?: string` - 如果结果为空，使用此 provider 重新筛选

#### Scenario: Type inference for FilterOptions
- **WHEN** 传入筛选选项对象
- **THEN** 系统 SHALL 提供完整的类型检查
- **AND** 无效值 SHALL 在编译时报错

### Requirement: Cache configuration types

系统 SHALL 定义缓存配置类型。

#### Scenario: CacheOptions interface
- **WHEN** 配置缓存选项
- **THEN** 系统 SHALL 提供 `CacheOptions` 接口
- **AND** 接口 SHALL 包含以下字段：
  - `enabled: boolean`
  - `ttl: number` (毫秒)
  - `maxSize: number` (最大缓存条目数)

#### Scenario: CacheStats type
- **WHEN** 获取缓存统计
- **THEN** 系统 SHALL 返回 `CacheStats` 类型
- **AND** 类型 SHALL 包含：
  - `size: number`
  - `lastUpdate: Date`
  - `hits: number`
  - `misses: number`

### Requirement: Client options types

系统 SHALL 定义客户端配置类型。

#### Scenario: ClientOptions interface
- **WHEN** 初始化 FreeRouteClient
- **THEN** 系统 SHALL 提供 `ClientOptions` 接口
- **AND** 接口 SHALL 包含以下可选字段：
  - `apiBase: string`
  - `apiKey?: string`
  - `cache?: CacheOptions`
  - `aliases?: Record<string, string>`
  - `retryAttempts?: number`
  - `timeout?: number`
  - `emptyResult?: EmptyResultOptions` - 空结果处理选项
  - `verifyAvailability?: boolean | AvailabilityCheckOptions` - 是否验证可用性
  - `throwOnEmpty?: boolean` - 快捷设置，是否在空结果时抛出错误

#### Scenario: Default options
- **WHEN** 不提供 ClientOptions
- **THEN** 系统 SHALL 使用默认值：
  - `apiBase: '/api/models'`
  - `cache: { enabled: true, ttl: 300000, maxSize: 100 }`
  - `emptyResult: { throwOnEmpty: false, logWarning: true }`
  - `verifyAvailability: false`

### Requirement: Error types

系统 SHALL 定义所有错误类型。

#### Scenario: FetchError type
- **WHEN** API 请求失败
- **THEN** 系统 SHALL 抛出 `FetchError`
- **AND** 错误 SHALL 包含 `message` 和 `originalError` 字段

#### Scenario: RateLimitError type
- **WHEN** 触发 API 限流
- **THEN** 系统 SHALL 抛出 `RateLimitError`
- **AND** 错误 SHALL 继承自 `FetchError`
- **AND** 错误 SHALL 包含 `retryAfter?: number` 字段

#### Scenario: AuthenticationError type
- **WHEN** API 认证失败
- **THEN** 系统 SHALL 抛出 `AuthenticationError`
- **AND** 错误 SHALL 继承自 `FetchError`

#### Scenario: ValidationError type
- **WHEN** 参数验证失败
- **THEN** 系统 SHALL 抛出 `ValidationError`
- **AND** 错误 SHALL 包含 `field` 和 `message` 字段

#### Scenario: FreeRouteClientError type
- **WHEN** 客户端发生错误
- **THEN** 系统 SHALL 抛出 `FreeRouteClientError`
- **AND** 该错误 SHALL 作为所有客户端错误的基类

#### Scenario: NoModelsFoundError type
- **WHEN** 筛选结果为空且配置了抛出错误
- **THEN** 系统 SHALL 抛出 `NoModelsFoundError`
- **AND** 错误 SHALL 继承自 `FreeRouteClientError`
- **AND** 错误 SHALL 包含以下额外字段：
  - `filters: FilterOptions` - 使用的筛选条件
  - `totalModels: number` - 总模型数
  - `suggestions: string[]` - 解决建议数组
  - `fallbackAvailable: boolean` - 是否有可用的 fallback

#### Scenario: ModelAvailabilityError type
- **WHEN** 模型可用性验证失败
- **THEN** 系统 SHALL 抛出 `ModelAvailabilityError`
- **AND** 错误 SHALL 继承自 `FreeRouteClientError`
- **AND** 错误 SHALL 包含：
  - `modelId: string` - 有问题的模型ID
  - `reason: string` - 失败原因
  - `suggestion: string` - 解决建议

### Requirement: Match strategy types

系统 SHALL 定义匹配策略类型。

#### Scenario: MatchStrategy union type
- **WHEN** 指定匹配策略
- **THEN** 系统 SHALL 提供 `MatchStrategy` 类型
- **AND** 类型 SHALL 为 `'exact' | 'includes' | 'startsWith' | 'regex'`

#### Scenario: Strategy type inference
- **WHEN** 使用 matchStrategy 字段
- **THEN** 系统 SHALL 提供字符串字面量类型的自动补全
- **AND** 无效值 SHALL 在编译时报错

### Requirement: Alias mapping types

系统 SHALL 定义别名映射类型。

#### Scenario: AliasMap type
- **WHEN** 配置提供商别名
- **THEN** 系统 SHALL 提供 `AliasMap` 类型
- **AND** 类型 SHALL 为 `Record<string, string>`

#### Scenario: Built-in aliases
- **WHEN** 不提供自定义别名
- **THEN** 系统 SHALL 使用内置别名映射
- **AND** 内置映射 SHALL 包含：
  - `{ gemini: 'google', claude: 'anthropic', llama: 'meta', bard: 'google' }`

### Requirement: Utility return types

系统 SHALL 为工具方法定义返回类型。

#### Scenario: ModelList type
- **WHEN** 调用 `getAllModels()` 或 `filter()`
- **THEN** 返回值类型 SHALL 为 `Promise<OpenRouterModel[]>`

#### Scenario: NullableModel type
- **WHEN** 调用 `getModelById()`
- **THEN** 返回值类型 SHALL 为 `Promise<OpenRouterModel | null>`

#### Scenario: StringArray type
- **WHEN** 调用 `getProviders()` 或 `getModalities()`
- **THEN** 返回值类型 SHALL 为 `Promise<string[]>`

### Requirement: Chained API types

系统 SHALL 定义链式 API 的类型。

#### Scenario: FilterChain type
- **WHEN** 使用链式 API
- **THEN** 每个 chain 方法 SHALL 返回 `FilterChain` 类型
- **AND** `FilterChain` SHALL 包含所有链式方法

#### Scenario: Exec method type
- **WHEN** 在链式调用中调用 `exec()`
- **THEN** `exec()` 方法 SHALL 返回 `Promise<OpenRouterModel[]>`

### Requirement: Environment types

系统 SHALL 定义环境相关的类型。

#### Scenario: Environment type
- **WHEN** 检测运行环境
- **THEN** 系统 SHALL 提供 `Environment` 类型
- **AND** 类型 SHALL 为 `'browser' | 'node' | 'workers'`

#### Scenario: Environment detection
- **WHEN** 调用 `getEnvironment()` 工具函数
- **THEN** 返回值类型 SHALL 为 `Environment`

### Requirement: Empty result handling types

系统 SHALL 定义空结果处理相关的类型。

#### Scenario: NoModelsFoundError type
- **WHEN** 筛选结果为空且配置了 `throwOnEmpty: true`
- **THEN** 系统 SHALL 抛出 `NoModelsFoundError`
- **AND** 错误 SHALL 包含以下字段：
  - `message: string` - 错误描述
  - `filters: FilterOptions` - 使用的筛选条件
  - `totalModels: number` - 总模型数
  - `suggestions: string[]` - 解决建议数组

#### Scenario: EmptyResultOptions type
- **WHEN** 配置空结果处理选项
- **THEN** 系统 SHALL 提供 `EmptyResultOptions` 接口
- **AND** 接口 SHALL 包含：
  - `throwOnEmpty?: boolean` - 是否抛出错误
  - `fallbackProvider?: string` - 备用提供商
  - `logWarning?: boolean` - 是否记录警告

### Requirement: Model availability types

系统 SHALL 定义模型可用性验证相关的类型。

#### Scenario: ModelAvailabilityResult type
- **WHEN** 验证模型可用性
- **THEN** 系统 SHALL 返回 `ModelAvailabilityResult` 类型
- **AND** 类型 SHALL 包含：
  - `available: boolean` - 是否可用
  - `modelId: string` - 模型ID
  - `reason?: 'privacy_settings_required' | 'model_deprecated' | 'rate_limited' | 'unknown'` - 不可用原因
  - `suggestion?: string` - 解决建议
  - `lastChecked: Date` - 验证时间

#### Scenario: AvailabilityCheckOptions type
- **WHEN** 配置可用性检查选项
- **THEN** 系统 SHALL 提供 `AvailabilityCheckOptions` 接口
- **AND** 接口 SHALL 包含：
  - `timeout?: number` - 超时时间（毫秒）
  - `retryOnError?: boolean` - 失败时是否重试
  - `cacheResults?: boolean` - 是否缓存验证结果

### Requirement: Privacy settings types

系统 SHALL 定义隐私设置相关的类型。

#### Scenario: PrivacyRequirement type
- **WHEN** 检查模型是否需要隐私设置
- **THEN** 系统 SHALL 提供 `PrivacyRequirement` 类型
- **AND** 类型 SHALL 为：
  ```typescript
  type PrivacyRequirement = {
    modelId: string
    requiresPrivacySettings: boolean
    settingsUrl?: string
    description?: string
  }
  ```

#### Scenario: AlternativeModels type
- **WHEN** 获取替代模型
- **THEN** 系统 SHALL 返回 `AlternativeModels` 类型
- **AND** 类型 SHALL 包含：
  - `originalId: string` - 原模型ID
  - `alternatives: OpenRouterModel[]` - 替代模型列表
  - `reason: string` - 推荐原因
