# Design: Social Share Cards

## Context

### Background

OpenRouter Free Models Monitor 项目已经建立了完整的监控和展示系统，包括前端（React + Vite）、后端（Cloudflare Workers）和数据库（D1）。当用户在社交媒体分享项目链接时，目前仅显示纯文本 URL，缺乏视觉吸引力。

### Current State

- 前端使用 React + Vite + React Router v7
- 已有 TailwindCSS 用于样式
- 多个页面路由：`/`、`/models`、`/about`、`/privacy-policy`
- 所有页面目前使用相同的 HTML `<head>` 配置

### Constraints

- **性能优化**: 不应显著影响页面加载速度
- **SEO 友好**: meta tags 必须对爬虫可见（避免纯客户端渲染）
- **兼容性**: 支持 Twitter/X、Facebook、LinkedIn 等主流平台
- **维护性**: 配置应易于更新和管理

## Goals / Non-Goals

**Goals:**
- 提供开箱即用的社交媒体分享卡片支持
- 支持页面级自定义 meta tags
- 确保所有页面的 meta tags 符合各平台要求
- 提供开发和验证工具

**Non-Goals:**
- 不实现社交媒体分享按钮（仅关注 link preview）
- 不实现动态图片生成（使用静态图片）
- 不支持用户上传自定义分享图片
- 不实现 A/B 测试或多变量优化

## Decisions

### 1. Meta Tags 实现方式：静态 + 动态混合

**Decision**: 采用静态默认 meta tags + 动态页面级更新

**Rationale:**
- **静态默认**: 在 `index.html` 中添加基础 meta tags，确保所有页面都有默认分享卡片
- **动态更新**: 使用 React Router v7 的 ` Routes` 和 `Route` 组件的 `handle` 函数动态更新特定页面的 meta tags
- **SSR 友好**: 静态 meta tags 确保爬虫可见，动态更新增强 SPA 体验

**Implementation:**
```typescript
// 在 index.html 中添加静态 meta tags
<head>
  <meta property="og:title" content="OpenRouter Free Models Monitor">
  <meta property="og:description" content="实时监控 OpenRouter 免费 AI 模型，提供完整的历史变更追踪">
  <meta property="og:image" content="/images/og-default.png">
  <meta property="og:url" content="https://openrouter-free-models.pages.dev">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="OpenRouter Free Models">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="OpenRouter Free Models Monitor">
  <meta name="twitter:description" content="实时监控 OpenRouter 免费 AI 模型，提供完整的历史变更追踪">
  <meta name="twitter:image" content="/images/og-default.png">
</head>
```

**Alternatives Considered:**
- ❌ **纯客户端方案** (仅在 React 中更新): 缺点是不利于 SEO，爬虫可能看不到动态生成的 meta tags
- ❌ **使用 React Helmet**: 增加依赖，React Router v7 已内置支持，不需要额外库
- ❌ **服务端渲染**: 复杂度高，当前项目使用静态部署（Cloudflare Pages）

### 2. 动态 Meta Tags 更新：React Router v7 内置功能

**Decision**: 使用 React Router v7 的 `Route.handle` 函数更新 meta tags

**Rationale:**
- 无需额外依赖
- 原生支持，轻量级
- 与现有路由系统无缝集成

**Implementation:**
```typescript
// routes.tsx 或 App.tsx
import { Route } from "react-router";

function MetaUpdater({ title, description, image }: MetaProps) {
  useEffect(() => {
    document.title = title;

    // Update OG tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', window.location.href);

    // Update Twitter tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
  }, [title, description, image]);

  return null; // 不渲染任何内容
}

function updateMetaTag(property: string, content: string) {
  let element = document.querySelector(`meta[property="${property}"]`) ||
                 document.querySelector(`meta[name="${property}"]`);

  if (element) {
    element.setAttribute('content', content);
  }
}

// Route 配置
<Route path="/models" element={<ModelsPage />}
       handle={{
         loader: () => ({ title: 'Free AI Models - OpenRouter Monitor', ... }),
         element: <MetaUpdater {...metaData} />
       }}
/>
```

**Alternatives Considered:**
- ❌ **React Helmet**: 功能强大但增加依赖，对简单场景过于复杂
- ❌ **手动 useEffect**: 代码重复，难以维护

### 3. 默认分享图片设计

**Decision**: 创建一个统一风格的默认 OG 图片

**Rationale:**
- 使用项目主题色（橙色 accent color #ff6b35）
- 包含项目名称和核心价值主张
- 尺寸：1200x630px（1.91:1 比例，兼容所有平台）
- 文件格式：PNG（平衡质量和文件大小）

**Implementation:**
```bash
# 创建分享图片目录
mkdir -p apps/frontend/public/images

# 图片设计要求：
# - 背景：使用项目主题色
# - 文字：项目名称 "OpenRouter Free Models" + 简短描述
# - 元素：可加入模型图标或统计图表
# - 尺寸：1200x630px
# - 格式：PNG，优化后大小 < 500KB
```

**Alternative Images** (可选，未来扩展):
- `/images/og-models.png` - 模型列表页专用图片
- `/images/og-about.png` - 关于页专用图片

### 4. 配置管理：集中式配置对象

**Decision**: 创建 `social-meta.config.ts` 配置文件

**Rationale:**
- 集中管理所有 meta tags 配置
- 易于维护和更新
- 支持页面级覆盖

