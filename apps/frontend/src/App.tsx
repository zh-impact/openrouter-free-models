import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Header } from './components/Header';
import { ModelsPage } from './pages/ModelsPage';
import { ChangesPage } from './pages/ChangesPage';
import { SubscribePage } from './pages/SubscribePage';
import { AboutPage } from './pages/AboutPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newValue;
    });
  };

  // Initialize dark mode on mount
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<ModelsPage />} />
          <Route path="/models" element={<ModelsPage />} />
          <Route path="/changes" element={<ChangesPage />} />
          <Route path="/subscribe" element={<SubscribePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
        </Routes>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
          <p>OpenRouter Free Models Monitor • Data updated hourly</p>
          <div className="flex gap-4">
            <NavLink
              to="/about"
              className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              About
            </NavLink>
            <span>•</span>
            <NavLink
              to="/privacy"
              className="hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              Privacy Policy
            </NavLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

export { App };
