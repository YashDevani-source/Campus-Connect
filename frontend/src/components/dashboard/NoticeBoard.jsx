import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HiOutlineBell, HiPlus, HiX, HiTrash, HiOutlineExclamation, HiCheckCircle,
  HiOutlineExclamationCircle, HiOutlineDocumentText, HiOutlineClipboardList,
  HiOutlinePaperAirplane, HiOutlineSpeakerphone, HiChevronUp, HiChevronDown
} from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const NoticeBoard = ({ user }) => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // State for read status
  const [lastReadTime, setLastReadTime] = useState(() => {
    return localStorage.getItem(`notice_read_${user?._id || user?.id}`) || 0;
  });

  // Authorization check
  const userRole = user?.role;
  const canPost = ['faculty', 'managementMember', 'admin'].includes(userRole);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal'
  });
  const [posting, setPosting] = useState(false);

  // Fetch notices on mount and poll
  useEffect(() => {
    fetchNotices();
    const interval = setInterval(fetchNotices, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notices');
      const noticesData = res.data.data || [];

      // Sort by priority (urgent first) then date
      const sorted = noticesData.sort((a, b) => {
        const priorityOrder = { urgent: 3, important: 2, normal: 1 };
        if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotices(sorted);
    } catch (err) {
      console.error(err);
      // toast.error('Failed to load notices'); 
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = () => {
    setIsCollapsed(!isCollapsed);
    if (isCollapsed) { // If opening (was collapsed)
      const now = Date.now();
      setLastReadTime(now);
      localStorage.setItem(`notice_read_${user?._id || user?.id}`, now);
    }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error('Please fill in all fields');
    }

    setPosting(true);
    try {
      const res = await api.post('/notices', formData);
      const newNotice = res.data.data;

      setNotices([newNotice, ...notices]);
      toast.success('Notice posted successfully!');
      setShowAddModal(false);
      setFormData({ title: '', content: '', priority: 'normal' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to post notice');
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(notices.filter(n => n._id !== id));
      toast.success('Notice deleted');
      setSelectedNotice(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to delete notice');
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent': return <span className="badge-urgent"><HiOutlineExclamation /> Urgent</span>;
      case 'important': return <span className="badge-important"><HiOutlineExclamation /> Important</span>;
      default: return <span className="badge-normal"><HiCheckCircle /> General</span>;
    }
  };

  const formatAuthor = (author) => {
    if (!author) return 'System';
    if (author.role === 'admin') return 'Admin';

    let label = author.name;
    if (author.department) {
      label += ` (${author.department})`;
    } else if (author.role) {
      // Fallback to role if no department, but capitalize it
      const roleName = author.role === 'managementMember' ? 'Management' : author.role.charAt(0).toUpperCase() + author.role.slice(1);
      label += ` (${roleName})`;
    }
    return label;
  };

  const checkDeletePermission = (notice) => {
    if (!user || !notice) return false;
    if (user.role === 'admin') return true;

    const currentUserId = String(user._id || user.id);
    const authorId = notice.author?._id ? String(notice.author._id) : String(notice.author);

    return currentUserId === authorId;
  };

  const isNew = (date) => {
    // Only highlight if created after last read time and less than 24 hours old
    const noticeDate = new Date(date).getTime();
    if (noticeDate < lastReadTime) return false;

    const now = new Date();
    const diff = now - noticeDate;
    return diff < 24 * 60 * 60 * 1000; // 24 hours
  };

  const hasNewNotices = notices.some(n => isNew(n.createdAt));

  return (
    <div className="notice-board-container" style={{ transition: 'all 0.3s ease' }}>
      <div className="notice-board-header">
        <div className="header-title" onClick={handleExpand} style={{ cursor: 'pointer' }}>
          <div className={`icon-box ${hasNewNotices ? 'has-notification' : ''}`}>
            <HiOutlineBell />
          </div>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Campus Notices
              {isCollapsed && <span style={{ fontSize: '0.75em', opacity: 0.6, fontWeight: 'normal' }}>({notices.length})</span>}
            </h3>
            <p>Stay updated with latest announcements</p>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          {canPost && !isCollapsed && (
            <button className="btn-primary-add" onClick={() => setShowAddModal(true)}>
              <HiPlus /> Post New Notice
            </button>
          )}

          <button
            className="btn-toggle"
            onClick={handleExpand}
            title={isCollapsed ? "Expand" : "Minimize"}
            style={{
              background: 'var(--bg-secondary)',
              border: 'none',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            {isCollapsed ? <HiChevronDown /> : <HiChevronUp />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="notice-grid animate-fade-in">
          {loading ? (
            <div className="loading-state">Loading updates...</div>
          ) : notices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No notices at the moment.</p>
            </div>
          ) : (
            notices.map(notice => (
              <div
                key={notice._id}
                className={`notice-card ${notice.priority}`}
                onClick={() => setSelectedNotice(notice)}
              >
                {isNew(notice.createdAt) && (
                  <span className="notice-new-badge">New</span>
                )}
                <div className="card-top">
                  {getPriorityBadge(notice.priority)}
                  <span className="card-date">
                    {new Date(notice.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="card-title">{notice.title}</h4>
                <p className="card-preview">
                  {notice.content.length > 80 ? notice.content.substring(0, 80) + '...' : notice.content}
                </p>
                <div className="card-footer">
                  <span className="author-name">by {formatAuthor(notice.author)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Notice Modal */}
      {showAddModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header">
              <h3>Post New Notice</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}><HiX /></button>
            </div>
            <form onSubmit={handlePost}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Exam Schedule Released"
                  maxLength={100}
                />
              </div>

              <div className="form-group">
                <label>Priority Level</label>
                <div className="priority-select">
                  {['normal', 'important', 'urgent'].map(p => (
                    <button
                      type="button"
                      key={p}
                      className={`priority-option ${formData.priority === p ? 'active' : ''} ${p}`}
                      onClick={() => setFormData({ ...formData, priority: p })}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write the details here..."
                  rows={5}
                />
                <div className="char-count">{formData.content.length}/1000</div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit" disabled={posting}>
                  {posting ? 'Posting...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* View Notice Modal */}
      {selectedNotice && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedNotice(null)}>
          <div className="modal-content view-mode animate-pop" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="view-meta">
                {getPriorityBadge(selectedNotice.priority)}
                <span className="view-date">
                  {new Date(selectedNotice.createdAt).toLocaleDateString('en-IN', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </span>
              </div>
              <button className="btn-close" onClick={() => setSelectedNotice(null)}><HiX /></button>
            </div>

            <div className="view-body">
              <h2 className="view-title">{selectedNotice.title}</h2>
              <div className="view-author">
                Posted by <strong>{formatAuthor(selectedNotice.author)}</strong>
              </div>
              <div className="view-content">
                {selectedNotice.content}
              </div>
            </div>

            {checkDeletePermission(selectedNotice) && (
              <div className="view-footer">
                <button className="btn-delete" onClick={() => handleDelete(selectedNotice._id)}>
                  <HiTrash /> Delete Notice
                </button>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default NoticeBoard;
