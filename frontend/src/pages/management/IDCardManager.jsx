import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const IDCardManager = () => {
  const [form, setForm] = useState({ studentId: '', cardNumber: '', issueDate: '', expiryDate: '', photoUrl: '', barcode: '' });
  const [searchId, setSearchId] = useState('');
  const [cardData, setCardData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/management/idcards', form);
      toast.success('ID card data updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleSearch = async () => {
    if (!searchId) return;
    try {
      const res = await api.get(`/management/idcards/${searchId}`);
      setCardData(res.data.data);
    } catch (err) { toast.error('Student not found'); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>ID Card Management</h1></div>
      <div className="detail-grid">
        <div className="card">
          <h3>Add / Update ID Card</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Student ID</label><input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Card Number</label><input value={form.cardNumber} onChange={e => setForm({ ...form, cardNumber: e.target.value })} className="form-input" required /></div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Issue Date</label><input type="date" value={form.issueDate} onChange={e => setForm({ ...form, issueDate: e.target.value })} className="form-input" /></div>
              <div className="form-group"><label className="form-label">Expiry Date</label><input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="form-input" /></div>
            </div>
            <div className="form-group"><label className="form-label">Photo URL</label><input value={form.photoUrl} onChange={e => setForm({ ...form, photoUrl: e.target.value })} className="form-input" /></div>
            <div className="form-group"><label className="form-label">Barcode</label><input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} className="form-input" /></div>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Saving...' : 'Save ID Card'}</button>
          </form>
        </div>
        <div className="card">
          <h3>View Student ID Card</h3>
          <div className="search-form mb-1">
            <input value={searchId} onChange={e => setSearchId(e.target.value)} className="form-input" placeholder="Student ID" />
            <button onClick={handleSearch} className="btn btn-primary btn-sm">Search</button>
          </div>
          {cardData && (
            <div className="id-card-preview">
              <div className="detail-row"><span>Name</span><span>{cardData.name}</span></div>
              <div className="detail-row"><span>Email</span><span>{cardData.email}</span></div>
              <div className="detail-row"><span>Roll No</span><span>{cardData.rollNumber || '—'}</span></div>
              <div className="detail-row"><span>Department</span><span>{cardData.department || '—'}</span></div>
              <div className="detail-row"><span>Card No</span><span>{cardData.idCardData?.cardNumber || '—'}</span></div>
              <div className="detail-row"><span>Expiry</span><span>{cardData.idCardData?.expiryDate ? new Date(cardData.idCardData.expiryDate).toLocaleDateString() : '—'}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IDCardManager;
