import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineUsers, HiOutlineClipboardList, HiOutlineChartBar, HiOutlineQuestionMarkCircle, HiOutlinePlus } from 'react-icons/hi';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/faculty/courses');
        setCourses(res.data.data);
      } catch (err) { toast.error('Failed to load courses'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading courses...</p></div>;

  const colors = ['var(--accent)', 'var(--success)', 'var(--warning)', 'var(--danger)', 'var(--purple)', 'var(--info)'];

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate('/dashboard')} className="back-btn"><HiOutlineArrowLeft /> Dashboard</button>

      <div className="page-header">
        <h1><HiOutlineAcademicCap style={{ marginRight: '0.5rem' }} /> My Courses</h1>
        <span className="badge badge-default">{courses.length} courses</span>
      </div>

      {courses.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineAcademicCap style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Courses</h3>
          <p>You don't have any approved courses yet.</p>
        </div>
      ) : (
        <div className="action-cards-grid">
          {courses.map((c, i) => (
            <div key={c._id} className="course-card animate-scale-in" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="course-card-accent" style={{ background: colors[i % colors.length] }} />
              <div className="course-card-head">
                <h3>{c.title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge" style={{ background: `${colors[i % colors.length]}20`, color: colors[i % colors.length] }}>{c.code}</span>
                  {c.status === 'pending' && <span className="badge badge-warning">Pending</span>}
                  {c.status === 'rejected' && <span className="badge badge-danger">Rejected</span>}
                  {c.status === 'approved' && <span className="badge badge-success">Active</span>}
                </div>
              </div>
              <div className="course-card-details">
                <span><HiOutlineUsers /> {c.enrolledStudents?.length || 0} students</span>
                <span>Credits: {c.credits}</span>
                <span>Req. Attendance: {c.requiredAttendance}%</span>
                {c.department && <span>Dept: {c.department}</span>}
              </div>
              <div className="course-card-actions">
                <button onClick={() => navigate(`/faculty/attendance/${c._id}`)} className="btn btn-sm btn-outline">
                  <HiOutlineClipboardList /> Attendance
                </button>
                <button onClick={() => navigate(`/faculty/marks/${c._id}`)} className="btn btn-sm btn-outline">
                  📝 Marks
                </button>
                <button onClick={() => navigate(`/faculty/doubts/${c._id}`)} className="btn btn-sm btn-outline">
                  <HiOutlineQuestionMarkCircle /> Doubts
                </button>
                <button onClick={() => navigate(`/faculty/analytics/${c._id}`)} className="btn btn-sm btn-primary">
                  <HiOutlineChartBar /> Analytics
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
