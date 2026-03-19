import { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { Header } from './components/Header'
import { ModelsPage } from './pages/ModelsPage'
import { ChangesPage } from './pages/ChangesPage'
import { SubscribePage } from './pages/SubscribePage'
import { AboutPage } from './pages/AboutPage'
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage'

// Scroll to top on route change
function ScrollToTop() {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return null
}

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev
      if (newValue) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return newValue
    })
  }

  // Initialize dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <ScrollToTop />
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="container-custom min-h-[calc(100vh-8rem)]">
        <Routes>
          <Route path="/" element={<ModelsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/changes" element={<ChangesPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-16">
        <div className="container-custom py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                    />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  OpenRouter Free Models
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor free AI models from OpenRouter in real-time
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                    Product
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <NavLink
                        to="/models"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-400 transition-colors"
                      >
                        Models
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/changes"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-400 transition-colors"
                      >
                        Changes
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/subscribe"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-400 transition-colors"
                      >
                        Subscribe
                      </NavLink>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                    Company
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <NavLink
                        to="/about"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-400 transition-colors"
                      >
                        About
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/privacy"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-accent dark:hover:text-accent-400 transition-colors"
                      >
                        Privacy Policy
                      </NavLink>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">
                    Data
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Updated hourly
                      </span>
                    </li>
                    <li>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Source: OpenRouter API
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} OpenRouter Free Models Monitor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { App }
