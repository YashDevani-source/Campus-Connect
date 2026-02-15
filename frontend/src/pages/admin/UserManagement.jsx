import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ role: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data.users);
      setPagination({ total: res.data.data.total, pages: res.data.data.pages });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [filters.role, filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>User Management</h1>
        <p className="page-subtitle">View and manage all platform users</p>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Search by name, email, roll no..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="form-input" />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>
        <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })} className="form-select">
          <option value="">All Roles</option>
          <option value="student">Student</option>
          <option value="faculty">Faculty</option>
          <option value="managementMember">Management</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" /><p>Loading users...</p></div>
      ) : (
        <>
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Roll No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td><span className={`badge badge-${user.role}`}>{user.role}</span></td>
                    <td>{user.department || '—'}</td>
                    <td>{user.rollNumber || '—'}</td>
                    <td className="actions-cell">
                      <a href={`/admin/users/${user._id}`} className="btn btn-sm btn-outline">View</a>
                      <button onClick={() => handleDelete(user._id)} className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button key={i} className={`pagination-btn ${filters.page === i + 1 ? 'active' : ''}`} onClick={() => setFilters({ ...filters, page: i + 1 })}>{i + 1}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserManagement;
