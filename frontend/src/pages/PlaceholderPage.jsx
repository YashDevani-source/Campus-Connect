import { useNavigate } from 'react-router-dom';
import { HiOutlineArrowLeft, HiOutlineExclamationCircle } from 'react-icons/hi';

const PlaceholderPage = ({ title }) => {
  const navigate = useNavigate();

  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost btn-back" style={{ alignSelf: 'flex-start' }}>
        <HiOutlineArrowLeft /> Back
      </button>
      <div className="empty-state">
        <HiOutlineExclamationCircle style={{ fontSize: '4rem', color: 'var(--accent)', marginBottom: '1rem' }} />
        <h1>{title}</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '500px', margin: '1rem auto' }}>
          This module is currently under development. Stay tuned for updates!
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">Return to Dashboard</button>
      </div>
    </div>
  );
};

export default PlaceholderPage;
