import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineExclamationCircle, HiOutlineChatAlt2,
  HiOutlineClock, HiOutlineCheckCircle, HiOutlineEye, HiOutlineFilter
} from 'react-icons/hi';

const GrievanceManager = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', category: '' });
  const [comment, setComment] = useState({});
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  const fetchGrievances = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.category) params.category = filter.category;
      const res = await api.get('/management/grievances', { params });
      setGrievances(res.data.data.grievances || []);
    } catch (err) { toast.error('Failed to load grievances'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGrievances(); }, [filter]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/management/grievances/${id}/status`, { status });
      toast.success(`Status updated to ${status}`);
      fetchGrievances();
    } catch (err) { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const handleComment = async (id) => {
    if (!comment[id]?.trim()) return;
    try {
      await api.post(`/management/grievances/${id}/comment`, { text: comment[id] });
      toast.success('Comment added');
      setComment({ ...comment, [id]: '' });
      fetchGrievances();
    } catch (err) { toast.error('Failed to add comment'); }
  };

  const statusIcon = (s) => {
    if (s === 'pending') return <HiOutlineClock style={{ color: 'var(--warning)' }} />;
    if (s === 'in-review') return <HiOutlineEye style={{ color: 'var(--info)' }} />;
    return <HiOutlineCheckCircle style={{ color: 'var(--success)' }} />;
  };

  const priorityColor = { low: 'var(--text-secondary)', medium: 'var(--warning)', high: 'var(--danger)' };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading grievances...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineExclamationCircle style={{ marginRight: '0.5rem' }} /> Grievance Manager</h1>
        <span className="badge badge-default">{grievances.length} items</span>
      </div>

      {/* Filters */}
      <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
        <HiOutlineFilter style={{ color: 'var(--text-muted)' }} />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="form-input" style={{ maxWidth: '180px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filter.category} onChange={e => setFilter({ ...filter, category: e.target.value })} className="form-input" style={{ maxWidth: '180px' }}>
          <option value="">All Categories</option>
          <option value="academic">Academic</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="hostel">Hostel</option>
          <option value="ragging">Ragging</option>
          <option value="sexual-harassment">Sexual Harassment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {grievances.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineExclamationCircle style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Grievances</h3>
          <p>No grievances matching the current filters.</p>
        </div>
      ) : (
        <div className="grievance-list">
          {grievances.map((g, i) => (
            <div key={g._id} className="grievance-card animate-scale-in" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="grievance-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {statusIcon(g.status)}
                  <div>
                    <h3 style={{ margin: 0 }}>{g.title}</h3>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      by {g.submittedBy?.name} • {new Date(g.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span className="badge">{g.category}</span>
                  <span className="badge" style={{ color: priorityColor[g.priority], borderColor: priorityColor[g.priority] }}>{g.priority}</span>
                  <span className={`badge badge-${g.status === 'pending' ? 'pending' : g.status === 'in-review' ? 'info' : 'success'}`}>{g.status}</span>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', margin: '0.75rem 0', fontSize: '0.9rem' }}>{g.description}</p>

              {/* Status update buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {g.status !== 'in-review' && (
                  <button onClick={() => handleStatusUpdate(g._id, 'in-review')} className="btn btn-sm btn-outline" disabled={updating === g._id}>
                    <HiOutlineEye /> Mark In Review
                  </button>
                )}
                {g.status !== 'resolved' && (
                  <button onClick={() => handleStatusUpdate(g._id, 'resolved')} className="btn btn-sm btn-primary" disabled={updating === g._id}>
                    <HiOutlineCheckCircle /> Resolve
                  </button>
                )}
              </div>

              {/* Comments */}
              {g.comments?.length > 0 && (
                <div className="grievance-comments">
                  {g.comments.map((c, ci) => (
                    <div key={ci} className="grievance-comment">
                      <strong>{c.author?.name || 'Staff'}</strong>
                      <p>{c.text}</p>
                      <span className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <input
                  value={comment[g._id] || ''}
                  onChange={e => setComment({ ...comment, [g._id]: e.target.value })}
                  className="form-input"
                  placeholder="Add a comment..."
                  style={{ flex: 1 }}
                />
                <button onClick={() => handleComment(g._id)} className="btn btn-sm btn-primary" disabled={!comment[g._id]?.trim()}>
                  <HiOutlineChatAlt2 /> Send
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrievanceManager;
