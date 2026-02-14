import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlineTicket, HiOutlineClock, HiOutlineLocationMarker, HiOutlineCalendar, HiOutlineQrcode } from 'react-icons/hi';
import api from '../../api/axios';
import { toast } from 'react-hot-toast';

const Transport = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [schedules, setSchedules] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Search State
  const [search, setSearch] = useState({ from: '', to: '', date: new Date().toISOString().split('T')[0] });

  // Booking Modal State
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Fetch booked seats when a schedule is selected
  useEffect(() => {
    if (selectedSchedule) {
      const fetchSeats = async () => {
        try {
          const res = await api.get(`/transport/schedule/${selectedSchedule._id}/seats`);
          setBookedSeats(res.data.data);
        } catch (error) {
          console.error('Failed to fetch seats', error);
        }
      };
      fetchSeats();
    } else {
        setBookedSeats([]);
        setSelectedSeat(null);
    }
  }, [selectedSchedule]);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/transport/bookings');
      setBookings(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.from || !search.to) return toast.error('Please fill in From and To');

    setLoading(true);
    try {
      const res = await api.get(`/transport/search?from=${search.from}&to=${search.to}&date=${search.date}`);
      setSchedules(res.data.data);
      if (res.data.data.length === 0) toast('No buses found for this route');
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSeat) return toast.error('Please select a seat');
    
    try {
      await api.post('/transport/book', {
        scheduleId: selectedSchedule._id,
        seatNumber: selectedSeat
      });
      toast.success('Booking confirmed!');
      setSelectedSchedule(null);
      setSelectedSeat(null);
      fetchBookings();
      // Refresh search results to update available seats
      handleSearch({ preventDefault: () => {} });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Booking failed');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Transport & Bookings</h1>
          <p className="subtitle">Manage your campus commute</p>
        </div>
        <div className="navbar-links" style={{ background: 'var(--bg-card)', padding: '0.25rem' }}>
          <button 
            className={`btn btn-ghost btn-sm ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
            style={{ 
              borderRadius: '99px',
              background: activeTab === 'schedule' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'schedule' ? 'white' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            Bus Schedule
          </button>
          <button 
            className={`btn btn-ghost btn-sm ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
            style={{ 
              borderRadius: '99px',
              background: activeTab === 'bookings' ? 'var(--accent)' : 'transparent',
              color: activeTab === 'bookings' ? 'white' : 'var(--text-secondary)',
              border: 'none'
            }}
          >
            My Tickets
          </button>
        </div>
      </div>

      {activeTab === 'schedule' ? (
        <div className="animate-fade-in">
          {/* Search Card */}
          <div className="detail-card glass-card mb-6" style={{ marginBottom: '2rem' }}>
            <form onSubmit={handleSearch} className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', alignItems: 'end' }}>
              <div className="form-group">
                <label><HiOutlineLocationMarker /> From</label>
                <input type="text" placeholder="e.g. North Campus" value={search.from} onChange={e => setSearch({...search, from: e.target.value})} />
              </div>
              <div className="form-group">
                <label><HiOutlineLocationMarker /> To</label>
                <input type="text" placeholder="e.g. South Campus" value={search.to} onChange={e => setSearch({...search, to: e.target.value})} />
              </div>
              <div className="form-group">
                <label><HiOutlineCalendar /> Date</label>
                <input type="date" value={search.date} onChange={e => setSearch({...search, date: e.target.value})} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ height: '42px' }}>
                <HiOutlineSearch size={18} /> {loading ? 'Searching...' : 'Find Buses'}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="card-list">
            {schedules.map(schedule => (
              <div key={schedule._id} className="list-card glass-card animate-slide-up">
                <div className="list-card-info">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <h4>{schedule.route.origin} <span style={{ color: 'var(--text-muted)' }}>➝</span> {schedule.route.destination}</h4>
                    <span className="badge badge-info">Bus #{schedule.busNumber}</span>
                  </div>
                  <div className="list-card-meta">
                    <span><HiOutlineClock /> {schedule.departureTime} - {schedule.arrivalTime}</span>
                    <span>•</span>
                    <span>₹{schedule.route.fare}</span>
                    <span>•</span>
                    <span style={{ color: schedule.availableSeats < 5 ? 'var(--danger)' : 'var(--success)' }}>
                      {schedule.availableSeats} seats left
                    </span>
                  </div>
                </div>
                <div className="list-card-actions">
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => setSelectedSchedule(schedule)}
                    disabled={schedule.availableSeats === 0}
                  >
                    Select Seats
                  </button>
                </div>
              </div>
            ))}
            {schedules.length === 0 && !loading && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <HiOutlineSearch style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                <p>Search for buses to see schedules here.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid-cards animate-fade-in">
          {bookings.map(booking => (
            <div key={booking._id} className="grid-card glass-card ticket-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, height: '6px', 
                background: 'var(--gradient-primary)' 
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem', paddingTop: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem' }}>{booking.schedule.route.origin}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>to {booking.schedule.route.destination}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--accent)' }}>
                    {booking.schedule.departureTime}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(booking.schedule.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                borderTop: '1px dashed var(--border)', 
                borderBottom: '1px dashed var(--border)', 
                padding: '1rem 0', margin: '0.5rem 0',
                display: 'flex', justifyContent: 'space-between'
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Passenger</p>
                  <p style={{ fontWeight: '600' }}>You</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Seat</p>
                  <p style={{ fontWeight: '600' }}>{booking.seatNumber}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bus</p>
                  <p style={{ fontWeight: '600' }}>{booking.schedule.busNumber}</p>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                 <HiOutlineQrcode style={{ fontSize: '4rem', color: 'var(--text-secondary)' }} />
                 <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Scan valid at entry</p>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <HiOutlineTicket style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                <p>No active tickets found.</p>
              </div>
          )}
        </div>
      )}

      {/* Booking Modal */}
      {selectedSchedule && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', 
          backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }} onClick={() => setSelectedSchedule(null)}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem', background: 'var(--bg-card)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Select Seat
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSchedule(null)}>✕</button>
            </h3>
            
            <div style={{ 
              display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', 
              marginBottom: '2rem', maxHeight: '300px', overflowY: 'auto' 
            }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(num => {
                const isBooked = bookedSeats.includes(num);
                return (
                  <button
                    key={num}
                    disabled={isBooked}
                    onClick={() => setSelectedSeat(num)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: selectedSeat === num ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: isBooked ? 'var(--border)' : selectedSeat === num ? 'var(--accent-glow)' : 'var(--bg-card)',
                      color: isBooked ? 'var(--text-muted)' : 'var(--text-primary)',
                      cursor: isBooked ? 'not-allowed' : 'pointer',
                      opacity: isBooked ? 0.6 : 1,
                      textDecoration: isBooked ? 'line-through' : 'none'
                    }}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            <div className="form-actions">
              <button className="btn btn-ghost" onClick={() => setSelectedSchedule(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBook} disabled={!selectedSeat}>
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transport;
