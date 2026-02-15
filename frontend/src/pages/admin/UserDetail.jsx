import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/admin/users/${id}`);
        setUser(res.data.data);
      } catch (err) {
        toast.error('Failed to load user');
        navigate('/admin/users');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div>;
  if (!user) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate('/admin/users')} className="btn btn-outline btn-sm mb-1">← Back to Users</button>
      <div className="page-header">
        <h1>{user.name}</h1>
        <span className={`badge badge-${user.role}`}>{user.role}</span>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <h3>Basic Info</h3>
          <div className="detail-row"><span>Email</span><span>{user.email}</span></div>
          <div className="detail-row"><span>Roll Number</span><span>{user.rollNumber || '—'}</span></div>
          <div className="detail-row"><span>Department</span><span>{user.department || '—'}</span></div>
          <div className="detail-row"><span>Academic Year</span><span>{user.academicYear || '—'}</span></div>
          <div className="detail-row"><span>CGPA</span><span>{user.cgpa || '—'}</span></div>
        </div>

        {user.personalInfo && (
          <div className="detail-card">
            <h3>Personal Info</h3>
            <div className="detail-row"><span>Phone</span><span>{user.personalInfo.phone || '—'}</span></div>
            <div className="detail-row"><span>Blood Group</span><span>{user.personalInfo.bloodGroup || '—'}</span></div>
            <div className="detail-row"><span>Address</span><span>{user.personalInfo.address || '—'}</span></div>
          </div>
        )}

        {user.parentDetails && (
          <div className="detail-card">
            <h3>Parent Details</h3>
            <div className="detail-row"><span>Father</span><span>{user.parentDetails.fatherName || '—'}</span></div>
            <div className="detail-row"><span>Mother</span><span>{user.parentDetails.motherName || '—'}</span></div>
            <div className="detail-row"><span>Guardian Contact</span><span>{user.parentDetails.guardianContact || '—'}</span></div>
          </div>
        )}

        {user.idCardData?.cardNumber && (
          <div className="detail-card">
            <h3>ID Card</h3>
            <div className="detail-row"><span>Card No</span><span>{user.idCardData.cardNumber}</span></div>
            <div className="detail-row"><span>Expiry</span><span>{user.idCardData.expiryDate ? new Date(user.idCardData.expiryDate).toLocaleDateString() : '—'}</span></div>
          </div>
        )}

        {user.skills?.length > 0 && (
          <div className="detail-card">
            <h3>Skills</h3>
            <div className="tags-container">
              {user.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        {user.feeStatus && (
          <div className="detail-card">
            <h3>Fee Status</h3>
            <div className="detail-row"><span>Total Fee</span><span>₹{user.feeStatus.totalFee || 0}</span></div>
            <div className="detail-row"><span>Paid</span><span>₹{user.feeStatus.paidAmount || 0}</span></div>
            <div className="detail-row"><span>Due</span><span>₹{(user.feeStatus.totalFee || 0) - (user.feeStatus.paidAmount || 0)}</span></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
