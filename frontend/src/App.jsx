import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ChatProvider from './context/ChatContext';
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

// ─── Admin Pages ───
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import GlobalGrievances from './pages/admin/GlobalGrievances';
import CourseApproval from './pages/admin/CourseApproval';

// ─── Faculty Pages ───
import MyCourses from './pages/faculty/MyCourses';
import AttendanceManager from './pages/faculty/AttendanceManager';
import AttendanceAnalytics from './pages/faculty/AttendanceAnalytics';
import MarksManager from './pages/faculty/MarksManager';
import FacultyDoubtForum from './pages/faculty/DoubtForum';

// ─── Management Pages ───
import GrievanceManager from './pages/management/GrievanceManager';
import FeeManager from './pages/management/FeeManager';
import BusManager from './pages/management/BusManager';
import CertificateManager from './pages/management/CertificateManager';
import IDCardManager from './pages/management/IDCardManager';

// ─── Student Pages ───
import StudentDoubtForum from './pages/student/DoubtForum';
import ChatPage from './pages/student/ChatPage';
import BusBooking from './pages/student/BusBooking';
import PaymentsPage from './pages/student/PaymentsPage';
import SemesterReport from './pages/student/SemesterReport';
import AttendanceView from './pages/student/AttendanceView';
import MarksView from './pages/student/MarksView';
import CertificatesPage from './pages/student/CertificatesPage';

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

        {/* Grievances – Student + Faculty can create, all roles can view */}
        <Route path="/grievances" element={
          <ProtectedRoute allowedRoles={['student', 'faculty', 'managementMember', 'admin']}><GrievanceList /></ProtectedRoute>
        } />
        <Route path="/grievances/new" element={
          <ProtectedRoute allowedRoles={['student', 'faculty']}><NewGrievance /></ProtectedRoute>
        } />
        <Route path="/grievances/:id" element={
          <ProtectedRoute allowedRoles={['student', 'faculty', 'managementMember', 'admin']}><GrievanceDetail /></ProtectedRoute>
        } />

        {/* Academics */}
        <Route path="/courses" element={<CourseList />} />
        <Route path="/courses/:id" element={<CourseDetail />} />

        {/* Opportunities */}
        <Route path="/opportunities" element={<OpportunityList />} />
        <Route path="/opportunities/:id" element={<OpportunityDetail />} />

        {/* Transport (existing) */}
        <Route path="/transport" element={<Transport />} />

        {/* Clubs placeholder */}
        <Route path="/clubs" element={<PlaceholderPage title="Clubs & Community" />} />

        {/* ═══════════ Admin Routes ═══════════ */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>
        } />
        <Route path="/admin/users/:id" element={
          <ProtectedRoute allowedRoles={['admin']}><UserDetail /></ProtectedRoute>
        } />
        <Route path="/admin/grievances" element={
          <ProtectedRoute allowedRoles={['admin']}><GlobalGrievances /></ProtectedRoute>
        } />
        <Route path="/admin/course-approval" element={
          <ProtectedRoute allowedRoles={['admin', 'managementMember']}><CourseApproval /></ProtectedRoute>
        } />

        {/* ═══════════ Faculty Routes ═══════════ */}
        <Route path="/faculty/courses" element={
          <ProtectedRoute allowedRoles={['faculty']}><MyCourses /></ProtectedRoute>
        } />
        <Route path="/faculty/attendance/:courseId" element={
          <ProtectedRoute allowedRoles={['faculty']}><AttendanceManager /></ProtectedRoute>
        } />
        <Route path="/faculty/analytics/:courseId" element={
          <ProtectedRoute allowedRoles={['faculty']}><AttendanceAnalytics /></ProtectedRoute>
        } />
        <Route path="/faculty/marks/:courseId" element={
          <ProtectedRoute allowedRoles={['faculty']}><MarksManager /></ProtectedRoute>
        } />
        <Route path="/faculty/doubts/:courseId" element={
          <ProtectedRoute allowedRoles={['faculty']}><FacultyDoubtForum /></ProtectedRoute>
        } />

        {/* ═══════════ Management Routes ═══════════ */}
        <Route path="/management/grievances" element={
          <ProtectedRoute allowedRoles={['managementMember']}><GrievanceManager /></ProtectedRoute>
        } />
        <Route path="/management/fees" element={
          <ProtectedRoute allowedRoles={['managementMember']}><FeeManager /></ProtectedRoute>
        } />
        <Route path="/management/bus" element={
          <ProtectedRoute allowedRoles={['managementMember']}><BusManager /></ProtectedRoute>
        } />
        <Route path="/management/certificates" element={
          <ProtectedRoute allowedRoles={['managementMember']}><CertificateManager /></ProtectedRoute>
        } />
        <Route path="/management/idcards" element={
          <ProtectedRoute allowedRoles={['managementMember']}><IDCardManager /></ProtectedRoute>
        } />

        {/* ═══════════ Student Routes ═══════════ */}
        <Route path="/student/doubts/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}><StudentDoubtForum /></ProtectedRoute>
        } />
        <Route path="/student/bus" element={
          <ProtectedRoute allowedRoles={['student', 'faculty']}><BusBooking /></ProtectedRoute>
        } />
        <Route path="/student/payments" element={
          <ProtectedRoute allowedRoles={['student']}><PaymentsPage /></ProtectedRoute>
        } />
        <Route path="/student/report" element={
          <ProtectedRoute allowedRoles={['student']}><SemesterReport /></ProtectedRoute>
        } />
        <Route path="/student/attendance/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}><AttendanceView /></ProtectedRoute>
        } />
        <Route path="/student/marks/:courseId" element={
          <ProtectedRoute allowedRoles={['student']}><MarksView /></ProtectedRoute>
        } />
        <Route path="/student/certificates" element={
          <ProtectedRoute allowedRoles={['student']}><CertificatesPage /></ProtectedRoute>
        } />

        {/* ═══════════ Chat (All Roles) ═══════════ */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
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
      <ChatProvider>
        <AppRoutes />
      </ChatProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
