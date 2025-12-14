import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import TicketsPage from './pages/TicketsPage';
import AccessRequestsPage from './pages/AccessRequestsPage';
import UsersPage from './pages/UsersPage';
import DevicesPage from './pages/DevicesPage';
import EmailsPage from './pages/EmailsPage';
import AgentStreamsPage from './pages/AgentStreamsPage';
import './styles/design-system.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout>
                <AgentStreamsPage />
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

          <Route path="/agent-streams" element={
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
    </AuthProvider>
  );
}

export default App;
