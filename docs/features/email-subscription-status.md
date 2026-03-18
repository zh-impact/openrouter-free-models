# 邮件订阅状态说明

## 📧 当前状态：已禁用

为了控制运营成本，邮件订阅服务目前处于**禁用状态**。

### 禁用的功能
- ❌ 邮件订阅表单（前端已隐藏）
- ❌ Resend 邮件发送服务
- ❌ 每日邮件摘要发送

### 保留的功能
- ✅ Telegram Bot 订阅（正常运行）
- ✅ 订阅者数据存储（数据库表保留）
- ✅ 订阅 API 端点（代码保留，方便重新启用）

---

## 🔄 重新启用邮件订阅

如需重新启用邮件订阅功能，请按以下步骤操作：

### 1. 更新后端代码

**文件**: `apps/backend/src/services/notification.ts`

找到 `sendEmailDigest` 方法，将禁用的代码恢复：

```typescript
// 恢复邮件发送（替换当前的跳过逻辑）
private async sendEmailDigest(changes: ModelChangeWithDetails[]): Promise<{
  total: number;
  sent: number;
  failed: number;
  skipped: number;
}> {
  const subscribers = await this.storage.getActiveEmailSubscribers();

  if (subscribers.length === 0) {
    return { total: 0, sent: 0, failed: 0, skipped: 0 };
  }

  // 重新启用这部分 ↓
  const results = await this.resendService.sendDailyDigest(subscribers, changes);

  let sent = 0;
  let failed = 0;

  for (const result of results) {
    if (result.success) {
      sent++;
      await this.storage.updateLastNotified(result.subscriberId);
    } else {
      failed++;
    }
  }

  return {
    total: subscribers.length,
    sent,
    failed,
    skipped: 0,
  };
}
```

### 2. 更新前端界面

**文件**: `apps/frontend/src/pages/SubscribePage.tsx`

恢复标签页选择器和邮件订阅表单：

```tsx
import { useState } from 'react';
import { SubscribeForm } from '../components/SubscribeForm';
import { TelegramSubscription } from '../components/TelegramSubscription';

type SubscriptionTab = 'email' | 'telegram';

export function SubscribePage() {
  const [activeTab, setActiveTab] = useState<SubscriptionTab>('telegram');

  return (
    <div className="max-w-2xl mx-auto">
      {/* 移除禁用通知 */}

      {/* 恢复标签页选择器 */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('email')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'email'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            📧 邮件订阅
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              activeTab === 'telegram'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            ✈️ Telegram
          </button>
        </div>
      </div>

      {/* 恢复内容渲染 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          {activeTab === 'email' ? <SubscribeForm /> : <TelegramSubscription />}
        </div>
      </div>

      {/* 恢复原有的功能说明部分 */}
    </div>
  );
}
```

### 3. 配置环境变量

确保 `.dev.vars` 或生产环境配置了 Resend 相关变量：

```bash
# 必需
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx

# 可选
RESEND_FROM_EMAIL=noreply@yourdomain.com
BASE_URL=https://yourdomain.com
```

### 4. 测试邮件发送

```bash
# 本地测试
pnpm --filter backend dev

# 测试发送
curl -X POST http://localhost:8787/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 💰 费用说明

### Resend 定价（参考）

| 套餐 | 月费用 | 每天 Email 数 |
|------|--------|--------------|
| Free | $0 | 3,000封 |
| Elastic | $20 | 50,000封 |
| Premium | $93 | 300,000封 |

### 成本估算

假设当前有 100 个邮件订阅者，每日发送 1 封：
- 每月：3,000 封邮件
- **Free 套餐可覆盖** ✅

但如果增长到 1,000 订阅者：
- 每月：30,000 封邮件
- 需要 Elastic 套餐 ($20/月)

**建议**：
1. 小规模（< 500 订阅者）：使用 Free 套餐
2. 中等规模（500-5000）：Elastic 套餐
3. 大规模（5000+）：Premium 套餐

---

## 🚀 当前推荐方案

**Telegram Bot 订阅**（已启用）

优势：
- ✅ **完全免费**
- ✅ **无发送数量限制**
- ✅ **即时送达**
- ✅ **支持富文本**
- ✅ **用户体验好**

建议在邮件订阅禁用期间，引导用户使用 Telegram 订阅。

---

## 📋 订阅者数据管理

即使邮件订阅禁用，现有的邮件订阅者数据仍然保留在数据库中：

```sql
-- 查看邮件订阅者数量
SELECT COUNT(*) FROM subscribers WHERE status = 'active';

-- 查看所有订阅者
SELECT email, subscribed_at, last_notified_at
FROM subscribers
WHERE status = 'active'
ORDER BY subscribed_at DESC;
```

重新启用邮件订阅时，可以直接向这些订阅者发送通知，无需重新订阅。

---

## 🔔 快速启用检查清单

- [ ] 更新 `notification.ts` 恢复邮件发送代码
- [ ] 更新 `SubscribePage.tsx` 显示邮件选项
- [ ] 验证 `RESEND_API_KEY` 环境变量已配置
- [ ] 运行类型检查：`pnpm --filter backend typecheck`
- [ ] 测试邮件发送功能
- [ ] 部署更新：`pnpm --filter backend deploy`
- [ ] 通知用户邮件订阅已恢复
