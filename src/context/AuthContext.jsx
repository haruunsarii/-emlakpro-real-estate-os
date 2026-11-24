import React, { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContextCore';
import {
  getCurrentSession,
  clearSession,
  setupInitialAdmin as serviceSetupInitialAdmin,
  authenticate as serviceAuthenticate,
  hasAnyRegisteredUser,
  hasAdminUser,
} from '../services/authService';

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());
  const [isInitialSetupRequired, setIsInitialSetupRequired] = useState(
    () => !hasAnyRegisteredUser()
  );
  const [isLoading, setIsLoading] = useState(false);

  const refreshAuth = useCallback(() => {
    const session = getCurrentSession();
    const needsSetup = !hasAnyRegisteredUser();
    setCurrentUser(session);
    setIsInitialSetupRequired(needsSetup);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleSync = () => {
      refreshAuth();
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('emlakpro_session_change', handleSync);
    window.addEventListener('emlakpro_data_reset', handleSync);
    window.addEventListener('emlakpro_data_restored', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('emlakpro_session_change', handleSync);
      window.removeEventListener('emlakpro_data_reset', handleSync);
      window.removeEventListener('emlakpro_data_restored', handleSync);
    };
  }, [refreshAuth]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const result = await serviceAuthenticate(email, password);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsInitialSetupRequired(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setupInitialAdmin = useCallback(async (adminData) => {
    setIsLoading(true);
    try {
      const result = await serviceSetupInitialAdmin(adminData);
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setIsInitialSetupRequired(false);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setIsInitialSetupRequired(!hasAnyRegisteredUser());
  }, []);

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isAdmin: currentUser?.role === 'admin',
    isConsultant: currentUser?.role === 'consultant',
    isInitialSetupRequired,
    hasRegisteredAdmin: hasAdminUser(),
    isLoading,
    login,
    setupInitialAdmin,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
