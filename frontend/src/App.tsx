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
import AdminTickets from './components/admin/AdminTickets';
import StaffManagement from './components/admin/StaffManagement';
import StaffDashboard from './components/staff/StaffDashboard';
import AssignedTickets from './components/tickets/AssignedTickets';
import Analytics from './components/analytics/Analytics';
import Rewards from './components/rewards/Rewards';
import StudentSettings from './components/student/StudentSettings';
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
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/staff" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <StaffManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/tickets" element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.DEPARTMENT_HEAD]}>
                <Layout>
                  <AdminTickets />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/tickets/:ticketId" element={
              <ProtectedRoute>
                <Layout>
                  <TicketDetails />
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
            <Route path="/assigned-tickets" element={
              <ProtectedRoute allowedRoles={[UserRole.STAFF]}>
                <Layout>
                  <AssignedTickets />
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
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <StudentSettings />
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
