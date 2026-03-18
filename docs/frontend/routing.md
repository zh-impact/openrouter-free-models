# 前端路由说明

OpenRouter Free Models Monitor 使用 React Router v7 管理应用路由。

## 📍 路由配置

### 公开路由

| 路径 | 组件 | 描述 |
|------|------|------|
| `/` | ModelsPage | 首页，显示所有免费模型（与 /models 相同） |
| `/models` | ModelsPage | 模型列表页 |
| `/changes` | ChangesPage | 变更历史页 |
| `/subscribe` | SubscribePage | 订阅页（Telegram 订阅） |
| `/about` | AboutPage | 关于页面 |
| `/privacy` | PrivacyPolicyPage | 隐私政策页面 |

## 🔧 技术实现

### 依赖

- `react-router-dom` v7.13.1
- 使用 `BrowserRouter` 和 `browser history` 模式

### 导航组件

**Header 组件**使用 `NavLink` 实现路由跳转和活动状态高亮：

```tsx
<NavLink to="/models" className={navClass}>
  Models
</NavLink>
```

活动状态自动应用样式：
- 激活：`bg-primary-600 text-white`
- 非激活：`text-gray-700 hover:bg-gray-100`

**Footer 组件**也使用 `NavLink` 实现导航链接：

```tsx
<NavLink
  to="/about"
  className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
>
  About
</NavLink>
```

Footer 链接样式：
- 悬停效果：`hover:text-gray-900 dark:hover:text-gray-200`
- 响应式布局：移动端垂直堆叠，桌面端水平排列
- 活动状态：自动应用 React Router 的 active class

### 路由配置

**main.tsx** - BrowserRouter 配置：
```tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

**App.tsx** - Routes 定义：
```tsx
<Routes>
  <Route path="/" element={<ModelsPage />} />
  <Route path="/models" element={<ModelsPage />} />
  <Route path="/changes" element={<ChangesPage />} />
  <Route path="/subscribe" element={<SubscribePage />} />
  <Route path="/about" element={<AboutPage />} />
  <Route path="/privacy" element={<PrivacyPolicyPage />} />
</Routes>
```

## 🚀 使用方式

### 开发环境

```bash
pnpm --filter frontend dev
```

访问 http://localhost:5173 测试路由功能

### 生产构建

```bash
pnpm --filter frontend build
pnpm --filter frontend deploy
```

## 📝 添加新路由

### 1. 创建页面组件

```tsx
// src/pages/NewPage.tsx
export function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### 2. 在 App.tsx 中添加路由

```tsx
import { NewPage } from './pages/NewPage';

// In Routes:
<Route path="/new" element={<NewPage />} />
```

### 3. 在 Header.tsx 中添加导航链接

```tsx
<NavLink to="/new" className={navClass}>
  New Page
</NavLink>
```

## 🎨 路由样式

### NavLink 活动状态

Header 组件中的 `navClass` 函数根据 `isActive` 自动应用样式：

```tsx
const navClass = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-lg font-medium transition-colors ${
    isActive
      ? 'bg-primary-600 text-white'        // 活动状态
      : 'text-gray-700 hover:bg-gray-100'     // 非活动状态
  }`;
```

## ⚠️ 注意事项

1. **默认路由** - `/` 和 `/models` 都指向 `ModelsPage`，保持向后兼容
2. **相对路径** - 使用 `<NavLink to="/path">` 而不是 `to="path"`
3. **样式保持** - 路由切换不影响暗色模式等其他状态
4. **类型安全** - 所有路由都有 TypeScript 类型检查
