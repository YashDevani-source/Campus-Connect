import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineBookOpen, HiOutlinePlus } from 'react-icons/hi';

const FacultyCourseProposal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    credits: 3,
    department: user.department || '',
    semester: '',
    description: '',
    requiredAttendance: 75
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/courses', formData);
      toast.success('Course proposal submitted successfully!');
      navigate('/faculty/courses');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineBookOpen style={{ marginRight: '0.5rem' }} /> Propose New Course</h1>
        <p className="page-subtitle">Submit a new course curriculum for approval by the administration.</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g. Advanced Data Structures"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Course Code</label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. CS101"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Credits</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                className="form-input"
                min="1"
                max="10"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Computer Science"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Semester</label>
              <input
                type="text"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g. Spring 2024"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Required Attendance (%)</label>
            <input
              type="number"
              name="requiredAttendance"
              value={formData.requiredAttendance}
              onChange={handleChange}
              className="form-input"
              min="0"
              max="100"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
              rows="5"
              placeholder="Detailed description of the course curriculum and objectives..."
              required
            ></textarea>
          </div>

          <div className="form-actions" style={{ marginTop: '2rem' }}>
            <button type="button" onClick={() => navigate(-1)} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : <><HiOutlinePlus /> Submit Proposal</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultyCourseProposal;
