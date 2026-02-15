import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const AttendanceAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/faculty/courses/${courseId}/attendance/analytics`);
        setData(res.data.data);
      } catch (err) { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  if (!data) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/faculty/courses')} className="btn btn-outline btn-sm mb-1">← Back</button>
      <div className="page-header"><h1>Attendance Analytics</h1><p className="page-subtitle">Required: {data.requiredAttendance}% | Total Classes: {data.totalClasses}</p></div>

      <div className="stats-row mb-1">
        <div className="stat-card"><div className="stat-value">{data.totalClasses}</div><div className="stat-label">Total Classes</div></div>
        <div className="stat-card"><div className="stat-value">{data.students.filter(s => !s.belowRequired).length}</div><div className="stat-label">Above Threshold</div></div>
        <div className="stat-card"><div className="stat-value">{data.students.filter(s => s.belowRequired).length}</div><div className="stat-label">Below Threshold</div></div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Roll No</th><th>Present</th><th>Absent</th><th>Late</th><th>%</th><th>Status</th></tr></thead>
          <tbody>
            {data.students.map(s => (
              <tr key={s.student._id} className={s.belowRequired ? 'row-danger' : ''}>
                <td>{s.student.name}</td>
                <td>{s.student.rollNumber || '—'}</td>
                <td>{s.present}</td>
                <td>{s.absent}</td>
                <td>{s.late}</td>
                <td><strong>{s.percentage}%</strong></td>
                <td>{s.belowRequired ? <span className="badge badge-high">Low</span> : <span className="badge badge-resolved">OK</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
