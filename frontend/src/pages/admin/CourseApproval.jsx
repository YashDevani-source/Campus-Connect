import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CourseApproval = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses/pending');
      setCourses(res.data.data);
    } catch (err) {
      toast.error('Failed to load courses');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleAction = async (id, status) => {
    try {
      await api.patch(`/courses/${id}/status`, { status });
      toast.success(`Course ${status}`);
      fetchCourses();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <div className="page-header"><h1>Course Approval</h1><p className="page-subtitle">Review faculty-created courses</p></div>
      {courses.length === 0 ? (
        <div className="empty-state"><p>No pending courses to approve</p></div>
      ) : (
        <div className="cards-grid">
          {courses.map(c => (
            <div key={c._id} className="card">
              <div className="card-header"><h3>{c.title}</h3><span className="badge badge-pending">{c.code}</span></div>
              <div className="card-body">
                <p>{c.description || 'No description'}</p>
                <div className="detail-row"><span>Department</span><span>{c.department || '—'}</span></div>
                <div className="detail-row"><span>Semester</span><span>{c.semester || '—'}</span></div>
                <div className="detail-row"><span>Credits</span><span>{c.credits}</span></div>
              </div>
              <div className="card-actions">
                <button onClick={() => handleAction(c._id, 'approved')} className="btn btn-primary btn-sm">Approve</button>
                <button onClick={() => handleAction(c._id, 'rejected')} className="btn btn-danger btn-sm">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseApproval;
