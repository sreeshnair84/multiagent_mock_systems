import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import DashboardStatsPage from './pages/DashboardStatsPage';
import TicketsPage from './pages/TicketsPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import UsersPage from './pages/UsersPage';
import DevicesPage from './pages/DevicesPage';
import EmailsPage from './pages/EmailsPage';
import AgentStreamsPage from './pages/AgentStreamsPage';
import ResourceManagementPage from './pages/ResourceManagementPage';
import RoleManagementPage from './pages/RoleManagementPage';
import './styles/design-system.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardStatsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/tickets" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <TicketsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/access-requests" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AccessRequestsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/roles" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <RoleManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/users" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <UsersPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/devices" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DevicesPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/emails" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <EmailsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/resources" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ResourceManagementPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            <Route path="/chat" element={
              <ProtectedRoute>
                <DashboardLayout>
                  <AgentStreamsPage />
                </DashboardLayout>
              </ProtectedRoute>
            } />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
