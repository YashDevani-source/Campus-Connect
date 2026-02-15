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
  const [activeTab, setActiveTab] = useState('overview');
  const [course, setCourse] = useState(null);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', fileUrl: '', fileType: 'pdf' });
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState(null);

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [cRes, rRes] = await Promise.all([
        api.get(`/courses/${id}`),
        api.get(`/courses/${id}/resources`)
      ]);
      setCourse(cRes.data.data);
      setResources(rRes.data.data);

      if (user.role === 'student') {
        const [aRes, mRes] = await Promise.allSettled([
          api.get(`/student/attendance/${id}`),
          api.get(`/student/marks/${id}`)
        ]);
        if (aRes.status === 'fulfilled') setAttendance(aRes.value.data.data);
        if (mRes.status === 'fulfilled') setMarks(mRes.value.data.data);
      }
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
      fetchData(); // Refresh resources
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

        {/* Tabs */}
        <div className="tabs">
          {['overview', 'resources', 'attendance', 'marks', 'doubts'].map(tab => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'doubts' ? 'Discussion Forum' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content" style={{ marginTop: '1.5rem' }}>

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="animate-fade-in">
              <h3>Course Description</h3>
              <p>{course.description}</p>
              <div className="section-divider" />
              <h3>Syllabus</h3>
              <p className="text-muted">No syllabus uploaded yet.</p>
            </div>
          )}

          {/* RESOURCES */}
          {activeTab === 'resources' && (
            <div className="animate-fade-in">
              <div className="section-header">
                <h3>Course Resources</h3>
                {(user.role === 'faculty' || user.role === 'admin' || user.role === 'managementMember') && (
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
                        {(user.role === 'admin' || user.role === 'managementMember' || user.id === r.uploadedBy?._id) && (
                          <button onClick={() => handleDelete(r._id)} className="btn btn-sm btn-danger"><HiOutlineTrash /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ATTENDANCE */}
          {activeTab === 'attendance' && (
            <div className="animate-fade-in">
              <div className="section-header">
                <h3>Attendance Record</h3>
                {user.role === 'faculty' && (
                  <button onClick={() => navigate(`/faculty/attendance/${course._id}`)} className="btn btn-sm btn-primary">Take Attendance</button>
                )}
              </div>

              {user.role === 'student' ? (
                attendance ? (
                  <div className="stats-grid">
                    <div className="stat-card stat-blue">
                      <div className="stat-info">
                        <h3>{attendance.percentage}%</h3>
                        <p>Overall Attendance</p>
                      </div>
                    </div>
                    <div className="stat-card stat-green">
                      <div className="stat-info">
                        <h3>{attendance.present}</h3>
                        <p>Present</p>
                      </div>
                    </div>
                    <div className="stat-card stat-orange">
                      <div className="stat-info">
                        <h3>{attendance.late}</h3>
                        <p>Late</p>
                      </div>
                    </div>
                    <div className="stat-card stat-red" style={{ borderColor: 'var(--danger)' }}>
                      <div className="stat-info">
                        <h3>{attendance.absent}</h3>
                        <p>Absent</p>
                      </div>
                    </div>
                  </div>
                ) : <div className="empty-state">No attendance records found.</div>
              ) : (
                <div className="empty-state">
                  <p>Faculty view: Use the "Take Attendance" button to manage attendance.</p>
                </div>
              )}
            </div>
          )}

          {/* MARKS */}
          {activeTab === 'marks' && (
            <div className="animate-fade-in">
              <div className="section-header">
                <h3>Marks & Grades</h3>
                {user.role === 'faculty' && (
                  <button onClick={() => navigate(`/faculty/marks/${course._id}`)} className="btn btn-sm btn-primary">Assign Marks</button>
                )}
              </div>

              {user.role === 'student' ? (
                marks ? (
                  <div>
                    <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
                      <div className="stat-card stat-purple">
                        <div className="stat-info">
                          <h3>{marks.grade || 'N/A'}</h3>
                          <p>Current Grade</p>
                        </div>
                      </div>
                      <div className="stat-card stat-blue">
                        <div className="stat-info">
                          <h3>{marks.totalWeighted || 0}%</h3>
                          <p>Total Weighted Score</p>
                        </div>
                      </div>
                    </div>

                    <h4>Assessment Breakdown</h4>
                    {marks.assessments && marks.assessments.length > 0 ? (
                      <div className="card-list">
                        {marks.assessments.map((a, i) => (
                          <div key={i} className="list-card">
                            <div className="list-card-info">
                              <h4>{a.title}</h4>
                              <p className="text-muted">{a.type}</p>
                            </div>
                            <div style={{ fontWeight: 700 }}>
                              {a.obtainedMarks} / {a.maxMarks}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-muted">No assessments graded yet.</p>}
                  </div>
                ) : <div className="empty-state">No marks published yet.</div>
              ) : (
                <div className="empty-state">
                  <p>Faculty view: Use the "Assign Marks" button to manage grades.</p>
                </div>
              )}
            </div>
          )}

          {/* DOUBTS / DISCUSSION */}
          {activeTab === 'doubts' && (
            <div className="animate-fade-in">
              <div className="section-header">
                <h3>Class Discussion & Doubts</h3>
              </div>
              <div className="empty-state text-center" style={{ padding: '3rem' }}>
                <HiOutlineDocumentText style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }} />
                <h3>Join the Class Conversation</h3>
                <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                  Have questions about the lecture? Want to discuss an assignment? Join the dedicated discussion forum for this course.
                </p>
                <button
                  onClick={() => navigate(user.role === 'faculty' ? `/faculty/doubts/${course._id}` : `/student/doubts/${course._id}`)}
                  className="btn btn-primary btn-lg"
                >
                  Enter Discussion Forum
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
