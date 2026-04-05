# Spec: Social Meta Tags

社交媒体元数据支持能力定义，使项目链接在 Twitter、Facebook、LinkedIn 等平台分享时显示精美的预览卡片。

## ADDED Requirements

### Requirement: Open Graph meta tags support

系统 SHALL 在前端应用中支持 Open Graph (OG) meta tags，用于 Facebook、LinkedIn 等平台的链接预览。

#### Scenario: Default OG tags present on all pages
- **WHEN** 用户访问任何应用页面
- **THEN** 系统 SHALL 在 HTML `<head>` 中包含以下 OG meta tags：
  - `og:title` - 页面标题
  - `og:description` - 页面描述
  - `og:image` - 分享缩略图 URL
  - `og:url` - 规范的页面 URL
  - `og:type` - 页面类型（默认为 "website"）
  - `og:site_name` - 网站名称

#### Scenario: OG tags use configured defaults
- **WHEN** 页面没有自定义 OG meta tags
- **THEN** 系统 SHALL 使用全局默认配置：
  - `og:title` 默认为 "OpenRouter Free Models Monitor"
  - `og:description` 默认为项目描述
  - `og:image` 默认为 `/images/og-default.png`
  - `og:site_name` 默认为 "OpenRouter Free Models"

#### Scenario: OG tags are discoverable by crawlers
- **WHEN** 社交媒体爬虫访问页面
- **THEN** 所有 OG meta tags SHALL 直接在 HTML 源码中可访问（非 JavaScript 动态生成）
- **AND** 系统 SHOULD 避免阻塞页面渲染

### Requirement: Twitter Card meta tags support

系统 SHALL 支持 Twitter Card meta tags，用于 Twitter/X 平台的链接预览。

#### Scenario: Twitter summary card present
- **WHEN** 页面加载
- **THEN** 系统 SHALL 包含以下 Twitter Card meta tags：
  - `twitter:card` - 卡片类型（默认为 "summary_large_image"）
  - `twitter:title` - 页面标题
  - `twitter:description` - 页面描述
  - `twitter:image` - 分享缩略图 URL
  - `twitter:site` - 网站 Twitter 账号（可选）
  - `twitter:creator` - 作者 Twitter 账号（可选）

#### Scenario: Twitter card fallbacks to OG tags
- **WHEN** Twitter 特定标签未设置
- **THEN** 系统 SHALL 使用 OG meta tags 作为回退值：
  - `twitter:title` 回退到 `og:title`
  - `twitter:description` 回退到 `og:description`
  - `twitter:image` 回退到 `og:image`

### Requirement: Default share image

系统 SHALL 提供默认的社交媒体分享图片。

#### Scenario: Default image exists in public directory
- **WHEN** 应用启动或构建时
- **THEN** `/public/images/og-default.png` 文件 SHALL 存在
- **AND** 图片尺寸 SHALL 至少为 1200x630 像素（Facebook 推荐）
- **AND** 图片纵横比 SHALL 接近 1.91:1
- **AND** 图片文件大小 SHALL 小于 8MB

#### Scenario: Default image is visually appealing
- **WHEN** 显示在社交媒体预览中
- **THEN** 默认图片 SHALL 清晰展示项目品牌
- **AND** 包含项目名称或 Logo
- **AND** 使用项目主题色（与 UI 一致）

### Requirement: Page-level customization

系统 SHALL 支持在页面级别自定义社交媒体 meta tags。

#### Scenario: Models page has custom OG tags
- **WHEN** 用户访问 `/models` 页面
- **THEN** `og:title` SHALL 为 "Free AI Models - OpenRouter Monitor"
- **AND** `og:description` SHALL 描述当前免费模型数量和主要提供商
- **AND** `og:image` 可以显示模型统计相关的图形

#### Scenario: Model detail page has dynamic meta tags
- **WHEN** 用户访问特定模型详情页（如 `/models/google/gemini-pro`）
- **THEN** `og:title` SHALL 包含模型名称（如 "Google Gemini Pro - Free AI Model"）
- **AND** `og:description` SHALL 包含模型的关键信息（上下文长度、模态等）
- **AND** `og:image` 可以使用模型相关的视觉元素

#### Scenario: About page has custom meta tags
- **WHEN** 用户访问 `/about` 页面
- **THEN** `og:title` SHALL 为 "About - OpenRouter Free Models Monitor"
- **AND** `og:description` SHALL 描述项目目的和功能

### Requirement: Dynamic meta tag updates

系统 SHALL 支持在路由变化时动态更新 meta tags（适用于 SPA）。

#### Scenario: Meta tags update on route change
- **WHEN** 用户在单页应用中导航到不同路由
- **THEN** 系统 SHALL 更新 `<head>` 中的 meta tags 以匹配当前页面
- **AND** 更新 SHALL 在导航完成后立即执行
- **AND** 系统 SHALL 维护正确的浏览器历史记录

#### Scenario: Meta tags preserve SEO
- **WHEN** 动态更新 meta tags
- **THEN** 更新后的 meta tags SHALL 对搜索引擎爬虫可见
- **AND** 系统 SHOULD 使用允许 SEO 的实现方式（避免客户端渲染导致的内容不可见）

### Requirement: Social share image optimization

系统 SHALL 确保分享图片符合各平台要求。

#### Scenario: Image dimensions match platform requirements
- **WHEN** 配置分享图片
- **THEN** 图片尺寸 SHOULD 满足以下推荐：
  - Facebook: 1200x630px (推荐)
  - Twitter: 1200x675px (2:1 比例)
  - LinkedIn: 1200x627px
- **AND** 系统 SHOULD 使用通用尺寸（如 1200x630）以兼容所有平台

#### Scenario: Image format and quality
- **WHEN** 存储分享图片
- **THEN** 图片格式 SHALL 为 PNG 或 JPG
- **AND** 图片质量 SHALL 在视觉质量和文件大小之间平衡
- **AND** 系统 SHOULD 提供优化后的图片（压缩但保持清晰度）

### Requirement: Verification and testing

系统 SHALL 提供验证 meta tags 配置的工具。

#### Scenario: Developer can verify meta tags
- **WHEN** 开发者需要检查 meta tags 是否正确
- **THEN** 系统 SHALL 提供以下验证方式：
  - 使用社交媒体平台的分享预览工具（如 Facebook Sharing Debugger, Twitter Card Validator）
  - 在开发环境显示 meta tags 调试信息
  - 提供命令行工具或脚本批量验证多个页面

#### Scenario: Meta tags are valid
- **WHEN** 使用社交媒体调试工具验证
- **THEN** 所有必需的 meta tags SHALL 被正确识别
- **AND** 图片 URL SHALL 可访问（非 404 或 403）
- **AND** 图片 SHALL 满足平台的尺寸和格式要求
