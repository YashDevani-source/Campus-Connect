import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineChat, HiOutlineCheckCircle, HiPaperAirplane, HiCheck } from 'react-icons/hi';

const FacultyDoubtForum = () => {
  const { courseId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const messagesEndRef = useRef(null);

  const fetchDoubts = async () => {
    try {
      const res = await api.get(`/faculty/courses/${courseId}/doubts`);
      setDoubts(res.data.data);
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

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedDoubt) return;
    try {
      await api.post(`/faculty/courses/${courseId}/doubts/${selectedDoubt._id}/reply`, { content: replyContent });
      setReplyContent('');
      fetchDoubts();
    } catch (err) { toast.error('Failed to send message'); }
  };

  const handleResolve = async () => {
    if (!selectedDoubt) return;
    try {
      await api.patch(`/faculty/courses/${courseId}/doubts/${selectedDoubt._id}/resolve`);
      toast.success('Marked as resolved');
      fetchDoubts();
    } catch (err) { toast.error('Failed to resolve'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading Forum...</p></div>;

  return (
    <div className="page-container" style={{ height: 'calc(100vh - 100px)', paddingBottom: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <button onClick={() => navigate('/faculty/courses')} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start', marginBottom: '0.5rem' }}>← Back to My Courses</button>

      <div className="glass-card" style={{ flex: 1, display: 'flex', overflow: 'hidden', margin: 0 }}>

        {/* Sidebar */}
        <div style={{ width: '300px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Discussions</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {doubts.map(d => (
              <div
                key={d._id}
                onClick={() => setSelectedDoubt(d)}
                style={{
                  padding: '0.75rem',
                  borderRadius: 'var(--radius)',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  background: selectedDoubt?._id === d._id ? 'var(--bg-card)' : 'transparent',
                  border: selectedDoubt?._id === d._id ? '1px solid var(--border)' : '1px solid transparent',
                  boxShadow: selectedDoubt?._id === d._id ? 'var(--shadow-sm)' : 'none',
                  opacity: d.isResolved ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{d.title}</h4>
                  {d.isResolved && <HiOutlineCheckCircle style={{ color: 'var(--success)', minWidth: '16px' }} />}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{d.askedBy?.name?.split(' ')[0]}</span>
                  <span>{new Date(d.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
            {doubts.length === 0 && <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No discussions yet</div>}
          </div>
        </div>

        {/* Main Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
          {selectedDoubt ? (
            <>
              {/* Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 10 }}>
                <div>
                  <h2 style={{ fontSize: '1.1rem', margin: 0 }}>{selectedDoubt.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>by {selectedDoubt.askedBy?.name} ({selectedDoubt.askedBy?.rollNumber})</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {!selectedDoubt.isResolved ? (
                    <button onClick={handleResolve} className="btn btn-sm btn-outline btn-success" style={{ gap: '0.25rem' }}>
                      <HiCheck /> Resolve
                    </button>
                  ) : (
                    <span className="badge badge-success">Resolved</span>
                  )}
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
                  // Assuming faculty role is checked via user or r.author.role
                  // In this faculty view, user.role is 'faculty'
                  // But let's check the role on the message
                  const isFaculty = r.author?.role === 'faculty';

                  return (
                    <div key={i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                      <div style={{
                        background: isMe ? 'var(--purple)' : 'var(--bg-card)',
                        color: isMe ? 'white' : 'var(--text-primary)',
                        padding: '0.75rem 1rem',
                        borderRadius: isMe ? '12px 0 12px 12px' : '0 12px 12px 12px',
                        border: isMe ? 'none' : '1px solid var(--border)',
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
                    placeholder="Reply to this discussion..."
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
              <p>Select a discussion to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyDoubtForum;
