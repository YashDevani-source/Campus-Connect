import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineBriefcase, HiOutlineCalendar, HiOutlineFilter } from 'react-icons/hi';

const OpportunityList = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [myApps, setMyApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState('opportunities');
  const [form, setForm] = useState({ title: '', description: '', type: 'internship', department: '', eligibility: '', deadline: '' });

  useEffect(() => { fetchData(); }, [filter]);

  const fetchData = async () => {
    try {
      const params = filter ? `?type=${filter}` : '';
      const res = await api.get(`/opportunities${params}`);
      setOpportunities(res.data.data.opportunities || []);
      if (user.role === 'student') {
        const aRes = await api.get('/opportunities/applications/my');
        setMyApps(aRes.data.data.applications || []);
      }
    } catch {} finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const data = { ...form };
      if (!data.deadline) delete data.deadline;
      await api.post('/opportunities', data);
      toast.success('Opportunity posted!');
      setShowForm(false);
      setForm({ title: '', description: '', type: 'internship', department: '', eligibility: '', deadline: '' });
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Opportunities</h1>
        {(user.role === 'faculty' || user.role === 'admin') && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary"><HiOutlinePlus /> Post Opportunity</button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="form-card">
          <div className="form-row">
            <div className="form-group"><label>Title</label><input name="title" value={form.title} onChange={handleChange} required /></div>
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="internship">Internship</option><option value="research">Research</option><option value="project">Project</option>
              </select>
            </div>
          </div>
          <div className="form-group"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} required /></div>
          <div className="form-row">
            <div className="form-group"><label>Department</label><input name="department" value={form.department} onChange={handleChange} /></div>
            <div className="form-group"><label>Deadline</label><input name="deadline" type="date" value={form.deadline} onChange={handleChange} /></div>
          </div>
          <div className="form-group"><label>Eligibility</label><input name="eligibility" value={form.eligibility} onChange={handleChange} /></div>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Post Opportunity</button>
          </div>
        </form>
      )}

      {user.role === 'student' && (
        <div className="tab-bar">
          <button className={`tab ${tab === 'opportunities' ? 'active' : ''}`} onClick={() => setTab('opportunities')}>Browse</button>
          <button className={`tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>My Applications ({myApps.length})</button>
        </div>
      )}

      {tab === 'opportunities' && (
        <>
          <div className="filter-bar">
            <HiOutlineFilter />
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="internship">Internship</option>
              <option value="research">Research</option>
              <option value="project">Project</option>
            </select>
          </div>
          {opportunities.length === 0 ? (
            <div className="empty-state"><p>No opportunities available.</p></div>
          ) : (
            <div className="grid-cards">
              {opportunities.map((o) => (
                <Link key={o._id} to={`/opportunities/${o._id}`} className="grid-card">
                  <div className="grid-card-icon"><HiOutlineBriefcase /></div>
                  <h3>{o.title}</h3>
                  <span className={`badge badge-${o.type === 'internship' ? 'info' : o.type === 'research' ? 'warning' : 'success'}`}>{o.type}</span>
                  <p className="text-muted">{o.description?.slice(0, 100)}...</p>
                  <div className="grid-card-footer">
                    {o.deadline && <span><HiOutlineCalendar /> {new Date(o.deadline).toLocaleDateString()}</span>}
                    <span>{o.postedBy?.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'applications' && (
        <div className="card-list">
          {myApps.length === 0 ? (
            <div className="empty-state"><p>You haven't applied to any opportunities yet.</p></div>
          ) : (
            myApps.map((a) => (
              <div key={a._id} className="list-card">
                <div className="list-card-info">
                  <h4>{a.opportunity?.title}</h4>
                  <div className="list-card-meta">
                    <span>{a.opportunity?.type}</span>
                    <span>•</span>
                    <span>Applied: {new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OpportunityList;
