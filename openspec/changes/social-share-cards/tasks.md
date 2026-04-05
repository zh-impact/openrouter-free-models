# Tasks: Social Share Cards

## 1. 准备工作

- [x] 1.1 创建默认分享图片目录 `apps/frontend/public/images/`
- [ ] 1.2 设计默认 OG 图片
  - 尺寸：1200x630px (1.91:1 比例)
  - 使用项目主题色（accent color #ff6b35）
  - 包含项目名称 "OpenRouter Free Models Monitor"
  - 添加简短描述或副标题
- [ ] 1.3 导出优化后的 PNG 图片
  - 文件大小 < 500KB
  - 格式：PNG
  - 质量：85%（平衡质量和文件大小）
- [ ] 1.4 使用图片优化工具（如 TinyPNG）进一步压缩
- [ ] 1.5 将图片保存为 `apps/frontend/public/images/og-default.png`
- [ ] 1.6 验证图片尺寸和文件大小符合要求

## 2. 静态 Meta Tags

- [x] 2.1 编辑 `apps/frontend/index.html`
- [x] 2.2 在 `<head>` 中添加 Open Graph meta tags
  - `og:title` = "OpenRouter Free Models Monitor"
  - `og:description` = "实时监控 OpenRouter 免费 AI 模型，提供完整的历史变更追踪"
  - `og:image` = "/images/og-default.png"
  - `og:url` = "https://openrouter-free-models.pages.dev"
  - `og:type` = "website"
  - `og:site_name` = "OpenRouter Free Models"
- [x] 2.3 添加 Twitter Card meta tags
  - `twitter:card` = "summary_large_image"
  - `twitter:title` = "OpenRouter Free Models Monitor"
  - `twitter:description` = "实时监控 OpenRouter 免费 AI 模型，提供完整的历史变更追踪"
  - `twitter:image` = "/images/og-default.png"
- [x] 2.4 确保 meta tags 在 `<head>` 中位置合适（title 之后）
- [ ] 2.5 验证 HTML 语法正确
- [ ] 2.6 本地运行 `pnpm --filter frontend dev` 检查 meta tags 是否加载

## 3. 配置文件

- [x] 3.1 创建配置目录 `apps/frontend/src/config/`
- [x] 3.2 创建 `apps/frontend/src/config/social-meta.ts`
- [x] 3.3 定义 `DEFAULT_META` 配置对象
  - `title`: string
  - `description`: string
  - `image`: string
  - `url`: string
  - `siteName`: string
  - `type`: string
- [x] 3.4 定义 `PAGE_META` 类型为 `Record<string, Partial<typeof DEFAULT_META>>`
- [x] 3.5 为主要路由添加配置
  - `/` 页面使用默认配置
  - `/models` 页面自定义配置
  - `/about` 页面自定义配置
  - `/privacy-policy` 页面自定义配置
- [x] 3.6 导出配置对象供其他模块使用
- [x] 3.7 添加 TypeScript 类型导出（可选）

## 4. 动态更新组件

- [x] 4.1 创建工具函数目录 `apps/frontend/src/utils/`（如果不存在）
- [x] 4.2 创建 `apps/frontend/src/utils/metaTags.ts`
- [x] 4.3 实现 `updateMetaTag(property: string, content: string)` 函数
  - 查找现有的 meta tag（通过 property 或 name）
  - 如果存在，更新其 content 属性
  - 如果不存在，创建新的 meta tag 元素
  - 添加到 `<head>` 中
- [x] 4.4 创建 `apps/frontend/src/components/MetaUpdater.tsx`
- [x] 4.5 定义 `MetaProps` 接口
  - `title?: string`
  - `description?: string`
  - `image?: string`
- [x] 4.6 实现 `MetaUpdater` 组件
  - 使用 `useEffect` 监听 props 变化
  - 调用 `updateMetaTag` 更新 document.title
  - 更新所有相关 meta tags（og:title, og:description, og:image, og:url）
  - 更新 Twitter tags（twitter:title, twitter:description, twitter:image）
  - 依赖：props 变化时触发
- [x] 4.7 确保组件返回 null（不渲染任何内容）
- [x] 4.8 添加 TypeScript 类型定义和导出

## 5. 路由集成

