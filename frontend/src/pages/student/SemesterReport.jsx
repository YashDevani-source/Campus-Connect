import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineAcademicCap, HiOutlineChartBar, HiOutlineTrendingUp } from 'react-icons/hi';

const SemesterReport = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/student/cgpa');
        setData(res.data.data);
      } catch (err) { toast.error('Failed to load report'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading report...</p></div>;

  if (!data || !data.semesters?.length) return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>
      <div className="empty-state-card">
        <HiOutlineChartBar style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
        <h3>No Academic Data</h3>
        <p>Semester reports have not been generated yet.</p>
      </div>
    </div>
  );

  const maxSGPA = 10;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineAcademicCap style={{ marginRight: '0.5rem' }} /> Academic Report</h1>
      </div>

      {/* Top stats */}
      <div className="report-hero-stats">
        <div className="report-stat-big">
          <span className="report-stat-val" style={{ color: 'var(--accent)' }}>{data.cgpa}</span>
          <span className="report-stat-label">Overall CGPA</span>
        </div>
        <div className="report-stat-big">
          <span className="report-stat-val">{data.totalCreditsEarned}</span>
          <span className="report-stat-label">Credits Earned</span>
        </div>
        <div className="report-stat-big">
          <span className="report-stat-val">{data.semesters.length}</span>
          <span className="report-stat-label">Semesters</span>
        </div>
      </div>

      {/* Visual SGPA trend */}
      <div className="sgpa-chart">
        <h3 className="section-title"><HiOutlineTrendingUp /> SGPA Trend</h3>
        <div className="sgpa-bars">
          {data.semesters.map((sem, idx) => (
            <div key={idx} className="sgpa-bar-col">
              <span className="sgpa-bar-val">{sem.sgpa}</span>
              <div className="sgpa-bar-track">
                <div
                  className="sgpa-bar-fill"
                  style={{
                    height: `${(sem.sgpa / maxSGPA) * 100}%`,
                    background: sem.sgpa >= 8 ? 'var(--success)' : sem.sgpa >= 6 ? 'var(--accent)' : 'var(--warning)',
                    animationDelay: `${idx * 0.15}s`
                  }}
                />
              </div>
              <span className="sgpa-bar-label">Sem {sem.semester}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Semester Details */}
      <h3 className="section-title" style={{ marginTop: '2rem' }}>Semester Details</h3>
      <div className="semester-cards">
        {data.semesters.map((sem, idx) => (
          <div key={idx} className="semester-card animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="semester-card-header">
              <h4>Semester {sem.semester}</h4>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <span className="badge badge-success">SGPA: {sem.sgpa}</span>
                <span className="badge badge-default">{sem.totalCreditsEarned || sem.totalCredits || 0} Cr</span>
              </div>
            </div>
            {sem.courses?.length > 0 && (
              <table className="data-table" style={{ marginTop: '0.75rem' }}>
                <thead><tr><th>Course</th><th>Code</th><th>Credits</th><th>Grade</th><th>GP</th></tr></thead>
                <tbody>
                  {sem.courses.map((c, ci) => (
                    <tr key={ci}>
                      <td>{c.courseTitle || c.course?.title || '—'}</td>
                      <td><span className="badge">{c.courseCode || c.course?.code || '—'}</span></td>
                      <td>{c.credits}</td>
                      <td><span className={`badge ${c.grade === 'F' ? 'badge-danger' : 'badge-success'}`}>{c.grade}</span></td>
                      <td>{c.gradePoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SemesterReport;
