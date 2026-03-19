export function AboutPage() {
  const lastUpdated = new Date('2025-03-12').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        About OpenRouter Free Models Monitor
      </h1>

      {/* Project Description */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          What is this project?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          OpenRouter Free Models Monitor is a web application that tracks and monitors free AI models
          available on OpenRouter. The service automatically detects changes in model availability,
          maintains a historical record of additions and removals, and provides notification services
          to keep users informed about the latest free model offerings.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          Data is updated hourly by syncing with OpenRouter's public API, ensuring you always have
          access to the most current information about free AI models.
        </p>
      </section>

      {/* Technical Stack */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Technology Stack
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Frontend</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
            <li>React - UI framework</li>
            <li>Vite - Build tool and dev server</li>
            <li>TypeScript - Type-safe JavaScript</li>
            <li>TailwindCSS - Utility-first CSS framework</li>
            <li>React Router v7 - Client-side routing</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Backend</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-4 space-y-1">
            <li>Hono - Fast web framework</li>
            <li>Cloudflare Workers - Serverless compute platform</li>
            <li>Grammy - Telegram Bot framework</li>
          </ul>

          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Database</h3>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Cloudflare D1 - Serverless SQLite database</li>
          </ul>
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Architecture
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          This project uses a serverless architecture built on Cloudflare's infrastructure:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Automated Sync:</strong> A cron job
            runs hourly to fetch the latest model data from OpenRouter's API
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Change Detection:</strong> Each sync
            compares new data with existing records to identify additions, removals, and modifications
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Notification System:</strong> Telegram
            bot delivers daily digests of model changes to subscribers
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Web Interface:</strong> Real-time
            dashboard for browsing models and viewing change history
          </li>
        </ul>
      </section>

      {/* Data Sources */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Data Sources
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          All model data is sourced from{' '}
          <a
            href="https://openrouter.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-600 underline font-medium transition-colors"
          >
            OpenRouter's public API
          </a>
          . This is an unofficial monitoring project - we are not affiliated with or endorsed by
          OpenRouter.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We only fetch publicly available model information (names, descriptions, pricing, etc.).
          No personal data is collected from users beyond what's necessary for notification services.
        </p>
      </section>

      {/* Acknowledgments */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Acknowledgments
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          This project would not be possible without:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">OpenRouter</strong> - For providing the
            API and maintaining an excellent platform for AI model access
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Cloudflare</strong> - For Workers,
            Pages, and D1 services that power this application
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Open Source Community</strong> - For
            the amazing tools and libraries that make development efficient and enjoyable
          </li>
        </ul>
      </section>

      {/* Source Code */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Source Code
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          This project is open source! The code is available on GitHub.
        </p>
        <a
          href="https://github.com/yourusername/openrouter-free-models"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-600 active:scale-95 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clipRule="evenodd"
            />
          </svg>
          View on GitHub
        </a>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-3">
          Contributions, issues, and feedback are welcome!
        </p>
      </section>

      {/* Last Updated */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Last Updated: {lastUpdated}
        </p>
      </div>
    </div>
  );
}
