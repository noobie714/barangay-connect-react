import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/resident/Dashboard';
import RequestForm    from './pages/resident/RequestForm';
import MyRequests     from './pages/resident/MyRequests';
import TrackStatus    from './pages/resident/TrackStatus';
import AdminDashboard from './pages/admin/AdminDashboard';
import AllRequests    from './pages/admin/AllRequests';
import Residents      from './pages/admin/Residents';
import Reports        from './pages/admin/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"         element={<Landing />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Resident */}
          <Route path="/dashboard" element={
            <ProtectedRoute role="resident"><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/request" element={
            <ProtectedRoute role="resident"><RequestForm /></ProtectedRoute>
          }/>
          <Route path="/my-requests" element={
            <ProtectedRoute role="resident"><MyRequests /></ProtectedRoute>
          }/>
          <Route path="/track" element={
            <ProtectedRoute role="resident"><TrackStatus /></ProtectedRoute>
          }/>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          }/>
          <Route path="/admin/requests" element={
            <ProtectedRoute role="admin"><AllRequests /></ProtectedRoute>
          }/>
          <Route path="/admin/residents" element={
            <ProtectedRoute role="admin"><Residents /></ProtectedRoute>
          }/>
          <Route path="/admin/reports" element={
            <ProtectedRoute role="admin"><Reports /></ProtectedRoute>
          }/>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}