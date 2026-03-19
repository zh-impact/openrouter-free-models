# Spec: Free Route Filter

模型筛选能力定义了如何根据多种条件组合筛选 OpenRouter 免费模型，包括提供商、模态、上下文长度和关键词匹配。

## ADDED Requirements

### Requirement: Filter by providers

系统 SHALL 支持按一个或多个提供商筛选模型。

#### Scenario: Filter by single provider
- **WHEN** 调用 filter 并指定 `providers: ['google']`
- **THEN** 系统 SHALL 只返回 `id` 或 `name` 包含 "google" 的模型
- **AND** 返回结果 SHALL 为数组

#### Scenario: Filter by multiple providers
- **WHEN** 调用 filter 并指定 `providers: ['google', 'anthropic']`
- **THEN** 系统 SHALL 返回匹配任一提供商的模型
- **AND** 匹配逻辑 SHALL 为 OR（满足任一条件即可）

#### Scenario: No provider filter
- **WHEN** 调用 filter 且不指定 `providers`
- **THEN** 系统 SHALL 不过滤提供商
- **AND** 返回所有模型

### Requirement: Filter by modality

系统 SHALL 支持按模态类型筛选模型。

#### Scenario: Filter by text modality
- **WHEN** 调用 filter 并指定 `modality: 'text'`
- **THEN** 系统 SHALL 只返回 `architecture.modality === 'text'` 的模型

#### Scenario: Filter by multimodal
- **WHEN** 调用 filter 并指定 `modality: 'text+image'`
- **THEN** 系统 SHALL 只返回支持文本和图像的模型

#### Scenario: No modality filter
- **WHEN** 调用 filter 且不指定 `modality`
- **THEN** 系统 SHALL 不过滤模态
- **AND** 返回所有模态的模型

### Requirement: Filter by context length

系统 SHALL 支持按上下文长度筛选模型。

#### Scenario: Filter by minimum context length
- **WHEN** 调用 filter 并指定 `minContextLength: 128000`
- **THEN** 系统 SHALL 只返回 `context_length >= 128000` 的模型

#### Scenario: Filter by maximum context length
- **WHEN** 调用 filter 并指定 `maxContextLength: 128000`
- **THEN** 系统 SHALL 只返回 `context_length <= 128000` 的模型

#### Scenario: Filter by context length range
- **WHEN** 调用 filter 并同时指定 `minContextLength` 和 `maxContextLength`
- **THEN** 系统 SHALL 返回在指定范围内的模型

### Requirement: Filter by keyword

系统 SHALL 支持按关键词模糊匹配模型。

#### Scenario: Keyword match in model name
- **WHEN** 调用 filter 并指定 `keyword: 'gemini'`
- **THEN** 系统 SHALL 返回 name 或 id 包含 "gemini" 的模型
- **AND** 匹配 SHALL 不区分大小写

#### Scenario: Keyword match with alias
- **WHEN** 调用 filter 并指定 `keyword: 'gemini'`
- **AND** 系统配置了别名映射（gemini → google）
- **THEN** 系统 SHALL 同时搜索 "gemini" 和 "google"
- **AND** 返回匹配任一关键词的模型

#### Scenario: No keyword filter
- **WHEN** 调用 filter 且不指定 `keyword`
- **THEN** 系统 SHALL 不执行关键词匹配

### Requirement: Combine multiple filters

系统 SHALL 支持组合多个筛选条件，所有条件必须同时满足（AND 逻辑）。

#### Scenario: Provider + modality filter
- **WHEN** 调用 filter 并指定 `providers: ['google']` 和 `modality: 'text'`
- **THEN** 系统 SHALL 返回既是 Google 提供商又是文本模态的模型

#### Scenario: All filters combined
- **WHEN** 调用 filter 并指定 providers, modality, minContextLength, keyword
- **THEN** 系统 SHALL 返回同时满足所有条件的模型
- **AND** 如果没有模型满足所有条件，SHALL 返回空数组

### Requirement: Chained filter API

系统 SHALL 支持链式调用方式进行筛选。

#### Scenario: Chain provider and modality filters
- **WHEN** 调用 `client.filterByProviders(['google']).filterByModality('text').exec()`
- **THEN** 系统 SHALL 返回满足所有链式条件的模型
- **AND** 中间结果 SHALL 被正确传递

#### Scenario: Chain with empty result
- **WHEN** 链式筛选导致中间结果为空
- **THEN** 系统 SHALL 短路后续筛选
- **AND** 直接返回空数组

### Requirement: Match strategies

系统 SHALL 支持不同的关键词匹配策略。

#### Scenario: Exact match strategy
- **WHEN** 调用 filter 并指定 `keyword: 'gpt-4'` 和 `matchStrategy: 'exact'`
- **THEN** 系统 SHALL 只返回名称完全等于 "gpt-4" 的模型

#### Scenario: Includes match strategy (default)
- **WHEN** 调用 filter 并指定 `keyword: 'gpt'` 和 `matchStrategy: 'includes'`
- **THEN** 系统 SHALL 返回名称包含 "gpt" 的模型

#### Scenario: Starts with match strategy
- **WHEN** 调用 filter 并指定 `keyword: 'open'` 和 `matchStrategy: 'startsWith'`
- **THEN** 系统 SHALL 只返回名称以 "open" 开头的模型

#### Scenario: Regex match strategy
- **WHEN** 调用 filter 并指定 `keyword: '/^google-.*-pro$/'` 和 `matchStrategy: 'regex'`
- **THEN** 系统 SHALL 将 keyword 作为正则表达式匹配
- **AND** 返回匹配正则的模型

### Requirement: Provider alias mapping

系统 SHALL 支持提供商别名映射。

#### Scenario: Built-in alias mappings
- **WHEN** 使用关键词 "gemini" 进行筛选
- **THEN** 系统 SHALL 自动同时搜索 "google" 提供商的模型
- **AND** 预定义别名 SHALL 包括：{ gemini: google, claude: anthropic, llama: meta }

#### Scenario: Custom alias mappings
- **WHEN** 初始化 client 时提供 `aliases: { bard: 'google' }`
- **THEN** 系统 SHALL 使用自定义别名进行关键词匹配
- **AND** 自定义别名 SHALL 与内置别名合并
