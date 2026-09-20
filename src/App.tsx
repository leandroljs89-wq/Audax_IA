import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import { Page } from './types';
import { Loader2 } from 'lucide-react';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isAdminLoggedIn, loading } = useApp();

  const handleNavigate = (page: Page) => {
    if (page === 'admin' && !isAdminLoggedIn) {
      setCurrentPage('admin-login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-zinc-900 font-bold text-2xl">B</span>
          </div>
          <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
          <p className="text-zinc-500 text-sm mt-3">Carregando...</p>
        </div>
      </div>
    );
  }

  switch (currentPage) {
    case 'home':
      return <HomePage onNavigate={handleNavigate} />;
    case 'booking':
      return <BookingPage onNavigate={handleNavigate} />;
    case 'admin-login':
      return <AdminLoginPage onNavigate={handleNavigate} />;
    case 'admin':
      return isAdminLoggedIn ? <AdminPage onNavigate={handleNavigate} /> : <AdminLoginPage onNavigate={handleNavigate} />;
    default:
      return <HomePage onNavigate={handleNavigate} />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
