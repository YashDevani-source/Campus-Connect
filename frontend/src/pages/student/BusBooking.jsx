import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineClock, HiOutlineTicket } from 'react-icons/hi';

const BusBooking = () => {
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [booking, setBooking] = useState(false);
  const [tab, setTab] = useState('schedules');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [sched, book] = await Promise.allSettled([
        api.get('/student/bus/schedule', { params: selectedDate ? { date: selectedDate } : {} }),
        api.get('/student/bus/bookings'),
      ]);
      if (sched.status === 'fulfilled') setSchedules(sched.value.data.data || []);
      if (book.status === 'fulfilled') setBookings(book.value.data.data || []);
    } catch { }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [selectedDate]);

  const handleBook = async () => {
    if (!selectedSchedule || selectedSeat === null) return toast.error('Select a schedule and seat');
    setBooking(true);
    try {
      await api.post('/student/bus/book', { scheduleId: selectedSchedule._id, seatNumber: selectedSeat });
      toast.success('Seat booked successfully!');
      setSelectedSchedule(null);
      setSelectedSeat(null);
      fetchData();
    } catch (err) { toast.error(err.response?.data?.error || 'Booking failed'); }
    finally { setBooking(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /><p>Loading transport...</p></div>;

  return (
    <div className="page-container animate-fade-in">
      <button onClick={() => navigate(-1)} className="back-btn"><HiOutlineArrowLeft /> Back</button>

      <div className="page-header">
        <h1><HiOutlineTruck style={{ marginRight: '0.5rem' }} /> Bus Booking</h1>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${tab === 'schedules' ? 'active' : ''}`} onClick={() => setTab('schedules')}>
          <HiOutlineCalendar /> Schedules
        </button>
        <button className={`tab-btn ${tab === 'bookings' ? 'active' : ''}`} onClick={() => setTab('bookings')}>
          <HiOutlineTicket /> My Bookings ({bookings.length})
        </button>
      </div>

      {tab === 'schedules' && (
        <>
          {/* Date filter */}
          <div className="filter-row" style={{ marginBottom: '1.5rem' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="form-input"
              style={{ maxWidth: '250px' }}
            />
            {selectedDate && <button onClick={() => setSelectedDate('')} className="btn btn-sm btn-ghost">Clear</button>}
          </div>

          {schedules.length === 0 ? (
            <div className="empty-state-card">
              <HiOutlineTruck style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>No Schedules</h3>
              <p>{selectedDate ? 'No buses scheduled for this date.' : 'No upcoming bus schedules.'}</p>
            </div>
          ) : (
            <div className="bus-schedule-grid">
              {schedules.map((s, i) => (
                <div
                  key={s._id}
                  className={`bus-card animate-scale-in ${selectedSchedule?._id === s._id ? 'bus-card-selected' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                  onClick={() => { setSelectedSchedule(s); setSelectedSeat(null); }}
                >
                  <div className="bus-card-route">
                    <HiOutlineLocationMarker style={{ color: 'var(--success)' }} />
                    <span>{s.route?.origin}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span>{s.route?.destination}</span>
                  </div>
                  <div className="bus-card-info">
                    <span><HiOutlineClock /> {s.departureTime} - {s.arrivalTime}</span>
                    <span><HiOutlineCalendar /> {new Date(s.date).toLocaleDateString()}</span>
                  </div>
                  <div className="bus-card-meta">
                    <span className="badge">{s.busNumber}</span>
                    <span className="badge badge-default">{s.busType || 'Non-AC'}</span>
                    <span className={`badge ${s.availableSeats > 5 ? 'badge-success' : s.availableSeats > 0 ? 'badge-pending' : 'badge-danger'}`}>
                      {s.availableSeats} seats left
                    </span>
                    {s.route?.fare > 0 && <span className="badge">₹{s.route.fare}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Seat selection */}
          {selectedSchedule && selectedSchedule.availableSeats > 0 && (
            <div className="seat-selection-panel animate-fade-in" style={{ marginTop: '1.5rem' }}>
              <h3 className="section-title"><HiOutlineTicket /> Select Seat — {selectedSchedule.busNumber}</h3>
              <div className="seat-grid">
                {Array.from({ length: selectedSchedule.totalSeats || 30 }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    className={`seat-btn ${selectedSeat === num ? 'seat-selected' : ''}`}
                    onClick={() => setSelectedSeat(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button onClick={handleBook} className="btn btn-primary" disabled={booking || selectedSeat === null} style={{ marginTop: '1rem' }}>
                {booking ? 'Booking...' : `Book Seat ${selectedSeat || ''}`}
              </button>
            </div>
          )}
        </>
      )}

      {tab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <div className="empty-state-card">
              <HiOutlineTicket style={{ fontSize: '3rem', color: 'var(--text-muted)' }} />
              <h3>No Bookings</h3>
              <p>You haven't booked any bus seats yet.</p>
            </div>
          ) : (
            <div className="bus-schedule-grid">
              {bookings.map((b, i) => (
                <div key={b._id} className="bus-card animate-scale-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="bus-card-route">
                    <HiOutlineLocationMarker style={{ color: 'var(--success)' }} />
                    <span>{b.schedule?.route?.origin || '—'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <span>{b.schedule?.route?.destination || '—'}</span>
                  </div>
                  <div className="bus-card-info">
                    <span>Seat: <strong>{b.seatNumber}</strong></span>
                    <span>Bus: {b.schedule?.busNumber || '—'}</span>
                  </div>
                  <div className="bus-card-meta">
                    <span className={`badge ${b.status === 'booked' ? 'badge-success' : 'badge-danger'}`}>{b.status}</span>
                    <span className="badge badge-default">{b.schedule?.date ? new Date(b.schedule.date).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BusBooking;
