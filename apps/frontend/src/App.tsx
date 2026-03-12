import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { ModelsPage } from './pages/ModelsPage';
import { ChangesPage } from './pages/ChangesPage';
import { SubscribePage } from './pages/SubscribePage';

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
        </Routes>
      </main>
      <footer className="container mx-auto px-4 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>OpenRouter Free Models Monitor • Data updated hourly</p>
      </footer>
    </div>
  );
}

export { App };
