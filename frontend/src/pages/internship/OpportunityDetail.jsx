import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineUser } from 'react-icons/hi';

const OpportunityDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opp, setOpp] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({ coverLetter: '', resumeUrl: '' });

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/opportunities/${id}`);
      setOpp(res.data.data);
      if (user.role === 'faculty' || user.role === 'admin') {
        try {
          const aRes = await api.get(`/opportunities/${id}/applications`);
          setApplications(aRes.data.data || []);
        } catch {}
      }
    } catch { navigate('/opportunities'); }
    finally { setLoading(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/opportunities/${id}/apply`, applyForm);
      toast.success('Application submitted!');
      setShowApply(false);
      navigate('/opportunities');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (appId, status) => {
    try {
      await api.patch(`/opportunities/applications/${appId}/status`, { status });
      toast.success(`Application ${status}`);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!opp) return null;

  const isExpired = opp.deadline && new Date(opp.deadline) < new Date();

  return (
    <div className="page-container">
      <button onClick={() => navigate('/opportunities')} className="btn btn-ghost btn-back">
        <HiOutlineArrowLeft /> Back
      </button>
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1>{opp.title}</h1>
            <div className="detail-meta">
              <span className={`badge badge-${opp.type === 'internship' ? 'info' : opp.type === 'research' ? 'warning' : 'success'}`}>{opp.type}</span>
              {opp.department && <span>{opp.department}</span>}
              <span>Posted by: {opp.postedBy?.name}</span>
              {opp.deadline && (
                <span className={isExpired ? 'text-danger' : ''}><HiOutlineCalendar /> {isExpired ? 'Expired' : `Deadline: ${new Date(opp.deadline).toLocaleDateString()}`}</span>
              )}
            </div>
          </div>
        </div>
        <div className="detail-body">
          <p>{opp.description}</p>
          {opp.eligibility && <div className="info-box"><strong>Eligibility:</strong> {opp.eligibility}</div>}
        </div>

        {/* Student Apply */}
        {user.role === 'student' && !isExpired && (
          <div className="action-panel">
            {!showApply ? (
              <button onClick={() => setShowApply(true)} className="btn btn-primary btn-full"><HiOutlineCheckCircle /> Apply Now</button>
            ) : (
              <form onSubmit={handleApply} className="form-card">
                <div className="form-group"><label>Cover Letter</label><textarea value={applyForm.coverLetter} onChange={(e) => setApplyForm({ ...applyForm, coverLetter: e.target.value })} rows={4} placeholder="Why are you interested?" /></div>
                <div className="form-group"><label>Resume URL</label><input value={applyForm.resumeUrl} onChange={(e) => setApplyForm({ ...applyForm, resumeUrl: e.target.value })} placeholder="https://..." /></div>
                <div className="form-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowApply(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Submit Application</button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Faculty/Admin — View Applications */}
        {(user.role === 'faculty' || user.role === 'admin') && applications.length > 0 && (
          <div className="section-divider" />
        )}
        {(user.role === 'faculty' || user.role === 'admin') && (
          <div>
            <h2><HiOutlineUser /> Applications ({applications.length})</h2>
            {applications.length === 0 ? (
              <div className="empty-state"><p>No applications yet.</p></div>
            ) : (
              <div className="card-list">
                {applications.map((a) => (
                  <div key={a._id} className="list-card">
                    <div className="list-card-info">
                      <h4>{a.applicant?.name}</h4>
                      <div className="list-card-meta">
                        <span>{a.applicant?.email}</span>
                        {a.applicant?.rollNumber && <><span>•</span><span>{a.applicant.rollNumber}</span></>}
                        <span>•</span>
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                      {a.coverLetter && <p className="text-muted" style={{ marginTop: '0.25rem' }}>{a.coverLetter.slice(0, 100)}...</p>}
                    </div>
                    <div className="list-card-actions">
                      <StatusBadge status={a.status} />
                      <select value={a.status} onChange={(e) => handleStatusChange(a._id, e.target.value)} className="status-select">
                        <option value="applied">Applied</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityDetail;
