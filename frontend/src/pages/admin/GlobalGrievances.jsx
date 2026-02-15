import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const GlobalGrievances = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchGrievances = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.priority) params.append('priority', filters.priority);
      params.append('page', filters.page);
      const res = await api.get(`/admin/grievances?${params}`);
      setGrievances(res.data.data.grievances);
      setPagination({ total: res.data.data.total, pages: res.data.data.pages });
    } catch (err) {
      toast.error('Failed to load grievances');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchGrievances(); }, [filters.status, filters.category, filters.priority, filters.page]);

  return (
    <div className="page-container">
      <div className="page-header"><h1>Global Grievances</h1><p className="page-subtitle">All campus grievances</p></div>
      <div className="filters-bar">
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value, page: 1 })} className="form-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value, page: 1 })} className="form-select">
          <option value="">All Categories</option>
          <option value="academic">Academic</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="hostel">Hostel</option>
          <option value="ragging">Ragging</option>
          <option value="sexual-harassment">Sexual Harassment</option>
          <option value="other">Other</option>
        </select>
        <select value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value, page: 1 })} className="form-select">
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      {loading ? <div className="loading-screen"><div className="spinner" /><p>Loading...</p></div> : (
        <div className="data-table-container">
          <table className="data-table">
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>Priority</th><th>Submitted By</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {grievances.map(g => (
                <tr key={g._id}>
                  <td>{g.title}</td>
                  <td><span className="badge">{g.category}</span></td>
                  <td><span className={`badge badge-${g.status}`}>{g.status}</span></td>
                  <td><span className={`badge badge-${g.priority}`}>{g.priority}</span></td>
                  <td>{g.submittedBy?.name || '—'}</td>
                  <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                  <td><a href={`/grievances/${g._id}`} className="btn btn-sm btn-outline">View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default GlobalGrievances;
