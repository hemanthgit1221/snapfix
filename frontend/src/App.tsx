import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { UserRole } from './types';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import TicketList from './components/tickets/TicketList';
import CreateTicket from './components/tickets/CreateTicket';
import TicketDetails from './components/tickets/TicketDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import Analytics from './components/analytics/Analytics';
import Rewards from './components/rewards/Rewards';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets" element={
              <ProtectedRoute>
                <Layout>
                  <TicketList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets/create" element={
              <ProtectedRoute>
                <Layout>
                  <CreateTicket />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute>
                <Layout>
                  <TicketDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
                <Layout>
                  <StaffDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/rewards" element={
              <ProtectedRoute>
                <Layout>
                  <Rewards />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
