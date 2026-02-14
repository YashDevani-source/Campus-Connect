import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import GrievanceList from './pages/grievances/GrievanceList';
import GrievanceDetail from './pages/grievances/GrievanceDetail';
import NewGrievance from './pages/grievances/NewGrievance';
import CourseList from './pages/academic/CourseList';
import CourseDetail from './pages/academic/CourseDetail';
import OpportunityList from './pages/internship/OpportunityList';
import OpportunityDetail from './pages/internship/OpportunityDetail';
import PlaceholderPage from './pages/PlaceholderPage';
import Profile from './pages/profile/Profile';
import Transport from './pages/transport/Transport';

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading Campus Connect...</p></div>;

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />

      {/* Protected Layout */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Grievances */}
        <Route path="/grievances" element={
          <ProtectedRoute allowedRoles={['student', 'authority', 'admin']}><GrievanceList /></ProtectedRoute>
        } />
        <Route path="/grievances/new" element={
          <ProtectedRoute allowedRoles={['student']}><NewGrievance /></ProtectedRoute>
        } />
        <Route path="/grievances/:id" element={
          <ProtectedRoute allowedRoles={['student', 'authority', 'admin']}><GrievanceDetail /></ProtectedRoute>
        } />

        {/* Academics */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        {/* Opportunities */}
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />

        {/* New Modules (Placeholders) */}
        <Route path="/clubs" element={<PlaceholderPage title="Clubs & Community" />} />
        <Route path="/doubts" element={<PlaceholderPage title="Doubts & Forum" />} />
        <Route path="/chats" element={<PlaceholderPage title="Class Chats" />} />
        <Route path="/chats" element={<PlaceholderPage title="Class Chats" />} />
        <Route path="/transport" element={<Transport />} />
        <Route path="/fees" element={<PlaceholderPage title="Fees & Payments" />} />
        <Route path="/fees" element={<PlaceholderPage title="Fees & Payments" />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        duration: 3000,
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#0f172a' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#0f172a' } },
      }} />
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
