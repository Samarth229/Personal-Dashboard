import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';

const LoginPage     = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SettingsPage  = lazy(() => import('./pages/SettingsPage'));
const SpotifyPage   = lazy(() => import('./pages/SpotifyPage'));
const GitHubPage    = lazy(() => import('./pages/GitHubPage'));
const GmailPage     = lazy(() => import('./pages/GmailPage'));
const LetterboxdPage = lazy(() => import('./pages/LetterboxdPage'));
const SteamPage     = lazy(() => import('./pages/SteamPage'));
const RiotPage           = lazy(() => import('./pages/RiotPage'));
const PrivacyPolicyPage  = lazy(() => import('./pages/PrivacyPolicyPage'));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ background: '#000' }}>
    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0071e3', borderTopColor: 'transparent' }} />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

/* Adds page-enter animation keyed to the route */
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={
        <PublicRoute>
          <Suspense fallback={<PageLoader />}><LoginPage /></Suspense>
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><DashboardPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><SettingsPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/spotify" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><SpotifyPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/github" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><GitHubPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/gmail" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><GmailPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/letterboxd" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><LetterboxdPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/steam" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><SteamPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/riot" element={
        <ProtectedRoute><Suspense fallback={<PageLoader />}><RiotPage /></Suspense></ProtectedRoute>
      } />
      <Route path="/privacy" element={
        <Suspense fallback={<PageLoader />}><PrivacyPolicyPage /></Suspense>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
