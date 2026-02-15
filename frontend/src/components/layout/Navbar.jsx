import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineShieldCheck, HiOutlineLogout, HiOutlineUser, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';
import logo from '../../assets/iitmandi-logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard" className="logo-link" style={{ gap: '0.75rem' }}>

          <div style={{ width: '70px', height: '70px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={logo} alt="IIT Mandi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
            <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>IIT MANDI</span>
            <span className="logo-sub" style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>campus connect</span>
          </div>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
        {(user.role === 'student' || user.role === 'faculty' || user.role === 'managementMember' || user.role === 'admin') && (
          <Link to="/grievances" className={location.pathname.startsWith('/grievances') ? 'active' : ''}>Grievances</Link>
        )}
        <Link to="/courses" className={location.pathname.startsWith('/courses') ? 'active' : ''}>Academics</Link>
        <Link to="/opportunities" className={location.pathname.startsWith('/opportunities') ? 'active' : ''}>Opportunities</Link>
      </div>
      <div className="navbar-user">
        <button onClick={toggleTheme} className="btn-icon" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
          {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun />}
        </button>
        <Link to="/profile" className="user-info" style={{ textDecoration: 'none', cursor: 'pointer' }}>
          <HiOutlineUser />
          <span>{user.name}</span>
          <span className={`role-badge role-${user.role}`}>{user.role}</span>
        </Link>
        <button onClick={handleLogout} className="btn-icon" title="Logout">
          <HiOutlineLogout />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
