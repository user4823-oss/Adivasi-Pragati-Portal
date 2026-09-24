import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const STORAGE_KEY = 'mota_auth_user';

// Fixed dummy credentials
export const VALID_CREDENTIALS = {
  applicant: {
    email: 'applicant@nfst.gov.in',
    password: 'applicant123',
    role: 'applicant',
    name: 'Mangal Soren'
  },
  admin: {
    email: 'admin@mota.gov.in',
    password: 'admin123',
    role: 'admin',
    name: 'MoTA Admin (NFST Cell)'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error('Failed to parse auth user from localStorage:', e);
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState(false);

  // Sync state if localStorage changes
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  }, [user]);

  /**
   * Log in user against fixed dummy credentials
   * Returns { success: boolean, message?: string, user?: object }
   */
  const login = (email, password) => {
    setAuthLoading(true);

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    // Check applicant credentials
    if (
      cleanEmail === VALID_CREDENTIALS.applicant.email.toLowerCase() &&
      cleanPassword === VALID_CREDENTIALS.applicant.password
    ) {
      const sessionUser = {
        email: VALID_CREDENTIALS.applicant.email,
        role: 'applicant',
        name: VALID_CREDENTIALS.applicant.name,
        loginTime: new Date().toISOString()
      };
      setUser(sessionUser);
      setAuthLoading(false);
      return { success: true, user: sessionUser };
    }

    // Check admin credentials
    if (
      cleanEmail === VALID_CREDENTIALS.admin.email.toLowerCase() &&
      cleanPassword === VALID_CREDENTIALS.admin.password
    ) {
      const sessionUser = {
        email: VALID_CREDENTIALS.admin.email,
        role: 'admin',
        name: VALID_CREDENTIALS.admin.name,
        loginTime: new Date().toISOString()
      };
      setUser(sessionUser);
      setAuthLoading(false);
      return { success: true, user: sessionUser };
    }

    setAuthLoading(false);
    return {
      success: false,
      message: 'Invalid credentials. Please use the demo credentials provided below.'
    };
  };

  /**
   * Cleanly logout user, remove storage, and reset state
   */
  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Could not clear localStorage:', err);
    }
    setUser(null);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    isApplicant: user?.role === 'applicant',
    isAdmin: user?.role === 'admin',
    authLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
