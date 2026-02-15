import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const CertificateManager = () => {
  const [form, setForm] = useState({ student: '', title: '', type: 'course', issuer: '', issueDate: '', fileUrl: '' });
  const [searchId, setSearchId] = useState('');
  const [certs, setCerts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/management/certificates', form);
      toast.success('Certificate added');
      setForm({ student: '', title: '', type: 'course', issuer: '', issueDate: '', fileUrl: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      const res = await api.get(`/management/certificates/${searchId}`);
      setCerts(res.data.data);
    } catch (err) { toast.error('Failed to load certificates'); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Certificate Management</h1></div>
      <div className="detail-grid">
        <div className="card">
          <h3>Add Certificate</h3>
          <form onSubmit={handleAdd}>
            <div className="form-group"><label className="form-label">Student ID</label><input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="form-select"><option value="course">Course</option><option value="internship">Internship</option><option value="achievement">Achievement</option><option value="other">Other</option></select></div>
            <div className="form-group"><label className="form-label">Issuer</label><input value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Issue Date</label><input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">File URL</label><input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} className="form-input" required placeholder="https://..." /></div>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Adding...' : 'Add Certificate'}</button>
          </form>
        </div>
        <div className="card">
          <h3>View Student Certificates</h3>
          <div className="search-form mb-1">
            <input value={searchId} onChange={e => setSearchId(e.target.value)} className="form-input" placeholder="Student ID" />
            <button onClick={handleSearch} className="btn btn-primary btn-sm">Search</button>
          </div>
          {certs.length > 0 && certs.map(c => (
            <div key={c._id} className="detail-row"><span>{c.title} ({c.type})</span><span>{c.issuer} • {new Date(c.issueDate).toLocaleDateString()}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CertificateManager;
