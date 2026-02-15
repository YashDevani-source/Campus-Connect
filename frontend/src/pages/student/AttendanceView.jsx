import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineClock, HiOutlineXCircle, HiOutlineChartBar } from 'react-icons/hi';

const AttendanceView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/student/attendance/${courseId}`);
        setData(res.data.data);
      } catch (err) { toast.error('Failed to load attendance'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading attendance...</p></div>;

  if (!data) return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>
      <div className="empty-state-card">
        <HiOutlineChartBar style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
        <h3>No Attendance Data</h3>
        <p>Attendance records have not been uploaded yet.</p>
      </div>
    </div>
  );

  const getColor = (pct) => pct >= 75 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineChartBar style={{ marginRight: '0.5rem' }} /> Attendance Overview</h1>
      </div>

      {/* Big percentage display */}
      <div className="attendance-hero">
        <div className="attendance-ring" style={{ '--pct-color': getColor(data.percentage) }}>
          <svg viewBox="0 0 120 120" className="attendance-svg">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={getColor(data.percentage)} strokeWidth="8"
              strokeDasharray={`${(data.percentage / 100) * 327} 327`}
              strokeLinecap="round" transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="attendance-ring-text">
            <span className="ring-pct">{data.percentage}%</span>
            <span className="ring-label">Attendance</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="att-stats-grid">
        <div className="att-stat-card att-stat-total">
          <HiOutlineChartBar />
          <div className="att-stat-val">{data.total}</div>
          <div className="att-stat-lbl">Total Classes</div>
        </div>
        <div className="att-stat-card att-stat-present">
          <HiOutlineCheckCircle />
          <div className="att-stat-val">{data.present}</div>
          <div className="att-stat-lbl">Present</div>
        </div>
        <div className="att-stat-card att-stat-absent">
          <HiOutlineXCircle />
          <div className="att-stat-val">{data.absent}</div>
          <div className="att-stat-lbl">Absent</div>
        </div>
        <div className="att-stat-card att-stat-late">
          <HiOutlineClock />
          <div className="att-stat-val">{data.late}</div>
          <div className="att-stat-lbl">Late</div>
        </div>
      </div>

      {/* Status bar */}
      <div className="att-visual-bar">
        <div className="att-bar-seg att-bar-present" style={{ width: `${data.total > 0 ? (data.present / data.total * 100) : 0}%` }} title={`Present: ${data.present}`} />
        <div className="att-bar-seg att-bar-late" style={{ width: `${data.total > 0 ? (data.late / data.total * 100) : 0}%` }} title={`Late: ${data.late}`} />
        <div className="att-bar-seg att-bar-absent" style={{ width: `${data.total > 0 ? (data.absent / data.total * 100) : 0}%` }} title={`Absent: ${data.absent}`} />
      </div>
      <div className="att-bar-legend">
        <span><span className="legend-dot" style={{ background: 'var(--success)' }} /> Present</span>
        <span><span className="legend-dot" style={{ background: 'var(--warning)' }} /> Late</span>
        <span><span className="legend-dot" style={{ background: 'var(--danger)' }} /> Absent</span>
      </div>

      {data.percentage < 75 && (
        <div className="att-warning-banner">
          ⚠️ Your attendance is below the required 75%. Please attend more classes to avoid debarment.
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
