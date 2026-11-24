import React, { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { initThemeListener } from './utils/themeHelper';

export default function App() {
  useEffect(() => {
    const cleanup = initThemeListener();
    return cleanup;
  }, []);

  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}
