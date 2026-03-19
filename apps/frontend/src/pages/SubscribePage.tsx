import { TelegramSubscription } from '../components/TelegramSubscription'

export function SubscribePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8 p-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">订阅通知</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          通过 Telegram Bot 第一时间了解 OpenRouter 免费模型的最新动态
        </p>
      </div>

      {/* Notice about email subscription being disabled */}
      <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 hidden">
        <div className="flex items-start space-x-3">
          <svg
            className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0v3a1 1 0 002 0z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">邮件订阅暂时不可用</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              由于运营成本考虑，邮件订阅服务暂时关闭。请使用 Telegram Bot 接收模型更新通知。
            </p>
          </div>
        </div>
      </div>

      <TelegramSubscription />

      {/* Features */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">您将收到什么？</h2>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">新增模型通知</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                了解最新加入免费队列的 AI 模型
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">模型移除提醒</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">及时知道哪些模型不再免费</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">模型变更追踪</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                掌握模型参数、上下文长度等重要变化
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Telegram 订阅优势</h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start space-x-2">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>即时推送，无需打开邮箱</span>
            </li>
            <li className="flex items-start space-x-2">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>支持富文本格式，模型信息更清晰</span>
            </li>
            <li className="flex items-start space-x-2">
              <svg
                className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>随时使用 /unsubscribe 命令取消订阅</span>
            </li>
          </ul>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">常见问题</h3>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="font-medium text-gray-700 dark:text-gray-300">多久收到通知？</dt>
              <dd className="text-gray-600 dark:text-gray-400">每天一次，在模型有更新时发送。</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700 dark:text-gray-300">如何取消订阅？</dt>
              <dd className="text-gray-600 dark:text-gray-400">
                在 Telegram 中发送 /unsubscribe 命令即可。
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-700 dark:text-gray-300">收费吗？</dt>
              <dd className="text-gray-600 dark:text-gray-400">
                完全免费，我们只发送有价值的内容。
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
