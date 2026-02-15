import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import NoticeBoard from '../../components/dashboard/NoticeBoard';
import {
  HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlinePlus,
  HiOutlineExclamationCircle, HiOutlineUsers, HiOutlineClipboardList,
  HiOutlineChatAlt2, HiOutlineTruck, HiOutlineCurrencyRupee, HiOutlineQuestionMarkCircle,
  HiOutlineChartBar, HiOutlineIdentification, HiOutlineDocumentDuplicate,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineEye, HiOutlineArrowRight,
  HiOutlineLightningBolt,
  HiOutlineSpeakerphone, HiOutlineXCircle, HiOutlinePaperAirplane
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();

  const dashboards = {
    student: <StudentDash />, faculty: <FacultyDash />,
    managementMember: <ManagementDash />, admin: <AdminDash />,
  };

  return (
    <div className="page-container animate-fade-in">
      {/* Hero Welcome */}
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-hero-text">
            <span className="dash-greeting">Good {getGreeting()},</span>
            <h1 className="dash-name">{user.name}!</h1>
            <p className="dash-subtitle">
              {user.role === 'student' && '📚 Track your academics, attendance, and campus life'}
              {user.role === 'faculty' && '👨‍🏫 Manage courses, attendance, and student queries'}
              {user.role === 'managementMember' && '🏛️ Oversee campus operations and student services'}
              {user.role === 'admin' && '⚡ Full control over users, courses, and platform'}
            </p>
          </div>
          <div className="dash-hero-badge">
            <span className={`role-badge role-${user.role}`} style={{ fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              {user.role === 'managementMember' ? 'Management' : user.role}
            </span>
          </div>
        </div>
      </div>

      {/* Scrolling Notice Board Banner */}
      {/* Notice Board Section */}
      <NoticeBoard user={user} />

      {dashboards[user.role] || <StudentDash />}
    </div>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
};

/* ═══════ QUICK STAT CARD ═══════ */
const QuickStat = ({ icon, label, value, color, to, delay }) => (
  <Link to={to || '#'} className="quick-stat-card" style={{ animationDelay: delay || '0s' }}>
    <div className="quick-stat-icon" style={{ background: `var(--${color}-bg, rgba(59,130,246,0.1))`, color: `var(--${color}, var(--accent))` }}>
      {icon}
    </div>
    <div className="quick-stat-info">
      <span className="quick-stat-value">{value ?? '—'}</span>
      <span className="quick-stat-label">{label}</span>
    </div>
  </Link>
);

/* ═══════ ACTION CARD ═══════ */
const ActionCard = ({ icon, title, desc, to, color, delay }) => (
  <Link to={to} className="action-card animate-scale-in" style={{ animationDelay: delay || '0s' }}>
    <div className="action-card-accent" style={{ background: `var(--${color}, var(--accent))` }} />
    <div className="action-card-icon" style={{ color: `var(--${color}, var(--accent))` }}>
      {icon}
    </div>
    <h3 className="action-card-title">{title}</h3>
    <p className="action-card-desc">{desc}</p>
    <span className="action-card-link" style={{ color: `var(--${color}, var(--accent))` }}>
      Explore <HiOutlineArrowRight />
    </span>
  </Link>
);

/* ═══════ STUDENT DASHBOARD ═══════ */
const StudentDash = () => {
  const [stats, setStats] = useState({ payments: 0, pendingPayments: 0, grievances: 0, courses: 0, bookings: 0, certificates: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [pay, griev, courses, bookings, certs] = await Promise.allSettled([
          api.get('/student/payments'),
          api.get('/grievances'),
          api.get('/courses'),
          api.get('/student/bus/bookings'),
          api.get('/student/certificates'),
        ]);
        const payments = pay.status === 'fulfilled' ? pay.value.data.data : [];
        const pendingPay = Array.isArray(payments) ? payments.filter(p => p.status === 'pending').length : 0;
        setStats({
          payments: Array.isArray(payments) ? payments.length : 0,
          pendingPayments: pendingPay,
          grievances: griev.status === 'fulfilled' ? (griev.value.data.data.total || 0) : 0,
          courses: courses.status === 'fulfilled' ? (courses.value.data.data.total || 0) : 0,
          bookings: bookings.status === 'fulfilled' ? (Array.isArray(bookings.value.data.data) ? bookings.value.data.data.length : 0) : 0,
          certificates: certs.status === 'fulfilled' ? (Array.isArray(certs.value.data.data) ? certs.value.data.data.length : 0) : 0,
        });
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <QuickStat icon={<HiOutlineAcademicCap />} label="Courses" value={loading ? '…' : stats.courses} color="accent" to="/courses" delay="0.05s" />
        <QuickStat icon={<HiOutlineExclamationCircle />} label="Grievances" value={loading ? '…' : stats.grievances} color="warning" to="/grievances" delay="0.1s" />
        <QuickStat icon={<HiOutlineCurrencyRupee />} label="Pending Fees" value={loading ? '…' : stats.pendingPayments} color="danger" to="/student/payments" delay="0.15s" />
        <QuickStat icon={<HiOutlineTruck />} label="Bookings" value={loading ? '…' : stats.bookings} color="info" to="/student/bus" delay="0.2s" />
      </div>

      {/* Module Cards */}
      <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Quick Access</h2>
      <div className="action-cards-grid">
        <ActionCard icon={<HiOutlineExclamationCircle />} title="Grievances" desc="Track & file complaints" to="/grievances" color="warning" delay="0.1s" />
        <ActionCard icon={<HiOutlineAcademicCap />} title="Academics" desc="Courses & study material" to="/courses" color="accent" delay="0.15s" />
        <ActionCard icon={<HiOutlineBriefcase />} title="Opportunities" desc="Internships & jobs" to="/opportunities" color="success" delay="0.2s" />
        <ActionCard icon={<HiOutlineUsers />} title="Community" desc="Clubs & events" to="/clubs" color="purple" delay="0.25s" />
        <ActionCard icon={<HiOutlineQuestionMarkCircle />} title="Doubts Forum" desc="Get expert solutions" to="/courses" color="info" delay="0.3s" />
        <ActionCard icon={<HiOutlineChatAlt2 />} title="Class Chats" desc="Connect with peers" to="/chat" color="pink" delay="0.35s" />
        <ActionCard icon={<HiOutlineTruck />} title="Transport" desc="Bus schedules & booking" to="/student/bus" color="warning" delay="0.4s" />
        <ActionCard icon={<HiOutlineCurrencyRupee />} title="Payments" desc="Manage fees & dues" to="/student/payments" color="success" delay="0.45s" />
      </div>
    </>
  );
};

/* ═══════ FACULTY DASHBOARD ═══════ */
const FacultyDash = () => {
  const [stats, setStats] = useState({ courses: 0, opportunities: 0, grievances: 0 });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [c, o, g] = await Promise.allSettled([
          api.get('/faculty/courses'),
          api.get('/opportunities'),
          api.get('/grievances'),
        ]);
        const courseData = c.status === 'fulfilled' ? c.value.data.data : [];
        setCourses(Array.isArray(courseData) ? courseData : []);
        setStats({
          courses: Array.isArray(courseData) ? courseData.length : 0,
          opportunities: o.status === 'fulfilled' ? (o.value.data.data.total || 0) : 0,
          grievances: g.status === 'fulfilled' ? (g.value.data.data.total || 0) : 0,
        });
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <div className="quick-stats-row">
        <QuickStat icon={<HiOutlineAcademicCap />} label="My Courses" value={loading ? '…' : stats.courses} color="accent" to="/faculty/courses" delay="0.05s" />
        <QuickStat icon={<HiOutlineBriefcase />} label="Opportunities" value={loading ? '…' : stats.opportunities} color="success" to="/opportunities" delay="0.1s" />
        <QuickStat icon={<HiOutlineExclamationCircle />} label="Grievances" value={loading ? '…' : stats.grievances} color="warning" to="/grievances" delay="0.15s" />
      </div>

      {courses.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '0.5rem' }}>My Courses</h2>
          <div className="action-cards-grid">
            {courses.slice(0, 6).map((c, i) => (
              <div key={c._id} className="action-card animate-scale-in" style={{ animationDelay: `${0.1 + i * 0.05}s`, cursor: 'default' }}>
                <div className="action-card-accent" style={{ background: 'var(--accent)' }} />
                <h3 className="action-card-title">{c.title}</h3>
                <p className="action-card-desc">{c.code} • {c.enrolledStudents?.length || 0} students • {c.credits} credits</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <button onClick={() => navigate(`/faculty/attendance/${c._id}`)} className="btn btn-sm btn-outline">📋 Attendance</button>
                  <button onClick={() => navigate(`/faculty/marks/${c._id}`)} className="btn btn-sm btn-outline">📝 Marks</button>
                  <button onClick={() => navigate(`/faculty/analytics/${c._id}`)} className="btn btn-sm btn-primary">📊 Analytics</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Quick Actions</h2>
      <div className="action-cards-grid">
        <ActionCard icon={<HiOutlineAcademicCap />} title="My Courses" desc="Manage all courses" to="/faculty/courses" color="accent" delay="0.1s" />
        <ActionCard icon={<HiOutlineBriefcase />} title="Post Opportunity" desc="Internships & research" to="/opportunities" color="success" delay="0.15s" />
        <ActionCard icon={<HiOutlineChatAlt2 />} title="Messages" desc="Chat with students" to="/chat" color="info" delay="0.2s" />
        <ActionCard icon={<HiOutlineExclamationCircle />} title="Grievances" desc="Your filed grievances" to="/grievances" color="warning" delay="0.25s" />
      </div>
    </>
  );
};

/* ═══════ MANAGEMENT DASHBOARD ═══════ */
const ManagementDash = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, resolved: 0, payments: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [g, pay] = await Promise.allSettled([
          api.get('/management/grievances'),
          api.get('/management/payments'),
        ]);
        const gData = g.status === 'fulfilled' ? g.value.data.data : {};
        const grievances = gData.grievances || [];
        setStats({
          total: gData.total || 0,
          pending: grievances.filter(gr => gr.status === 'pending').length,
          inReview: grievances.filter(gr => gr.status === 'in-review').length,
          resolved: grievances.filter(gr => gr.status === 'resolved').length,
          payments: pay.status === 'fulfilled' ? (pay.value.data.data.total || 0) : 0,
        });
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <div className="quick-stats-row">
        <QuickStat icon={<HiOutlineClipboardList />} label="Total Grievances" value={loading ? '…' : stats.total} color="accent" to="/management/grievances" delay="0.05s" />
        <QuickStat icon={<HiOutlineClock />} label="Pending" value={loading ? '…' : stats.pending} color="warning" to="/management/grievances" delay="0.1s" />
        <QuickStat icon={<HiOutlineEye />} label="In Review" value={loading ? '…' : stats.inReview} color="info" to="/management/grievances" delay="0.15s" />
        <QuickStat icon={<HiOutlineCheckCircle />} label="Resolved" value={loading ? '…' : stats.resolved} color="success" to="/management/grievances" delay="0.2s" />
        <QuickStat icon={<HiOutlineCurrencyRupee />} label="Payments" value={loading ? '…' : stats.payments} color="purple" to="/management/fees" delay="0.25s" />
      </div>

      <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Management Console</h2>
      <div className="action-cards-grid">
        <ActionCard icon={<HiOutlineExclamationCircle />} title="Grievance Manager" desc="Review & resolve complaints" to="/management/grievances" color="warning" delay="0.1s" />
        <ActionCard icon={<HiOutlineCurrencyRupee />} title="Fee Management" desc="Create & track payments" to="/management/fees" color="success" delay="0.15s" />
        <ActionCard icon={<HiOutlineTruck />} title="Bus Management" desc="Upload schedules & routes" to="/management/bus" color="accent" delay="0.2s" />
        <ActionCard icon={<HiOutlineDocumentText />} title="Certificates" desc="Issue student certificates" to="/management/certificates" color="purple" delay="0.25s" />
        <ActionCard icon={<HiOutlineIdentification />} title="ID Cards" desc="Manage student ID cards" to="/management/idcards" color="info" delay="0.3s" />
        <ActionCard icon={<HiOutlineBriefcase />} title="Opportunities" desc="Post internships & research" to="/opportunities" color="success" delay="0.35s" />
        <ActionCard icon={<HiOutlineAcademicCap />} title="Course Management" desc="Approve & assign courses" to="/admin/course-approval" color="accent" delay="0.4s" />
      </div>
    </>
  );
};

/* ═══════ ADMIN DASHBOARD ═══════ */
const AdminDash = () => {
  const [stats, setStats] = useState({ users: 0, grievances: 0, courses: 0, opportunities: 0, pendingCourses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [u, g, c, o] = await Promise.allSettled([
          api.get('/admin/users'),
          api.get('/admin/grievances'),
          api.get('/courses'),
          api.get('/opportunities'),
        ]);
        const courseData = c.status === 'fulfilled' ? c.value.data.data : {};
        setStats({
          users: u.status === 'fulfilled' ? (u.value.data.data.total || 0) : 0,
          grievances: g.status === 'fulfilled' ? (g.value.data.data.total || 0) : 0,
          courses: courseData.total || 0,
          opportunities: o.status === 'fulfilled' ? (o.value.data.data.total || 0) : 0,
        });
      } catch { }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <>
      <div className="quick-stats-row">
        <QuickStat icon={<HiOutlineUsers />} label="Total Users" value={loading ? '…' : stats.users} color="accent" to="/admin/users" delay="0.05s" />
        <QuickStat icon={<HiOutlineExclamationCircle />} label="Grievances" value={loading ? '…' : stats.grievances} color="warning" to="/admin/grievances" delay="0.1s" />
        <QuickStat icon={<HiOutlineAcademicCap />} label="Courses" value={loading ? '…' : stats.courses} color="success" to="/courses" delay="0.15s" />
        <QuickStat icon={<HiOutlineBriefcase />} label="Opportunities" value={loading ? '…' : stats.opportunities} color="purple" to="/opportunities" delay="0.2s" />
      </div>

      <h2 className="section-title" style={{ marginTop: '0.5rem' }}>Admin Console</h2>
      <div className="action-cards-grid">
        <ActionCard icon={<HiOutlineUsers />} title="User Management" desc="View, search & manage users" to="/admin/users" color="accent" delay="0.1s" />
        <ActionCard icon={<HiOutlineExclamationCircle />} title="All Grievances" desc="Global grievance overview" to="/admin/grievances" color="warning" delay="0.15s" />
        <ActionCard icon={<HiOutlineAcademicCap />} title="Course Approval" desc="Approve & assign courses" to="/admin/course-approval" color="success" delay="0.2s" />
        <ActionCard icon={<HiOutlineBriefcase />} title="Opportunities" desc="Manage all opportunities" to="/opportunities" color="purple" delay="0.25s" />
        <ActionCard icon={<HiOutlineClipboardList />} title="All Courses" desc="Browse all platform courses" to="/courses" color="info" delay="0.3s" />
        <ActionCard icon={<HiOutlineChatAlt2 />} title="Messages" desc="Platform chat" to="/chat" color="pink" delay="0.35s" />
      </div>
    </>
  );
};



export default Dashboard;

