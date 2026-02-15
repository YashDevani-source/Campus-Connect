import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const FacultyDoubtForum = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchDoubts = async () => {
    try {
      const res = await api.get(`/faculty/courses/${courseId}/doubts`);
      setDoubts(res.data.data);
    } catch (err) { toast.error('Failed to load doubts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoubts(); }, [courseId]);

  const handleReply = async (doubtId) => {
    if (!replyText[doubtId]?.trim()) return;
    try {
      await api.post(`/faculty/courses/${courseId}/doubts/${doubtId}/reply`, { content: replyText[doubtId] });
      toast.success('Reply posted');
      setReplyText({ ...replyText, [doubtId]: '' });
      setReplyingTo(null);
      fetchDoubts();
    } catch (err) { toast.error('Failed to reply'); }
  };

  const handleResolve = async (doubtId) => {
    try {
      await api.patch(`/faculty/courses/${courseId}/doubts/${doubtId}/resolve`);
      toast.success('Marked as resolved');
      fetchDoubts();
    } catch (err) { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/faculty/courses')} className="btn btn-outline btn-sm mb-1">← Back</button>
      <div className="page-header"><h1>Doubt Forum</h1></div>
      {doubts.length === 0 ? <div className="empty-state"><p>No doubts posted yet</p></div> : (
        <div className="doubts-list">
          {doubts.map(d => (
            <div key={d._id} className={`card ${d.isResolved ? 'card-resolved' : ''}`}>
              <div className="card-header">
                <h3>{d.title}</h3>
                <div className="card-meta">
                  <span className={`badge ${d.isResolved ? 'badge-resolved' : 'badge-pending'}`}>{d.isResolved ? 'Resolved' : 'Open'}</span>
                  <span className="text-muted">by {d.askedBy?.name} • {new Date(d.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="card-body"><p>{d.description}</p></div>
              {d.replies?.length > 0 && (
                <div className="replies-section">
                  {d.replies.map((r, i) => (
                    <div key={i} className="reply"><strong>{r.author?.name} ({r.author?.role})</strong><p>{r.content}</p><span className="text-muted">{new Date(r.createdAt).toLocaleDateString()}</span></div>
                  ))}
                </div>
              )}
              <div className="card-actions">
                {!d.isResolved && <button onClick={() => handleResolve(d._id)} className="btn btn-sm btn-primary">Mark Resolved</button>}
                <button onClick={() => setReplyingTo(replyingTo === d._id ? null : d._id)} className="btn btn-sm btn-outline">Reply</button>
              </div>
              {replyingTo === d._id && (
                <div className="reply-form">
                  <textarea value={replyText[d._id] || ''} onChange={e => setReplyText({ ...replyText, [d._id]: e.target.value })} className="form-input" placeholder="Write your reply..." rows={3} />
                  <button onClick={() => handleReply(d._id)} className="btn btn-primary btn-sm mt-05">Post Reply</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyDoubtForum;
