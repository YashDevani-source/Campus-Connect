import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineAcademicCap, HiOutlineUserGroup, HiOutlineTrash, HiDotsVertical } from 'react-icons/hi';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '', department: '', semester: '', instructor: '' });
  const [facultyList, setFacultyList] = useState([]);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data.courses || []);
    } catch { } finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/courses', form);
      toast.success('Course created!');
      setShowForm(false);
      setForm({ title: '', code: '', description: '', department: '', semester: '' });
      fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      toast.success('Enrolled successfully!');
      fetchCourses();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to enroll'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Academic Courses</h1>
        {(user.role === 'faculty' || user.role === 'admin' || user.role === 'managementMember') && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <HiOutlinePlus /> {['admin', 'managementMember'].includes(user.role) ? 'Create Course' : 'Request Course'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-card">
          <h3>{['admin', 'managementMember'].includes(user.role) ? 'Create & Assign Course' : 'Request New Course'}</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              {['admin', 'managementMember'].includes(user.role) ? (
                <select
                  name="department"
                  value={form.department}
                  onChange={(e) => {
                    const dept = e.target.value;
                    setForm({ ...form, department: dept, instructor: '' });
                    // Fetch faculty for this department
                    if (dept) {
                      api.get(`/courses/faculty-list?department=${dept}`)
                        .then(res => setFacultyList(res.data.data))
                        .catch(() => toast.error('Failed to load faculty'));
                    } else {
                      setFacultyList([]);
                    }
                  }}
                  required
                >
                  <option value="">-- Select Department --</option>
                  {['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Electrical', 'Information Technology'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              ) : (
                <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" required />
              )}
            </div>

            {['admin', 'managementMember'].includes(user.role) && (
              <div className="form-group">
                <label>Assign Faculty</label>
                <select
                  name="instructor"
                  value={form.instructor}
                  onChange={handleChange}
                  required
                  disabled={!form.department}
                >
                  <option value="">-- Select Faculty --</option>
                  {facultyList.map(f => (
                    <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group"><label>Course Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label>Course Code</label><input name="code" value={form.code} onChange={handleChange} placeholder="e.g. CS201" required /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></div>
          <div className="form-row">
            <div className="form-group"><label>Semester</label><input name="semester" value={form.semester} onChange={handleChange} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">
              {['admin', 'managementMember'].includes(user.role) ? 'Create & Assign' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="empty-state"><p>No courses available.</p></div>
      ) : (
        <div className="grid-cards">
          {courses.map((c) => (
            <Link key={c._id} to={`/courses/${c._id}`} className="grid-card" style={{ position: 'relative' }}>
              {(user.role === 'admin' || (user.role === 'managementMember' && c.department === user.department)) && (
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMenuOpen(menuOpen === c._id ? null : c._id);
                    }}
                    className="btn-icon"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(4px)',
                      border: '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <HiDotsVertical />
                  </button>
                  {menuOpen === c._id && (
                    <div className="card-menu animate-fade-in" style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '4px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      minWidth: '140px',
                      overflow: 'hidden',
                      zIndex: 20
                    }}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm('Permanently delete this course?')) {
                            api.delete(`/courses/${c._id}`)
                              .then(() => { toast.success('Deleted'); fetchCourses(); })
                              .catch(err => toast.error(err.response?.data?.message || 'Failed'));
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.75rem 1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'none',
                          border: 'none',
                          color: 'var(--danger)',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: 500
                        }}
                        className="menu-item-danger"
                      >
                        <HiOutlineTrash /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="grid-card-icon"><HiOutlineAcademicCap /></div>
              <h3>{c.title}</h3>
              <span className="badge badge-info">{c.code}</span>
              <p className="text-muted">{c.description?.slice(0, 80)}...</p>
              <div className="grid-card-footer">
                <span><HiOutlineUserGroup /> {c.enrolledStudents?.length || 0} enrolled</span>
                <span className="text-muted">{c.instructor?.name?.split(' ')[0]}</span>
              </div>
              {user.role === 'student' && !c.enrolledStudents?.includes(user.id) && (
                <button
                  onClick={(e) => { e.preventDefault(); handleEnroll(c._id); }}
                  className="btn btn-sm btn-primary"
                  style={{ marginTop: '0.5rem' }}
                >Enroll</button>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
