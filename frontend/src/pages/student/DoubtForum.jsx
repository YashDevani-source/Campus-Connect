import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const StudentDoubtForum = () => {
  const { courseId } = useParams();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null);

  const fetchDoubts = async () => {
    try { const res = await api.get(`/student/courses/${courseId}/doubts`); setDoubts(res.data.data); }
    catch (err) { toast.error('Failed to load doubts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoubts(); }, [courseId]);

  const handleAsk = async (e) => {
    e.preventDefault();
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()) : [];
      await api.post(`/student/courses/${courseId}/doubts`, { ...form, tags });
      toast.success('Doubt posted');
      setShowForm(false);
      setForm({ title: '', description: '', tags: '' });
      fetchDoubts();
    } catch (err) { toast.error('Failed to post doubt'); }
  };

  const handleReply = async (doubtId) => {
    if (!replyText[doubtId]?.trim()) return;
    try {
      await api.post(`/student/doubts/${doubtId}/reply`, { content: replyText[doubtId] });
      toast.success('Reply posted');
      setReplyText({ ...replyText, [doubtId]: '' });
      setReplyingTo(null);
      fetchDoubts();
    } catch (err) { toast.error('Failed to reply'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Doubt Forum</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">{showForm ? 'Cancel' : 'Ask a Doubt'}</button>
      </div>
      {showForm && (
        <form onSubmit={handleAsk} className="card form-card mb-1">
          <div className="form-group"><label className="form-label">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" required /></div>
          <div className="form-group"><label className="form-label">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-input" rows={4} required /></div>
          <div className="form-group"><label className="form-label">Tags (comma separated)</label><input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="form-input" placeholder="algebra, matrices" /></div>
          <button type="submit" className="btn btn-primary">Post Doubt</button>
        </form>
      )}
      {doubts.length === 0 ? <div className="empty-state"><p>No doubts yet. Be the first to ask!</p></div> : (
        <div className="doubts-list">
          {doubts.map(d => (
            <div key={d._id} className={`card ${d.isResolved ? 'card-resolved' : ''}`}>
              <div className="card-header">
                <h3>{d.title}</h3>
                <span className={`badge ${d.isResolved ? 'badge-resolved' : 'badge-pending'}`}>{d.isResolved ? 'Resolved' : 'Open'}</span>
              </div>
              <div className="card-body"><p>{d.description}</p>
                {d.tags?.length > 0 && <div className="tags-container">{d.tags.map((t, i) => <span key={i} className="tag">{t}</span>)}</div>}
                <span className="text-muted">by {d.askedBy?.name} • {new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              {d.replies?.length > 0 && (
                <div className="replies-section">
                  {d.replies.map((r, i) => (
                    <div key={i} className="reply"><strong>{r.author?.name} ({r.author?.role})</strong><p>{r.content}</p></div>
                  ))}
                </div>
              )}
              <div className="card-actions">
                <button onClick={() => setReplyingTo(replyingTo === d._id ? null : d._id)} className="btn btn-sm btn-outline">Reply</button>
              </div>
              {replyingTo === d._id && (
                <div className="reply-form">
                  <textarea value={replyText[d._id] || ''} onChange={e => setReplyText({ ...replyText, [d._id]: e.target.value })} className="form-input" rows={3} placeholder="Your reply..." />
                  <button onClick={() => handleReply(d._id)} className="btn btn-primary btn-sm mt-05">Post</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDoubtForum;
