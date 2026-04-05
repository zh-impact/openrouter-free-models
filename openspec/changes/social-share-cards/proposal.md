# Proposal: Social Share Cards

## Why

当用户在社交媒体（Twitter/X、Facebook、LinkedIn 等）上分享 openrouter-free-models 项目的链接时，当前没有富媒体预览卡片。这导致分享的内容仅显示为纯文本链接，缺乏视觉吸引力，降低了点击率和项目的曝光度。

通过添加 Open Graph 和 Twitter Card meta tags，可以显著提升社交媒体分享效果，使链接分享时显示带有标题、描述、缩略图和作者信息的精美卡片。

**为什么现在做**：项目已经建立了稳定的基础设施（前端展示、后端 API、文档），现在是时候优化社交媒体表现以扩大影响力。

## What Changes

- **新增**：社交分享 meta tags 支持
  - Open Graph (OG) meta tags（Facebook、LinkedIn 通用）
  - Twitter Card meta tags（Twitter/X 专用）
  - 动态或静态配置的缩略图
  - 可配置的标题、描述、作者信息

- **新增**：社交分享配置接口
  - 支持全局默认配置
  - 支持页面级自定义配置
  - 支持动态生成（基于路由或内容）

- **修改**：前端应用（`apps/frontend`）
  - 在 `index.html` 或根组件中添加 meta tags
  - 支持路由级别的 meta tags 更新（React Router v7）
  - 添加可选的默认分享图片

## Capabilities

### New Capabilities

- **`social-meta-tags`**: 为项目添加社交媒体分享元数据支持
  - Open Graph (OG) tags 配置
  - Twitter Card tags 配置
  - 默认分享图片
  - 页面级自定义支持

### Modified Capabilities

无。这是新功能，不修改现有能力。

## Impact

**受影响的组件**：
- `apps/frontend/src/index.html` - 添加静态 meta tags
- `apps/frontend/src/App.tsx` 或路由组件 - 动态 meta tags 更新
- `apps/frontend/public/` - 存放默认分享图片

**新增依赖**：
- 可能需要 React Helmet 或类似的 meta tags 管理库（如果选择动态方案）
- 或者使用 React Router v7 的内置 meta tags 支持

**不破坏的功能**：
- 所有现有功能保持不变
- 这是一个纯添加性的功能，不影响现有 API 或组件

**性能影响**：
- 最小：仅添加几个 meta tags，对性能影响可忽略
- 如果使用动态方案，需要确保 SEO 和加载性能
