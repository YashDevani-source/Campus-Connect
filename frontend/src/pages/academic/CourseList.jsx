import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineAcademicCap, HiOutlineUserGroup } from 'react-icons/hi';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', code: '', description: '', department: '', semester: '' });

  useEffect(() => { fetchCourses(); }, []);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data.data.courses || []);
    } catch {} finally { setLoading(false); }
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
        {(user.role === 'faculty' || user.role === 'admin') && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
            <HiOutlinePlus /> Create Course
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-card">
          <div className="form-row">
            <div className="form-group"><label>Course Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group"><label>Course Code</label><input name="code" value={form.code} onChange={handleChange} placeholder="e.g. CS201" required /></div>
          </div>
          <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} /></div>
          <div className="form-row">
            <div className="form-group"><label>Department</label><input name="department" value={form.department} onChange={handleChange} /></div>
            <div className="form-group"><label>Semester</label><input name="semester" value={form.semester} onChange={handleChange} /></div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create Course</button>
          </div>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="empty-state"><p>No courses available.</p></div>
      ) : (
        <div className="grid-cards">
          {courses.map((c) => (
            <Link key={c._id} to={`/courses/${c._id}`} className="grid-card">
              <div className="grid-card-icon"><HiOutlineAcademicCap /></div>
              <h3>{c.title}</h3>
              <span className="badge badge-info">{c.code}</span>
              <p className="text-muted">{c.description?.slice(0, 80)}...</p>
              <div className="grid-card-footer">
                <span><HiOutlineUserGroup /> {c.enrolledStudents?.length || 0} enrolled</span>
                <span className="text-muted">{c.instructor?.name}</span>
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
