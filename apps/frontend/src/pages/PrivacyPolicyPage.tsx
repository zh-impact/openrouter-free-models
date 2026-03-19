export function PrivacyPolicyPage() {
  const lastUpdated = new Date('2025-03-12').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Privacy Policy
      </h1>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
        This Privacy Policy explains how OpenRouter Free Models Monitor collects, uses, and
        protects your information. Please read this policy carefully to understand our practices.
      </p>

      {/* Data Collection */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          1. Data We Collect
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          <strong className="text-gray-900 dark:text-white">We do not collect personal data</strong>{' '}
          for visitors who simply browse the website. You can use the model monitoring features
          anonymously without providing any personal information.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          However, if you subscribe to our notification services, we collect the following:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Telegram Subscriptions:</strong> Your
            Telegram chat_id, username (if public), and first name are stored to send model update
            notifications.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Email Subscriptions:</strong>{' '}
            Currently disabled. Previously collected email addresses are retained in the database
            but are not actively used.
          </li>
        </ul>
      </section>

      {/* Third-Party Services */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          2. Third-Party Services
        </h2>

        {/* OpenRouter API */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            2.1 OpenRouter API
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            We fetch model data from OpenRouter's public API. We only access publicly available
            information about AI models (names, descriptions, pricing, context length, etc.).
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>No personal data is sent to OpenRouter</li>
            <li>We only read public model information</li>
            <li>
              OpenRouter's privacy policy:{' '}
              <a
                href="https://openrouter.ai/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-600 underline font-medium transition-colors"
              >
                openrouter.ai/privacy
              </a>
            </li>
          </ul>
        </div>

        {/* Telegram */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">2.2 Telegram</h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            For Telegram notifications, we store your chat_id in our database. This information is:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>Used solely to send model update notifications</li>
            <li>Not shared with any third parties (except Telegram's infrastructure)</li>
            <li>Stored securely in Cloudflare D1 database</li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
            Telegram processes your data according to their{' '}
            <a
              href="https://telegram.org/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-600 underline font-medium transition-colors"
            >
              Privacy Policy
            </a>
            .
          </p>
        </div>

        {/* Cloudflare */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            2.3 Cloudflare Services
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
            This application is hosted on Cloudflare's infrastructure:
          </p>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
            <li>
              <strong className="text-gray-900 dark:text-white">Cloudflare Workers:</strong> Backend
              API and serverless functions
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Cloudflare Pages:</strong> Frontend
              web hosting
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Cloudflare D1:</strong> Serverless
              database for storing models and subscriptions
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-3">
            Cloudflare may collect standard access logs (IP addresses, request timestamps) for
            security and analytics purposes. See{' '}
            <a
              href="https://www.cloudflare.com/privacypolicy/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-600 underline font-medium transition-colors"
            >
              Cloudflare's Privacy Policy
            </a>
            .
          </p>
        </div>
      </section>

      {/* Data Usage */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          3. How We Use Your Data
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Any data we collect is used for the following purposes:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Telegram Notifications:</strong> Your
            chat_id is used exclusively to send daily digests about model changes (additions,
            removals, modifications).
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Database Storage:</strong> Subscriber
            information and model change history are stored in Cloudflare D1 for service operation.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Service Improvement:</strong>
            Anonymous usage data may be analyzed to improve service reliability and performance.
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          We <strong className="text-gray-900 dark:text-white">never sell</strong> your data to
          third parties.
        </p>
      </section>

      {/* User Rights */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          4. Your Privacy Rights
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          You have the following rights regarding your data:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-3">
          <li>
            <strong className="text-gray-900 dark:text-white">Right to Access:</strong> You can
            request a copy of the data we have about you by contacting us through the GitHub
            repository.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Right to Deletion:</strong> You can
            delete your subscription at any time:
            <ul className="list-[circle] inside ml-6 mt-2 space-y-1">
              <li>
                <strong className="text-gray-900 dark:text-white">Telegram:</strong> Send the{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  /unsubscribe
                </code>{' '}
                command to the bot. Your data will be removed immediately from our database.
              </li>
              <li>
                <strong className="text-gray-900 dark:text-white">Email:</strong> Currently disabled.
                Previously collected emails remain in the database but are not actively used.
              </li>
            </ul>
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Right to Unsubscribe:</strong>
            Unsubscribing from notifications is immediate. Use the{' '}
            <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              /unsubscribe
            </code>{' '}
            command in Telegram.
          </li>
        </ul>
      </section>

      {/* Data Security */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          5. Data Security
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          We implement appropriate security measures to protect your data:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Encryption in Transit:</strong> All
            data is transmitted over HTTPS using TLS encryption.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Secure Infrastructure:</strong> Data is
            stored in Cloudflare D1, which employs industry-standard security practices.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Access Control:</strong> Database
            access is restricted to authorized application functions only.
          </li>
        </ul>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
          While we strive to protect your data, no method of transmission over the internet is 100%
          secure. We cannot guarantee absolute security.
        </p>
      </section>

      {/* Cookies and Tracking */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          6. Cookies and Tracking
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          <strong className="text-gray-900 dark:text-white">We do not use cookies</strong> for
          tracking or advertising purposes.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          However, your browser may store:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Local Storage:</strong> Your dark
            mode preference is stored locally in your browser. This data never leaves your device
            and is not accessible to us.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Browser Cache:</strong> Static
            assets (CSS, JavaScript) may be cached by your browser for performance.
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          You can clear local storage and browser cache at any time through your browser settings.
        </p>
      </section>

      {/* Data Retention */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          7. Data Retention
        </h2>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Telegram Subscribers:</strong>{' '}
            Active subscriptions are retained indefinitely. Inactive subscriptions (users who
            unsubscribed) are removed immediately upon request.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Model Data:</strong> Historical model
            change data is retained for the lifetime of the service. This is public data from
            OpenRouter, not personal user data.
          </li>
        </ul>
      </section>

      {/* Children's Privacy */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          8. Children's Privacy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          This service is not directed to children under the age of 13. We do not knowingly collect
          personal data from children under 13. If you are a parent or guardian and believe your
          child has provided us with data, please contact us through the GitHub repository.
        </p>
      </section>

      {/* International Data Transfers */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          9. International Data Transfers
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          Your information may be transferred to and processed in countries other than your own
          due to:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>
            <strong className="text-gray-900 dark:text-white">Cloudflare Infrastructure:</strong>{' '}
            Cloudflare operates data centers worldwide. Your data may be stored and processed in
            various jurisdictions.
          </li>
          <li>
            <strong className="text-gray-900 dark:text-white">Telegram:</strong> Telegram operates
            internationally. Your chat_id and messages are processed according to Telegram's data
            policies.
          </li>
        </ul>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          We ensure appropriate safeguards are in place to protect your data in accordance with
          this Privacy Policy.
        </p>
      </section>

      {/* Policy Updates */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          10. Changes to This Policy
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We may update this Privacy Policy from time to time. Changes will be reflected on this
          page with an updated "Last Updated" date. We encourage you to review this policy
          periodically to stay informed about how we protect your data.
        </p>
      </section>

      {/* Contact Information */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          11. Contact Us
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          If you have questions, concerns, or requests regarding this Privacy Policy or our data
          practices, please reach out:
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
          <li>
            <strong className="text-gray-900 dark:text-white">GitHub Repository:</strong>{' '}
            <a
              href="https://github.com/yourusername/openrouter-free-models"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-600 underline font-medium transition-colors"
            >
              View project and open an issue
            </a>
          </li>
        </ul>
      </section>

      {/* Legal Disclaimer */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          12. Disclaimer
        </h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
            <strong className="text-gray-900 dark:text-white">Disclaimer:</strong> This Privacy
            Policy is provided for informational purposes only and does not constitute legal advice.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
            This is an open-source community project. While we strive to protect your privacy and
            be transparent about our data practices, we make no guarantees regarding legal
            compliance in all jurisdictions.
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            If you have specific legal concerns, please consult with a qualified attorney in your
            jurisdiction.
          </p>
        </div>
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
