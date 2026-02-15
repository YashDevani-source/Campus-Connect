import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineShieldCheck, HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlineAcademicCap } from 'react-icons/hi';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-register">
        <div className="auth-header">
          <HiOutlineShieldCheck className="auth-logo" />
          <h1>Join Campus Connect</h1>
          <p>Create your campus account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label><HiOutlineUser /> Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
            </div>
            <div className="form-group">
              <label><HiOutlineMail /> Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><HiOutlineLockClosed /> Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" required />
            </div>
            <div className="form-group">
              <label><HiOutlineAcademicCap /> Role</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
                <option value="managementMember">Management</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Department</label>
              <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Computer Science" />
            </div>
            {form.role === 'student' && (
              <div className="form-group">
                <label>Roll Number</label>
                <input name="rollNumber" value={form.rollNumber} onChange={handleChange} placeholder="e.g. CS2024001" />
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
