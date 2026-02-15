import { useState } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BusManager = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [detailsForm, setDetailsForm] = useState({ scheduleId: '', driverName: '', driverPhone: '', busType: 'Non-AC' });

  const handleCSVUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Select a CSV file'); return; }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/management/bus/schedule/csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.data);
      toast.success(`${res.data.data.created} schedules created`);
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDetailsUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/management/bus/details', detailsForm);
      toast.success('Bus details updated');
      setDetailsForm({ scheduleId: '', driverName: '', driverPhone: '', busType: 'Non-AC' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="page-container">
      <div className="page-header"><h1>Bus Management</h1></div>
      <div className="detail-grid">
        <div className="card">
          <h3>Upload Bus Schedule (CSV)</h3>
          <p className="text-muted mb-1">CSV headers: routeNumber, origin, destination, stops, fare, busNumber, departureTime, arrivalTime, date, totalSeats, driverName, driverPhone, busType</p>
          <form onSubmit={handleCSVUpload}>
            <input type="file" accept=".csv" onChange={e => setFile(e.target.files[0])} className="form-input mb-1" />
            <button type="submit" disabled={uploading} className="btn btn-primary">{uploading ? 'Uploading...' : 'Upload CSV'}</button>
          </form>
          {result && <p className="mt-1 text-success">✓ {result.created} schedules created</p>}
        </div>

        <div className="card">
          <h3>Update Bus & Driver Details</h3>
          <form onSubmit={handleDetailsUpdate}>
            <div className="form-group"><label className="form-label">Schedule ID</label><input value={detailsForm.scheduleId} onChange={e => setDetailsForm({ ...detailsForm, scheduleId: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Driver Name</label><input value={detailsForm.driverName} onChange={e => setDetailsForm({ ...detailsForm, driverName: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Driver Phone</label><input value={detailsForm.driverPhone} onChange={e => setDetailsForm({ ...detailsForm, driverPhone: e.target.value })} className="form-input" required /></div>
            <div className="form-group"><label className="form-label">Bus Type</label><select value={detailsForm.busType} onChange={e => setDetailsForm({ ...detailsForm, busType: e.target.value })} className="form-select"><option>AC</option><option>Non-AC</option><option>Mini</option></select></div>
            <button type="submit" className="btn btn-primary">Update Details</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BusManager;
