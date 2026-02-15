import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineChat, HiOutlineCheckCircle, HiPaperAirplane } from 'react-icons/hi';

const StudentDoubtForum = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', description: '', tags: '' });
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef(null);

  const fetchDoubts = async () => {
    try {
      const res = await api.get(`/student/courses/${courseId}/doubts`);
      setDoubts(res.data.data);
      // Auto-refresh selected doubt if it exists
      if (selectedDoubt) {
        const updated = res.data.data.find(d => d._id === selectedDoubt._id);
        if (updated) setSelectedDoubt(updated);
      }
    } catch (err) { toast.error('Failed to load discussions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDoubts(); }, [courseId]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedDoubt, selectedDoubt?.replies]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.title || !newForm.description) return;
    try {
      const tags = newForm.tags ? newForm.tags.split(',').map(t => t.trim()) : [];
      await api.post(`/student/courses/${courseId}/doubts`, { ...newForm, tags });
      toast.success('Discussion started');
      setShowNewForm(false);
      setNewForm({ title: '', description: '', tags: '' });
      fetchDoubts();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedDoubt) return;
    try {
      await api.post(`/student/doubts/${selectedDoubt._id}/reply`, { content: replyContent });
      setReplyContent('');
      fetchDoubts(); // Refresh to see new message
    } catch (err) { toast.error('Failed to send message'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading Forum...</p></div>;

  return (
    <div className="page-container" style={{ height: 'calc(100vh - 100px)', paddingBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <button onClick={() => navigate('/courses')} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>← Back to Course</button>

      <div className="glass-card" style={{ flex: 1, display: 'flex', overflow: 'hidden', margin: 0 }}>

        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Discussions</h2>
            <button onClick={() => setShowNewForm(true)} className="btn-icon" title="New Topic"><HiOutlinePlus /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {doubts.map(d => (
              <div
                key={d._id}
                onClick={() => { setSelectedDoubt(d); setShowNewForm(false); }}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  background: selectedDoubt?._id === d._id ? 'var(--bg-card)' : 'transparent',
                  border: selectedDoubt?._id === d._id ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: selectedDoubt?._id === d._id ? 'var(--shadow-sm)' : 'none',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.title}</h4>
                  {d.isResolved && <HiOutlineCheckCircle style={{ color: 'var(--success)', minWidth: '16px' }} />}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {d.description}
                </p>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{d.askedBy?.name?.split(' ')[0]}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
            {doubts.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No discussions yet. Start one!</div>}
          </div>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {showNewForm ? (
            <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto', width: '100%' }}>
              <h3>Start a New Discussion</h3>
              <form onSubmit={handleCreate} className="form-card mt-1">
                <div className="form-group"><label>Topic Title</label><input value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} autoFocus required /></div>
                <div className="form-group"><label>Initial Message</label><textarea value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} rows={5} required /></div>
                <div className="form-group"><label>Tags</label><input value={newForm.tags} onChange={e => setNewForm({ ...newForm, tags: e.target.value })} placeholder="e.g. general, homework" /></div>
                <div className="form-actions">
                  <button type="button" onClick={() => setShowNewForm(false)} className="btn btn-ghost">Cancel</button>
                  <button type="submit" className="btn btn-primary">Start Discussion</button>
                </div>
              </form>
            </div>
          ) : selectedDoubt ? (
            <>
              {/* Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{selectedDoubt.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {selectedDoubt.askedBy?.name}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {selectedDoubt.isResolved && <span className="badge badge-success">Resolved</span>}
                  {selectedDoubt.tags?.map(t => <span key={t} className="badge badge-default">{t}</span>)}
                </div>
              </div>

              {/* Chat Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Original Post */}
                <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '0 12px 12px 12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--accent)' }}>{selectedDoubt.askedBy?.name}</div>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{selectedDoubt.description}</p>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', marginLeft: '4px' }}>
                    {new Date(selectedDoubt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Replies */}
                {selectedDoubt.replies?.map((r, i) => {
                  const isMe = r.author?._id === user.id;
                  const isFaculty = r.author?.role === 'faculty';
                  return (
                    <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{
                        background: isMe ? 'var(--accent)' : isFaculty ? 'rgba(139, 92, 246, 0.1)' : 'var(--bg-card)',
                        color: isMe ? 'white' : 'var(--text-primary)',
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                        border: isMe ? 'none' : isFaculty ? '1px solid var(--purple)' : '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {!isMe && <div style={{ fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.2rem', color: isFaculty ? 'var(--purple)' : 'var(--text-secondary)' }}>
                          {r.author?.name} {isFaculty && '(Faculty)'}
                        </div>}
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{r.content}</p>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', textAlign: isMe ? 'right' : 'left', marginRight: isMe ? '4px' : 0, marginLeft: isMe ? 0 : '4px' }}>
                        {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', background: 'var(--bg-card)' }}>
                <form onSubmit={handleReply} style={{ display: 'flex', gap: '0.75rem' }}>
                  <input
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '99px', border: '1px solid var(--border)', outline: 'none', background: 'var(--bg-input)' }}
                  />
                  <button type="submit" disabled={!replyContent.trim()} className="btn btn-primary" style={{ borderRadius: '50%', width: '46px', height: '46px', padding: 0 }}>
                    <HiPaperAirplane style={{ transform: 'rotate(90deg)', marginLeft: '-2px' }} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-muted)' }}>
              <HiOutlineChat style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
              <p>Select a discussion to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDoubtForum;
