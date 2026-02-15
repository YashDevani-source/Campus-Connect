import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineClipboardList, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiOutlineCalendar } from 'react-icons/hi';

const AttendanceManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/faculty/courses/${courseId}/students`);
        const studentList = res.data.data || [];
        setStudents(studentList);

        // Load initial attendance for today
        const attRes = await api.get(`/faculty/courses/${courseId}/attendance?date=${new Date().toISOString().split('T')[0]}`);
        const todayRecords = attRes.data.data?.[0]?.records || [];

        const init = {};
        studentList.forEach(s => {
          const found = todayRecords.find(r => r.student._id === s._id || r.student === s._id);
          init[s._id] = found ? found.status : 'present';
        });
        setAttendance(init);
      } catch (err) { toast.error('Failed to load students'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const records = Object.entries(attendance).map(([student, status]) => ({ student, status }));
      await api.post(`/faculty/courses/${courseId}/attendance`, { date, records });
      toast.success('Attendance marked successfully!');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to mark attendance'); }
    finally { setSubmitting(false); }
  };

  const counts = { present: 0, absent: 0, late: 0 };
  Object.values(attendance).forEach(s => counts[s]++);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading students...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineClipboardList style={{ marginRight: '0.5rem' }} /> Mark Attendance</h1>
      </div>

      {/* Date & summary */}
      <div className="att-mgr-header">
        <div className="att-mgr-date">
          <HiOutlineCalendar />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="form-input" style={{ maxWidth: '200px' }} />
        </div>
        <div className="att-mgr-summary">
          <span className="att-mgr-chip" style={{ color: 'var(--success)' }}><HiOutlineCheckCircle /> {counts.present}</span>
          <span className="att-mgr-chip" style={{ color: 'var(--danger)' }}><HiOutlineXCircle /> {counts.absent}</span>
          <span className="att-mgr-chip" style={{ color: 'var(--warning)' }}><HiOutlineClock /> {counts.late}</span>
          <span className="att-mgr-chip" style={{ color: 'var(--text-secondary)' }}>Total: {students.length}</span>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <button className="btn btn-sm btn-outline" onClick={() => {
          const updated = {};
          students.forEach(s => { updated[s._id] = 'present'; });
          setAttendance(updated);
        }}>✅ Mark All Present</button>
        <button className="btn btn-sm btn-outline" onClick={() => {
          const updated = {};
          students.forEach(s => { updated[s._id] = 'absent'; });
          setAttendance(updated);
        }}>❌ Mark All Absent</button>
      </div>

      {students.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineClipboardList style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Students</h3>
          <p>No students enrolled in this course.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Name</th><th>Roll No.</th><th>Status</th></tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s._id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 500 }}>{s.name}</td>
                  <td><span className="badge badge-default">{s.rollNumber || '—'}</span></td>
                  <td>
                    <div className="att-status-group">
                      {['present', 'absent', 'late'].map(status => (
                        <button
                          key={status}
                          className={`att-status-btn att-${status} ${attendance[s._id] === status ? 'active' : ''}`}
                          onClick={() => setAttendance({ ...attendance, [s._id]: status })}
                        >
                          {status === 'present' && <HiOutlineCheckCircle />}
                          {status === 'absent' && <HiOutlineXCircle />}
                          {status === 'late' && <HiOutlineClock />}
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={handleSubmit}
        className="btn btn-primary btn-lg"
        disabled={submitting || students.length === 0}
        style={{ width: '100%', marginTop: '1.5rem' }}
      >
        {submitting ? 'Submitting...' : '📋 Submit Attendance'}
      </button>
    </div>
  );
};

export default AttendanceManager;
