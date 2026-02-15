import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlineAcademicCap } from 'react-icons/hi';

const MarksView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/student/marks/${courseId}`);
        setData(res.data.data);
      } catch (err) { toast.error('Failed to load marks'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading marks...</p></div>;

  if (!data) return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>
      <div className="empty-state-card">
        <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
        <h3>No Marks Data</h3>
        <p>Marks have not been uploaded for this course yet.</p>
      </div>
    </div>
  );

  const gradeColor = (grade) => {
    if (['AA', 'AB'].includes(grade)) return 'var(--success)';
    if (['BB', 'BC'].includes(grade)) return 'var(--accent)';
    if (['CC', 'CD'].includes(grade)) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineAcademicCap style={{ marginRight: '0.5rem' }} /> My Marks</h1>
      </div>

      {/* Grade hero */}
      <div className="marks-hero">
        <div className="marks-hero-grade" style={{ color: gradeColor(data.grade) }}>
          {data.grade || 'N/A'}
        </div>
        <div className="marks-hero-stats">
          <div className="marks-hero-stat">
            <span className="marks-stat-val">{data.totalWeighted?.toFixed(1) || 0}%</span>
            <span className="marks-stat-label">Total Score</span>
          </div>
          <div className="marks-hero-stat">
            <span className="marks-stat-val">{data.gradePoint || 0}</span>
            <span className="marks-stat-label">Grade Points</span>
          </div>
        </div>
      </div>

      {/* Assessment details */}
      {data.assessments?.length > 0 && (
        <>
          <h3 className="section-title" style={{ marginTop: '2rem' }}>Assessment Breakdown</h3>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr><th>Assessment</th><th>Type</th><th>Obtained</th><th>Maximum</th><th>Weightage</th><th>Score</th></tr>
              </thead>
              <tbody>
                {data.assessments.map((a, i) => {
                  const pct = ((a.obtainedMarks / a.maxMarks) * 100);
                  return (
                    <tr key={i}>
                      <td style={{ fontWeight: 500 }}>{a.title || '—'}</td>
                      <td><span className="badge">{a.type}</span></td>
                      <td>{a.obtainedMarks}</td>
                      <td>{a.maxMarks}</td>
                      <td>{a.weightage}%</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '50px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default MarksView;
