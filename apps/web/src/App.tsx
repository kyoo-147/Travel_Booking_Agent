import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App as AntApp } from 'antd';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import { TripsListPage } from './pages/trips/TripsListPage';
import { TripDetailPage } from './pages/trips/TripDetailPage';
import { TripFormPage } from './pages/trips/TripFormPage';
import { SimpleTripForm } from './pages/trips/SimpleTripForm';
import { UserProfilePage } from './pages/profile/UserProfilePage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { FullScreenChatPage } from './pages/FullScreenChatPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { AuthDebugPage } from './pages/AuthDebugPage';
import { ZaloConnectPage } from './pages/ZaloConnectPage';

// Import styles
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AntApp>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/debug" element={<AuthDebugPage />} />

                {/* Protected routes with main layout */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <MainLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="/chat" replace />} />
                  <Route path="chat" element={<FullScreenChatPage />} />
                  <Route path="chat/:sessionId" element={<FullScreenChatPage />} />
                  <Route path="trips" element={<TripsListPage />} />
                  <Route path="trips/new" element={<TripFormPage />} />
                  <Route path="trips/simple" element={<SimpleTripForm />} />
                  <Route path="trips/:id" element={<TripDetailPage />} />
                  <Route path="trips/:id/edit" element={<TripFormPage />} />
                  <Route path="users" element={<UserManagementPage />} />
                  <Route path="profile" element={<UserProfilePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="zalo-connect" element={<ZaloConnectPage />} />
                  {/* Redirect old dashboard route to chat */}
                  <Route path="dashboard" element={<Navigate to="/chat" replace />} />
                </Route>
              </Routes>
            </Router>
          </AntApp>
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--ant-color-bg-container)',
              color: 'var(--ant-color-text)',
              border: '1px solid var(--ant-color-border)',
              borderRadius: '8px',
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;