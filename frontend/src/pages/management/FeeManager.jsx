import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowLeft, HiOutlineCurrencyRupee, HiOutlinePlus,
  HiOutlineBell, HiOutlineCheckCircle, HiOutlineClock, HiOutlineFilter
} from 'react-icons/hi';

const FeeManager = () => {
  const [payments, setPayments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState({ status: '', type: '' });
  const [form, setForm] = useState({ student: '', type: 'tuition', amount: '', description: '', dueDate: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      const params = {};
      if (filter.status) params.status = filter.status;
      if (filter.type) params.type = filter.type;
      const res = await api.get('/management/payments', { params });
      setPayments(res.data.data.payments || []);
      setTotal(res.data.data.total || 0);
    } catch (err) { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, [filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/management/payments', { ...form, amount: Number(form.amount) });
      toast.success('Payment entry created');
      setShowForm(false);
      setForm({ student: '', type: 'tuition', amount: '', description: '', dueDate: '' });
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed to create payment'); }
    finally { setCreating(false); }
  };

  const handleReminder = async (id) => {
    try {
      await api.post(`/management/payments/${id}/reminder`);
      toast.success('Reminder sent');
    } catch (err) { toast.error('Failed to send reminder'); }
  };

  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const collectedAmount = payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading payments...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineCurrencyRupee style={{ marginRight: '0.5rem' }} /> Fee Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          <HiOutlinePlus /> {showForm ? 'Cancel' : 'New Payment'}
        </button>
      </div>

      {/* Summary */}
      <div className="payment-summary-row">
        <div className="payment-summary-card" style={{ borderLeft: '4px solid var(--accent)' }}>
          <HiOutlineCurrencyRupee style={{ fontSize: '2rem', color: 'var(--accent)' }} />
          <div>
            <div className="pay-sum-val">{total}</div>
            <div className="pay-sum-label">Total Records</div>
          </div>
        </div>
        <div className="payment-summary-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <HiOutlineClock style={{ fontSize: '2rem', color: 'var(--danger)' }} />
          <div>
            <div className="pay-sum-val">₹{pendingAmount.toLocaleString()}</div>
            <div className="pay-sum-label">Pending</div>
          </div>
        </div>
        <div className="payment-summary-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <HiOutlineCheckCircle style={{ fontSize: '2rem', color: 'var(--success)' }} />
          <div>
            <div className="pay-sum-val">₹{collectedAmount.toLocaleString()}</div>
            <div className="pay-sum-label">Collected</div>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card form-card animate-fade-in" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Create Payment Entry</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input value={form.student} onChange={e => setForm({ ...form, student: e.target.value })} className="form-input" placeholder="Student's MongoDB ID or Roll Number" required />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="form-input">
                <option value="tuition">Tuition</option>
                <option value="hostel">Hostel</option>
                <option value="bus">Bus</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="form-input" required min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="form-input" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="form-input" placeholder="e.g. Semester 4 Tuition Fee" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={creating} style={{ marginTop: '1rem' }}>
            {creating ? 'Creating...' : 'Create Payment'}
          </button>
        </form>
      )}

      {/* Filters */}
      <div className="filter-row" style={{ marginBottom: '1rem' }}>
        <HiOutlineFilter style={{ color: 'var(--text-muted)' }} />
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })} className="form-input" style={{ maxWidth: '160px' }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
        <select value={filter.type} onChange={e => setFilter({ ...filter, type: e.target.value })} className="form-input" style={{ maxWidth: '160px' }}>
          <option value="">All Types</option>
          <option value="tuition">Tuition</option>
          <option value="hostel">Hostel</option>
          <option value="bus">Bus</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Payments Table */}
      {payments.length === 0 ? (
        <div className="empty-state-card">
          <HiOutlineCurrencyRupee style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Payments</h3>
          <p>No payment records found with current filters.</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Type</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td>{p.student?.name || p.student?.email || '—'}</td>
                  <td><span className="badge">{p.type}</span></td>
                  <td style={{ fontWeight: 600 }}>₹{p.amount?.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${p.status === 'pending' ? 'pending' : p.status === 'completed' ? 'success' : 'danger'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
                  <td>
                    {p.status === 'pending' && (
                      <button onClick={() => handleReminder(p._id)} className="btn btn-sm btn-ghost" title="Send Reminder">
                        <HiOutlineBell /> Remind
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FeeManager;
