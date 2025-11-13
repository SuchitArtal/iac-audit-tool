import React, { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import { Toaster } from 'sonner';

function App() {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 supports-[backdrop-filter]:dark:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-semibold">IaC Security Auditing Tool</h1>
          <button
            onClick={() => setDark((d) => !d)}
            className="px-3 py-1.5 rounded-md text-sm border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Dashboard />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
