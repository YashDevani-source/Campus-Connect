import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlineExternalLink, HiOutlineCalendar, HiOutlineUser } from 'react-icons/hi';

const CertificatesPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/certificates');
        setCertificates(res.data.data);
      } catch (err) { toast.error('Failed to load certificates'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading certificates...</p></div>;

  const typeColors = {
    course: 'var(--accent)', internship: 'var(--success)',
    achievement: 'var(--warning)', other: 'var(--text-secondary)'
  };

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineDocumentText style={{ marginRight: '0.5rem' }} /> My Certificates</h1>
        <span className="badge badge-default">{certificates.length} total</span>
      </div>

      {certificates.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Certificates</h3>
          <p>Certificates issued to you will appear here.</p>
        </div>
      ) : (
        <div className="certs-grid">
          {certificates.map((cert, idx) => (
            <div key={cert._id} className="cert-card animate-scale-in" style={{ animationDelay: `${idx * 0.08}s` }}>
              <div className="cert-card-accent" style={{ background: typeColors[cert.type] || 'var(--accent)' }} />
              <div className="cert-card-icon" style={{ color: typeColors[cert.type] || 'var(--accent)' }}>
                <HiOutlineDocumentText />
              </div>
              <h3 className="cert-title">{cert.title}</h3>
              <span className="badge" style={{ background: `${typeColors[cert.type]}15`, color: typeColors[cert.type], margin: '0.5rem 0' }}>
                {cert.type}
              </span>
              <div className="cert-details">
                <span><HiOutlineUser /> {cert.issuer}</span>
                <span><HiOutlineCalendar /> {new Date(cert.issueDate).toLocaleDateString()}</span>
                {cert.addedBy && <span className="text-muted">Added by: {cert.addedBy.name}</span>}
              </div>
              {cert.fileUrl && (
                <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline" style={{ marginTop: 'auto' }}>
                  <HiOutlineExternalLink /> View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CertificatesPage;
