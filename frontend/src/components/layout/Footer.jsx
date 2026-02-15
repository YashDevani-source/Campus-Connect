import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineShieldCheck } from 'react-icons/hi';
import { FaTwitter, FaLinkedin, FaInstagram, FaGithub } from 'react-icons/fa';
import logo from '../../assets/iitmandi-logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
      padding: '3rem 2rem 1.5rem',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Brand Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div className="glass" style={{ width: '80px', height: '80px', borderRadius: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={logo} alt="IIT Mandi" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: '800', fontSize: '1.25rem', lineHeight: '1', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>IIT MANDI</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>campus connect</span>
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '250px', lineHeight: '1.6' }}>
              Empowering students and faculty with a unified academic management system. Safe, fast, and reliable.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Dashboard</Link></li>
              <li><Link to="/courses" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Academics</Link></li>
              <li><Link to="/grievances" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Grievances</Link></li>
              <li><Link to="/opportunities" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Internships</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Support</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><Link to="/doubts" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Help Center</Link></li>
              <li><Link to="/contact" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Contact Admin</Link></li>
              <li><Link to="/privacy" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Privacy Policy</Link></li>
              <li><Link to="/terms" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Terms of Service</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 style={{ fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)' }}>Connect</h4>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <SocialIcon href="https://x.com/YashDevani2106" icon={<FaTwitter />} color="#1DA1F2" />
              <SocialIcon href="https://www.linkedin.com/in/yash-devani-744297324/" icon={<FaLinkedin />} color="#0A66C2" />
              <SocialIcon href="#" icon={<FaInstagram />} color="#E1306C" />
              <SocialIcon href="https://github.com/YashDevani-source/Campus-Connect" icon={<FaGithub />} color="#333" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{ 
          borderTop: '1px solid var(--border)', 
          paddingTop: '1.5rem', 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)'
        }}>
          <p>© {currentYear} IIT MANDI Campus Connect. All rights reserved.</p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'var(--bg-secondary)',
            padding: '0.5rem 1rem',
            borderRadius: '2rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-primary)' }}>Made with</span>
            <HiOutlineHeart style={{ color: 'var(--danger)', fontSize: '1.2rem', animation: 'pulse 1.5s infinite' }} />
            <span style={{ 
              fontWeight: '900', 
              fontSize: '1rem',
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>IIT Mandi</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon = ({ href, icon, color }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px',
    borderRadius: '50%',
    background: 'var(--bg-secondary)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    transition: 'all 0.2s ease',
    fontSize: '1rem'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.color = color;
    e.currentTarget.style.borderColor = color;
    e.currentTarget.style.background = 'var(--bg-card)';
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.color = 'var(--text-secondary)';
    e.currentTarget.style.borderColor = 'var(--border)';
    e.currentTarget.style.background = 'var(--bg-secondary)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}
  >
    {icon}
  </a>
);

export default Footer;
