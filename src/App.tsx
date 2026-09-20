import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import HomePage from './pages/HomePage';
import BookingPage from './pages/BookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import { Page } from './types';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const { isAdminLoggedIn } = useApp();

  const handleNavigate = (page: Page) => {
    if (page === 'admin' && !isAdminLoggedIn) {
      setCurrentPage('admin-login');
      return;
    }
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

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
