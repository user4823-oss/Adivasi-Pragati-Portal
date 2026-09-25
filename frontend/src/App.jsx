import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/shared/Navbar';

// Pages
import LoginPage from './pages/applicant/LoginPage';
import ApplyPage from './pages/applicant/ApplyPage';
import StatusPage from './pages/applicant/StatusPage';
import DashboardPage from './pages/admin/DashboardPage';
import ApplicationReviewPage from './pages/admin/ApplicationReviewPage';
import SchemeConfigPage from './pages/admin/SchemeConfigPage';
import QuotaSelectionPage from './pages/admin/QuotaSelectionPage';

/**
 * Route protection for Applicant-only screens
 */
function ProtectedApplicantRoute({ children }) {
  const { isAuthenticated, isApplicant, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/applicant/login" state={{ from: location }} replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

/**
 * Route protection for Admin-only screens
 */
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isApplicant } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/applicant/login" state={{ from: location }} replace />;
  }

  if (isApplicant) {
    return <Navigate to="/applicant/status" replace />;
  }

  return children;
}

/**
 * Index route resolver based on current session
 */
function RootRedirect() {
  const { isAuthenticated, isApplicant, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/applicant/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Navigate to="/applicant/status" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Home redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Shared / Applicant Login */}
              <Route path="/applicant/login" element={<LoginPage />} />
              <Route path="/login" element={<Navigate to="/applicant/login" replace />} />

              {/* Applicant Screens */}
              <Route
                path="/applicant/apply"
                element={
                  <ProtectedApplicantRoute>
                    <ApplyPage />
                  </ProtectedApplicantRoute>
                }
              />
              <Route
                path="/applicant/status"
                element={
                  <ProtectedApplicantRoute>
                    <StatusPage />
                  </ProtectedApplicantRoute>
                }
              />

              {/* Admin Screens */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedAdminRoute>
                    <DashboardPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/review/:id"
                element={
                  <ProtectedAdminRoute>
                    <ApplicationReviewPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/schemes"
                element={
                  <ProtectedAdminRoute>
                    <SchemeConfigPage />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/selection"
                element={
                  <ProtectedAdminRoute>
                    <QuotaSelectionPage />
                  </ProtectedAdminRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
