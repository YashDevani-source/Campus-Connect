import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import StatusBadge from '../../components/common/StatusBadge';
import {
  HiOutlineDocumentText, HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlinePlus,
  HiOutlineExclamationCircle, HiOutlineUsers, HiOutlineClipboardList,
  HiOutlineChatAlt2, HiOutlineTruck, HiOutlineCurrencyRupee, HiOutlineQuestionMarkCircle
} from 'react-icons/hi';

const Dashboard = () => {
  const { user } = useAuth();

  // Render role-specific dashboard
  const dashboards = {
    student: <StudentDash />, faculty: <FacultyDash />,
    authority: <AuthorityDash />, admin: <AdminDash />,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Welcome, {user.name}!</h1>
        <p className="subtitle">Your {user.role} dashboard</p>
      </div>
      {dashboards[user.role] || <StudentDash />}
    </div>
  );
};

const StatCard = ({ icon, label, value, color, to }) => (
  <Link to={to || '#'} className={`stat-card stat-${color}`}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <h3>{value}</h3>
      <p>{label}</p>
    </div>
  </Link>
);

const DashboardCard = ({ icon, title, desc, to, color, delay }) => (
  <Link to={to} className="grid-card glass-card" style={{ 
    padding: '2rem', 
    alignItems: 'center', 
    textAlign: 'center', 
    gap: '1rem',
    animation: `scaleIn 0.5s ease-out forwards`,
    animationDelay: delay || '0s',
    opacity: 0, // initially hidden for animation
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '4px',
      background: `var(--${color})`, opacity: 0.8
    }} />
    <div className={`stat-icon`} style={{ 
      color: `var(--${color})`, 
      fontSize: '3rem', 
      marginBottom: '0.5rem',
      filter: `drop-shadow(0 4px 10px var(--${color}))`
    }}>{icon}</div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
    <p className="text-muted" style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>{desc}</p>
    <div style={{ 
      marginTop: '0.5rem', fontSize: '0.8rem', fontWeight: '600', color: `var(--${color})`,
      display: 'flex', alignItems: 'center', gap: '0.25rem'
    }}>
      Explore &rarr;
    </div>
  </Link>
);

const StudentDash = () => {
  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
        <DashboardCard 
          icon={<HiOutlineExclamationCircle />} 
          title="Grievances" 
          desc="Track & file complaints" 
          to="/grievances" 
          color="orange"
          delay="0.1s"
        />
        <DashboardCard 
          icon={<HiOutlineAcademicCap />} 
          title="Academics" 
          desc="All your study material" 
          to="/courses" 
          color="blue" 
          delay="0.15s"
        />
        <DashboardCard 
          icon={<HiOutlineBriefcase />} 
          title="Opportunities" 
          desc="Internships & jobs" 
          to="/opportunities" 
          color="green" 
          delay="0.2s"
        />
        <DashboardCard 
          icon={<HiOutlineUsers />} 
          title="Community" 
          desc="Clubs & events" 
          to="/clubs" 
          color="purple" 
          delay="0.25s"
        />
        <DashboardCard 
          icon={<HiOutlineQuestionMarkCircle />} 
          title="Doubts Forum" 
          desc="Expert solutions" 
          to="/doubts" 
          color="info" 
          delay="0.3s"
        />
        <DashboardCard 
          icon={<HiOutlineChatAlt2 />} 
          title="Class Chats" 
          desc="Connect with peers" 
          to="/chats" 
          color="accent" 
          delay="0.35s"
        />
        <DashboardCard 
          icon={<HiOutlineTruck />} 
          title="Transport" 
          desc="Bus schedules" 
          to="/transport" 
          color="warning" 
          delay="0.4s"
        />
        <DashboardCard 
          icon={<HiOutlineCurrencyRupee />} 
          title="Payments" 
          desc="Manage fees" 
          to="/fees" 
          color="success" 
          delay="0.45s"
        />
      </div>
    </>
  );
};

const FacultyDash = () => {
  const [stats, setStats] = useState({ courses: 0, opportunities: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [c, o] = await Promise.all([api.get('/courses'), api.get('/opportunities')]);
        setStats({ courses: c.data.data.total, opportunities: o.data.data.total });
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="stats-grid">
      <StatCard icon={<HiOutlineAcademicCap />} label="My Courses" value={stats.courses} color="blue" to="/courses" />
      <StatCard icon={<HiOutlineBriefcase />} label="Posted Opportunities" value={stats.opportunities} color="green" to="/opportunities" />
      <StatCard icon={<HiOutlineDocumentText />} label="Upload Material" value="+" color="purple" to="/courses" />
    </div>
  );
};

const AuthorityDash = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, inReview: 0, resolved: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [all, p, ir, r] = await Promise.all([
          api.get('/grievances'), api.get('/grievances?status=pending'),
          api.get('/grievances?status=in-review'), api.get('/grievances?status=resolved'),
        ]);
        setStats({ total: all.data.data.total, pending: p.data.data.total, inReview: ir.data.data.total, resolved: r.data.data.total });
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="stats-grid">
      <StatCard icon={<HiOutlineClipboardList />} label="Total Grievances" value={stats.total} color="blue" to="/grievances" />
      <StatCard icon={<HiOutlineExclamationCircle />} label="Pending" value={stats.pending} color="orange" to="/grievances?status=pending" />
      <StatCard icon={<HiOutlineDocumentText />} label="In Review" value={stats.inReview} color="purple" to="/grievances?status=in-review" />
      <StatCard icon={<HiOutlineExclamationCircle />} label="Resolved" value={stats.resolved} color="green" to="/grievances?status=resolved" />
    </div>
  );
};

const AdminDash = () => {
  const [stats, setStats] = useState({ users: 0, grievances: 0, courses: 0, opportunities: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const [u, g, c, o] = await Promise.all([
          api.get('/auth/users'), api.get('/grievances'),
          api.get('/courses'), api.get('/opportunities'),
        ]);
        setStats({
          users: u.data.data.total, grievances: g.data.data.total,
          courses: c.data.data.total, opportunities: o.data.data.total,
        });
      } catch {}
    };
    load();
  }, []);

  return (
    <div className="stats-grid">
      <StatCard icon={<HiOutlineUsers />} label="Total Users" value={stats.users} color="blue" />
      <StatCard icon={<HiOutlineExclamationCircle />} label="Grievances" value={stats.grievances} color="orange" to="/grievances" />
      <StatCard icon={<HiOutlineAcademicCap />} label="Courses" value={stats.courses} color="green" to="/courses" />
      <StatCard icon={<HiOutlineBriefcase />} label="Opportunities" value={stats.opportunities} color="purple" to="/opportunities" />
    </div>
  );
};

export default Dashboard;
