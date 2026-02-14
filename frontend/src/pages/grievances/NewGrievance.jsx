import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const NewGrievance = () => {
  const [form, setForm] = useState({ title: '', description: '', category: 'other', priority: 'medium' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => {
      const updates = { [name]: value };
      if (name === 'category' && (value === 'ragging' || value === 'sexual-harassment')) {
        updates.priority = 'high';
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/grievances', form);
      toast.success('Grievance filed successfully!');
      navigate('/grievances');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to file grievance');
    } finally { setLoading(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>File a Grievance</h1></div>
      <form onSubmit={handleSubmit} className="form-card">
        {(form.category === 'ragging' || form.category === 'sexual-harassment') && (
          <div style={{ 
            background: '#fee2e2', 
            border: '1px solid #ef4444', 
            color: '#b91c1c', 
            padding: '1rem', 
            borderRadius: '0.5rem', 
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <strong>Urgent:</strong> This will be treated as a High Priority emergency report.
          </div>
        )}
        <div className="form-group">
          <label>Title</label>
          <input name="title" value={form.title} onChange={handleChange} placeholder="Brief title of your complaint" required />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your issue in detail..." rows={5} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="academic">Academic</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="hostel">Hostel</option>
              <option value="ragging">Ragging</option>
              <option value="sexual-harassment">Sexual Harassment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} disabled={form.category === 'ragging' || form.category === 'sexual-harassment'}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Grievance'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewGrievance;
