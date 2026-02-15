import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const MarksManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [existingMarks, setExistingMarks] = useState([]);
  const [form, setForm] = useState({ assessmentType: 'quiz', title: '', maxMarks: 100, weightage: 20 });
  const [marks, setMarks] = useState({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('assign');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [studRes, marksRes] = await Promise.all([
          api.get(`/faculty/courses/${courseId}/students`),
          api.get(`/faculty/courses/${courseId}/marks`)
        ]);
        setStudents(studRes.data.data);
        setExistingMarks(marksRes.data.data);
        const initial = {};
        studRes.data.data.forEach(s => { initial[s._id] = 0; });
        setMarks(initial);
      } catch (err) { toast.error('Failed to load data'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [courseId]);

  const handleSubmit = async () => {
    if (!form.title) { toast.error('Enter assessment title'); return; }
    setSubmitting(true);
    try {
      const marksArray = Object.entries(marks).map(([student, obtainedMarks]) => ({ student, obtainedMarks: Number(obtainedMarks) }));
      await api.post(`/faculty/courses/${courseId}/marks`, { ...form, marks: marksArray });
      toast.success('Marks assigned successfully');
      const res = await api.get(`/faculty/courses/${courseId}/marks`);
      setExistingMarks(res.data.data);
      setTab('view');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/faculty/courses')} className="btn btn-outline btn-sm mb-1">← Back</button>
      <div className="page-header"><h1>Marks Manager</h1></div>
      <div className="tab-bar mb-1">
        <button className={`tab-btn ${tab === 'assign' ? 'active' : ''}`} onClick={() => setTab('assign')}>Assign Marks</button>
        <button className={`tab-btn ${tab === 'view' ? 'active' : ''}`} onClick={() => setTab('view')}>View All Marks</button>
      </div>

      {tab === 'assign' ? (
        <>
          <div className="form-row mb-1">
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.assessmentType} onChange={e => setForm({ ...form, assessmentType: e.target.value })} className="form-select"><option value="quiz">Quiz</option><option value="midsem">Midsem</option><option value="endsem">Endsem</option><option value="assignment">Assignment</option></select>
            </div>
            <div className="form-group"><label className="form-label">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" placeholder="e.g. Quiz 1" /></div>
            <div className="form-group"><label className="form-label">Max Marks</label><input type="number" value={form.maxMarks} onChange={e => setForm({ ...form, maxMarks: Number(e.target.value) })} className="form-input" /></div>
            <div className="form-group"><label className="form-label">Weightage %</label><input type="number" value={form.weightage} onChange={e => setForm({ ...form, weightage: Number(e.target.value) })} className="form-input" /></div>
          </div>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Roll No</th><th>Marks (/{form.maxMarks})</th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}><td>{s.name}</td><td>{s.rollNumber || '—'}</td>
                    <td><input type="number" min="0" max={form.maxMarks} value={marks[s._id] || 0} onChange={e => setMarks({ ...marks, [s._id]: e.target.value })} className="form-input" style={{ width: '100px' }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary mt-1">{submitting ? 'Submitting...' : 'Submit Marks'}</button>
        </>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Name</th><th>Assessments</th><th>Total %</th><th>Grade</th></tr></thead>
            <tbody>
              {existingMarks.map(m => (
                <tr key={m._id}>
                  <td>{m.student?.name || '—'}</td>
                  <td>{m.assessments?.map(a => `${a.title}: ${a.obtainedMarks}/${a.maxMarks}`).join(', ') || '—'}</td>
                  <td>{m.totalWeighted?.toFixed(1)}%</td>
                  <td><span className="badge">{m.grade || '—'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarksManager;
