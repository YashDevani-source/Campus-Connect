import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineClock, HiOutlineChatAlt } from 'react-icons/hi';

const GrievanceDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => { fetchGrievance(); }, [id]);

  const fetchGrievance = async () => {
    try {
      const res = await api.get(`/grievances/${id}`);
      setGrievance(res.data.data);
      setNewStatus(res.data.data.status);
    } catch { navigate('/grievances'); }
    finally { setLoading(false); }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/grievances/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      fetchGrievance();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await api.post(`/grievances/${id}/comments`, { text: comment });
      setComment('');
      toast.success('Comment added');
      fetchGrievance();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!grievance) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/grievances')} className="btn btn-ghost btn-back">
        <HiOutlineArrowLeft /> Back to Grievances
      </button>
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{grievance.title}</h1>
            <div className="detail-meta">
              <span>{grievance.category}</span>
              <span>•</span>
              <span>Filed by {grievance.submittedBy?.name}</span>
              <span>•</span>
              <span>{new Date(grievance.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="detail-badges">
            <StatusBadge status={grievance.priority} />
            <StatusBadge status={grievance.status} />
          </div>
        </div>
        <div className="detail-body">
          <p>{grievance.description}</p>
        </div>

        {/* Status Update — Authority/Admin only */}
        {(user.role === 'authority' || user.role === 'admin') && (
          <div className="action-panel">
            <h3>Update Status</h3>
            <div className="inline-form">
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
              </select>
              <button onClick={handleStatusUpdate} className="btn btn-primary" disabled={newStatus === grievance.status}>
                Update
              </button>
            </div>
          </div>
        )}

        {/* Status History */}
        {grievance.statusHistory?.length > 0 && (
          <div className="timeline-section">
            <h3><HiOutlineClock /> Status History</h3>
            <div className="timeline">
              {grievance.statusHistory.map((h, i) => (
                <div key={i} className="timeline-item">
                  <StatusBadge status={h.status} />
                  <span className="text-muted">{new Date(h.changedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="comments-section">
          <h3><HiOutlineChatAlt /> Comments ({grievance.comments?.length || 0})</h3>
          {grievance.comments?.map((c, i) => (
            <div key={i} className="comment-card">
              <div className="comment-header">
                <strong>{c.author?.name || 'User'}</strong>
                <span className={`role-badge role-${c.author?.role}`}>{c.author?.role}</span>
                <span className="text-muted">{new Date(c.createdAt).toLocaleString()}</span>
              </div>
              <p>{c.text}</p>
            </div>
          ))}
          <form onSubmit={handleComment} className="comment-form">
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment..." rows={3} />
            <button type="submit" className="btn btn-primary" disabled={!comment.trim()}>Post Comment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GrievanceDetail;
