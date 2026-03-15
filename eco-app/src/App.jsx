import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const AuthPage = lazy(() => import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const HomePage = lazy(() => import('./pages/HomePage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));

function AppLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0f1419 0%, #1a1a2e 100%)' }}>
      <div style={{ textAlign: 'center', color: '#16A34A' }}>
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state
  if (loading) {
    return <AppLoading />;
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<AppLoading />}>
        <AuthPage />
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calculator" element={<CalculatorPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