- [x] 5.1 在 `apps/frontend/src/App.tsx` 中导入 `MetaUpdater` 组件
- [x] 5.2 导入 `PAGE_META` 配置
- [x] 5.3 为 `<Route path="/models">` 添加 `handle` 函数
  - 返回 `element: <MetaUpdater {...PAGE_META['/models']} />`
  - 使用动态 model 数据（可选，如模型数量）
- [x] 5.4 为 `<Route path="/about">` 添加 `handle` 函数
  - 返回 `element: <MetaUpdater {...PAGE_META['/about']} />`
- [x] 5.5 为 `<Route path="/privacy-policy">` 添加 `handle` 函数
  - 返回 `element: <MetaUpdater {...PAGE_META['/privacy-policy']} />`
- [x] 5.6 为根路由 `<Route path="/">` 确认使用默认 meta tags
  - 可选：添加 handle 函数或保持静态默认
- [x] 5.7 确保 `MetaUpdater` 在所有路由中正确集成
- [ ] 5.8 测试路由切换时 meta tags 是否更新

## 6. 类型定义

- [x] 6.1 在 `apps/frontend/src/config/social-meta.ts` 中添加类型定义
- [x] 6.2 定义 `SocialMetaConfig` 接口
  - `title: string`
  - `description: string`
  - `image: string`
  - `url?: string`
  - `siteName?: string`
  - `type?: string`
- [x] 6.3 确保 `PAGE_META` 使用 `SocialMetaConfig` 类型
- [x] 6.4 添加 JSDoc 注释到配置导出（可选）

## 7. 验证和测试

- [ ] 7.1 启动开发服务器 `pnpm --filter frontend dev`
- [ ] 7.2 在浏览器 DevTools 中检查 `<head>` 中的 meta tags
- [ ] 7.3 导航到不同页面（/、/models、/about）
- [ ] 7.4 验证每个页面的 meta tags 是否正确更新
- [ ] 7.5 使用 Facebook Sharing Debugger 验证 OG tags
  - 打开 https://developers.facebook.com/tools/debug/
  - 输入项目 URL
  - 检查 Scrape Again 结果
  - 验证所有 OG tags 被正确识别
- [ ] 7.6 使用 Twitter Card Validator 验证 Twitter cards
  - 打开 https://cards-dev.twitter.com/validator
  - 输入项目 URL
  - 验证 Card 类型和图片加载
- [ ] 7.7 在不同社交媒体平台测试分享效果
  - Twitter/X
  - Facebook
  - LinkedIn
- [ ] 7.8 检查图片是否在所有平台正确显示
- [ ] 7.9 记录验证结果（截图或文档）

## 8. 文档和清理

- [ ] 8.1 更新项目 README.md（如需要）
  - 添加社交媒体分享功能说明
  - 更新项目截图（显示分享卡片效果）
- [ ] 8.2 在 CHANGELOG.md 中记录新功能
- [ ] 8.3 清理临时文件或未使用的资源
- [ ] 8.4 提交代码到版本控制

## 9. 构建和部署验证

- [ ] 9.1 构建前端应用 `pnpm --filter frontend build`
- [ ] 9.2 验证构建产物包含 meta tags
- [ ] 9.3 预览生产构建版本
- [ ] 9.4 部署到 Cloudflare Pages（或使用预览环境）
- [ ] 9.5 在生产环境验证 meta tags
- [ ] 9.6 使用社交媒体调试工具验证生产环境

## 10. 浏览器兼容性测试

- [ ] 10.1 在 Chrome 中测试 meta tags 显示
- [ ] 10.2 在 Firefox 中测试 meta tags 显示
- [ ] 10.3 在 Safari 中测试 meta tags 显示
- [ ] 10.4 在 Edge 中测试 meta tags 显示
- [ ] 10.5 验证所有浏览器的开发工具能正确显示 meta tags

## 11. 性能验证

- [ ] 11.1 使用 Lighthouse 测试页面性能
- [ ] 11.2 验证添加 meta tags 后性能分数没有显著下降
- [ ] 11.3 检查 First Contentful Paint (FCP) 时间
- [ ] 11.4 检查 Largest Contentful Paint (LCP) 时间
- [ ] 11.5 确保 meta tags 不阻塞关键渲染路径
- [ ] 11.6 优化图片加载（如有需要）
