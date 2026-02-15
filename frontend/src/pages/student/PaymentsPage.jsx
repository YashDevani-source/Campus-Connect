import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineCurrencyRupee, HiOutlineCheckCircle, HiOutlineClock, HiOutlineClipboardList } from 'react-icons/hi';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(null);
  const navigate = useNavigate();

  const fetchPayments = async () => {
    try {
      const res = await api.get('/student/payments');
      setPayments(res.data.data);
    } catch (err) { toast.error('Failed to load payments'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handlePay = async (id) => {
    setPaying(id);
    try {
      await api.post('/student/pay', { paymentId: id });
      toast.success('Payment successful!');
      fetchPayments();
    } catch (err) { toast.error(err.response?.data?.error || 'Payment failed'); }
    finally { setPaying(null); }
  };

  const pending = payments.filter(p => p.status === 'pending');
  const completed = payments.filter(p => p.status === 'completed');
  const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);
  const totalPaid = completed.reduce((sum, p) => sum + p.amount, 0);

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading payments...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineCurrencyRupee style={{ marginRight: '0.5rem' }} /> My Payments</h1>
      </div>

      {/* Summary cards */}
      <div className="payment-summary-row">
        <div className="payment-summary-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <HiOutlineClock style={{ fontSize: '2rem', color: 'var(--danger)' }} />
          <div>
            <div className="pay-sum-val">₹{totalPending.toLocaleString()}</div>
            <div className="pay-sum-label">{pending.length} Pending</div>
          </div>
        </div>
        <div className="payment-summary-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <HiOutlineCheckCircle style={{ fontSize: '2rem', color: 'var(--success)' }} />
          <div>
            <div className="pay-sum-val">₹{totalPaid.toLocaleString()}</div>
            <div className="pay-sum-label">{completed.length} Completed</div>
          </div>
        </div>
      </div>

      {/* Pending Payments */}
      {pending.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '2rem', color: 'var(--danger)' }}><HiOutlineClock /> Pending Payments</h2>
          <div className="payment-cards">
            {pending.map(p => (
              <div key={p._id} className="payment-card payment-pending animate-scale-in">
                <div className="payment-card-top">
                  <div>
                    <span className="badge badge-pending">{p.type}</span>
                    <h3 className="payment-title">{p.description || `${p.type} Fee`}</h3>
                    {p.dueDate && <span className="text-muted">Due: {new Date(p.dueDate).toLocaleDateString()}</span>}
                  </div>
                  <div className="payment-amount">₹{p.amount.toLocaleString()}</div>
                </div>
                <button
                  onClick={() => handlePay(p._id)}
                  className="btn btn-primary"
                  disabled={paying === p._id}
                  style={{ width: '100%', marginTop: '1rem' }}
                >
                  {paying === p._id ? 'Processing...' : '💳 Pay Now'}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Completed Payments */}
      {completed.length > 0 && (
        <>
          <h2 className="section-title" style={{ marginTop: '2rem' }}><HiOutlineClipboardList /> Payment History</h2>
          <div className="data-table-container">
            <table className="data-table">
              <thead><tr><th>Type</th><th>Description</th><th>Amount</th><th>Transaction ID</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {completed.map(p => (
                  <tr key={p._id}>
                    <td><span className="badge">{p.type}</span></td>
                    <td>{p.description || '—'}</td>
                    <td style={{ fontWeight: 600 }}>₹{p.amount.toLocaleString()}</td>
                    <td><code style={{ fontSize: '0.75rem' }}>{p.transactionId || '—'}</code></td>
                    <td>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                    <td><span className="badge badge-success">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {payments.length === 0 && (
        <div className="empty-state-card">
          <HiOutlineCurrencyRupee style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
          <h3>No Payments</h3>
          <p>You have no payment records yet.</p>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