**Implementation:**
```typescript
// config/social-meta.ts
export const DEFAULT_META = {
  title: "OpenRouter Free Models Monitor",
  description: "实时监控 OpenRouter 免费 AI 模型，提供完整的历史变更追踪和通知功能",
  image: "/images/og-default.png",
  url: "https://openrouter-free-models.pages.dev",
  siteName: "OpenRouter Free Models",
  type: "website",
};

export const PAGE_META: Record<string, Partial<typeof DEFAULT_META>> = {
  '/': DEFAULT_META,

  '/models': {
    title: 'Free AI Models - OpenRouter Monitor',
    description: '浏览所有可用的免费 AI 模型，包括 Google Gemini、Anthropic Claude 等',
  },

  '/about': {
    title: 'About - OpenRouter Free Models Monitor',
    description: '了解 OpenRouter Free Models Monitor 项目的目的、架构和使用方法',
  },
};
```

### 5. 图片优化策略

**Decision**: 使用手动优化的静态图片，不使用运行时优化

**Rationale:**
- 避免增加构建复杂度
- 确保最佳的视觉质量
- 图片数量有限，手动优化可行

**Optimization Steps:**
1. 设计原图（高分辨率）
2. 导出为 PNG，压缩质量 85%
3. 使用工具（如 TinyPNG）进一步优化
4. 验证文件大小 < 500KB
5. 测试在社交媒体平台的显示效果

**Alternative Considered:**
- ❌ **运行时图片优化**: 增加服务器负载和延迟
- ❌ **多个响应式图片**: 过于复杂，收益有限

## Data Flow

```
┌─────────────────┐
│   User Visit     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  HTML Load (index.html) │
│  + Static meta tags      │
│  - og:title             │
│  - og:description        │
│  - og:image             │
│  - twitter:card          │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  React Router Navigate  │
│  (e.g., /models)        │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Route.handle Effect    │
│  - Update document.title│
│  - Update meta tags     │
│  - Update twitter tags  │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  Meta Tags Visible      │
│  (Crawlers & Previews)  │
└─────────────────────────┘
```

## Risks / Trade-offs

### Risk 1: 动态 meta tags 对 SEO 的影响
**Risk**: 纯客户端更新 meta tags 可能导致搜索引擎看不到更新后的内容

**Mitigation**:
- 在 `index.html` 中保留静态默认 meta tags，确保所有页面至少有基本预览
- 使用 `useEffect` 在客户端更新，不会阻塞初始渲染
- 考虑在构建时为关键路由生成静态 HTML（未来可使用 SSG）

### Risk 2: 图片加载失败
**Risk**: OG 图片 URL 无效或加载失败，导致分享卡片不完整

**Mitigation**:
- 在 CI/CD 中验证图片文件存在
- 提供备用的默认图片路径
- 使用相对路径避免跨域问题

### Risk 3: 平台要求变更
**Risk**: Twitter、Facebook 等平台更新 meta tags 要求，导致现有实现失效

**Mitigation**:
- 遵循官方文档的最佳实践
- 使用通用、稳定的 meta tags 属性
- 定期检查社交媒体平台的开发者文档更新
- 提供验证工具供开发者测试

### Risk 4: 多语言支持（未来需求）
**Risk**: 未来可能需要支持多语言 meta tags

**Mitigation**:
- 设计配置结构时考虑国际化
- 使用 key-value 对象存储不同语言的配置
- 预留 `og:locale` 等国际化相关字段

## Implementation Plan

### Phase 1: 准备工作
1. 创建默认分享图片（1200x630px）
2. 优化图片并放到 `apps/frontend/public/images/`
3. 验证图片尺寸和文件大小

### Phase 2: 静态 Meta Tags
1. 在 `apps/frontend/index.html` 中添加静态 meta tags
2. 配置默认的 OG 和 Twitter Card tags
3. 本地测试验证 meta tags 存在

### Phase 3: 配置文件
1. 创建 `apps/frontend/src/config/social-meta.ts`
2. 定义默认配置和页面级配置
3. 导出配置接口和类型

### Phase 4: 动态更新组件
1. 创建 `MetaUpdater` 组件
2. 实现 `updateMetaTag` 工具函数
3. 添加 TypeScript 类型定义

### Phase 5: 路由集成
1. 在 `App.tsx` 或路由配置中集成 `MetaUpdater`
2. 为主要路由配置页面级 meta tags
3. 测试路由切换时 meta tags 更新

### Phase 6: 验证和测试
1. 使用 Facebook Sharing Debugger 验证 OG tags
2. 使用 Twitter Card Validator 验证 Twitter cards
3. 在不同页面测试分享预览效果
4. 添加开发环境 meta tags 调试工具

## File Structure

```
apps/frontend/
├── public/
│   └── images/
│       └── og-default.png          # 默认分享图片
├── src/
│   ├── config/
│   │   └── social-meta.ts           # Meta tags 配置
│   ├── components/
│   │   └── MetaUpdater.tsx         # 动态更新组件
│   ├── utils/
│   │   └── metaTags.ts            # Meta tags 工具函数
│   ├── App.tsx                      # 路由集成
│   └── index.html                   # 静态 meta tags
```

## Open Questions

1. **是否需要为不同页面设计不同的分享图片？**
   - 当前设计：所有页面使用统一默认图片
   - 未来可考虑：为关键页面（/models、/about）设计专用图片

2. **是否需要添加社交媒体分享按钮？**
   - 当前设计：不实现，仅关注 link preview
   - 未来可考虑：添加 Twitter、Facebook、LinkedIn 分享按钮

3. **是否需要 A/B 测试不同的 meta tags 配置？**
   - 当前设计：不实现，使用单一配置
   - 未来可考虑：测试不同标题/描述的点击率

4. **是否需要支持用户自定义 meta tags（如用户自己的推荐链接）？**
   - 当前设计：不支持，仅限项目官方页面
   - 未来可考虑：允许生成个性化的分享卡片
