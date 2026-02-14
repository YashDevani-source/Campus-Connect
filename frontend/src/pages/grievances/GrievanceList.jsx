import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { HiOutlinePlus, HiOutlineFilter } from 'react-icons/hi';

const GrievanceList = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: searchParams.get('status') || '', category: '' });

  useEffect(() => {
    fetchGrievances();
  }, [filter]);

  const fetchGrievances = async () => {
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.category) params.set('category', filter.category);
      const res = await api.get(`/grievances?${params}`);
      setGrievances(res.data.data.grievances || []);
    } catch {} finally { setLoading(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Grievances</h1>
        {user.role === 'student' && (
          <Link to="/grievances/new" className="btn btn-primary"><HiOutlinePlus /> File Grievance</Link>
        )}
      </div>
      <div className="filter-bar">
        <HiOutlineFilter />
        <select value={filter.status} onChange={(e) => setFilter({ ...filter, status: e.target.value })}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filter.category} onChange={(e) => setFilter({ ...filter, category: e.target.value })}>
          <option value="">All Categories</option>
          <option value="academic">Academic</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="hostel">Hostel</option>
          <option value="other">Other</option>
        </select>
      </div>
      {grievances.length === 0 ? (
        <div className="empty-state">
          <p>No grievances found.</p>
          {user.role === 'student' && <Link to="/grievances/new" className="btn btn-primary">File your first grievance</Link>}
        </div>
      ) : (
        <div className="card-list">
          {grievances.map((g) => (
            <Link key={g._id} to={`/grievances/${g._id}`} className="list-card">
              <div className="list-card-info">
                <h4>{g.title}</h4>
                <div className="list-card-meta">
                  <span>{g.category}</span>
                  <span>•</span>
                  <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                  {g.submittedBy && <><span>•</span><span>By: {g.submittedBy.name}</span></>}
                </div>
              </div>
              <div className="list-card-badges">
                <StatusBadge status={g.priority} />
                <StatusBadge status={g.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default GrievanceList;
