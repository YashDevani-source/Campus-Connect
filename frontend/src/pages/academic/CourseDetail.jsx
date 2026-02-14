import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlinePlus, HiOutlineDocumentText, HiOutlineTrash } from 'react-icons/hi';

const CourseDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', fileUrl: '', fileType: 'pdf' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([api.get(`/courses/${id}`), api.get(`/courses/${id}/resources`)]);
      setCourse(cRes.data.data);
      setResources(rRes.data.data);
    } catch { navigate('/courses'); }
    finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/courses/${id}/resources`, resourceForm);
      toast.success('Resource uploaded!');
      setShowUpload(false);
      setResourceForm({ title: '', description: '', fileUrl: '', fileType: 'pdf' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (resourceId) => {
    if (!confirm('Delete this resource?')) return;
    try {
      await api.delete(`/courses/resources/${resourceId}`);
      toast.success('Resource deleted');
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!course) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/courses')} className="btn btn-ghost btn-back">
        <HiOutlineArrowLeft /> Back to Courses
      </button>
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{course.title}</h1>
            <div className="detail-meta">
              <span className="badge badge-info">{course.code}</span>
              <span>Instructor: {course.instructor?.name}</span>
              <span>•</span>
              <span>Semester: {course.semester}</span>
              <span>•</span>
              <span>{course.enrolledStudents?.length || 0} students enrolled</span>
            </div>
          </div>
        </div>
        <div className="detail-body"><p>{course.description}</p></div>

        {/* Resources */}
        <div className="section-divider" />
        <div className="section-header">
          <h2><HiOutlineDocumentText /> Course Resources</h2>
          {(user.role === 'faculty' || user.role === 'admin') && (
            <button onClick={() => setShowUpload(!showUpload)} className="btn btn-sm btn-primary">
              <HiOutlinePlus /> Upload
            </button>
          )}
        </div>

        {showUpload && (
          <form onSubmit={handleUpload} className="form-card" style={{ marginBottom: '1rem' }}>
            <div className="form-row">
              <div className="form-group"><label>Title</label><input value={resourceForm.title} onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })} required /></div>
              <div className="form-group">
                <label>Type</label>
                <select value={resourceForm.fileType} onChange={(e) => setResourceForm({ ...resourceForm, fileType: e.target.value })}>
                  <option value="pdf">PDF</option><option value="doc">Doc</option><option value="ppt">PPT</option><option value="video">Video</option><option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>File URL</label><input value={resourceForm.fileUrl} onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })} placeholder="https://..." required /></div>
            <div className="form-group"><label>Description</label><textarea value={resourceForm.description} onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })} rows={2} /></div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Upload Resource</button>
            </div>
          </form>
        )}

        {resources.length === 0 ? (
          <div className="empty-state"><p>No resources uploaded yet.</p></div>
        ) : (
          <div className="card-list">
            {resources.map((r) => (
              <div key={r._id} className="list-card">
                <div className="list-card-info">
                  <h4>{r.title}</h4>
                  <div className="list-card-meta">
                    <span className="badge badge-default">{r.fileType}</span>
                    <span>By: {r.uploadedBy?.name}</span>
                    <span>•</span>
                    <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="list-card-actions">
                  <a href={r.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary">View</a>
                  {(user.role === 'admin' || user.id === r.uploadedBy?._id) && (
                    <button onClick={() => handleDelete(r._id)} className="btn btn-sm btn-danger"><HiOutlineTrash /></button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
