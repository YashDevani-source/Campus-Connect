const BusRoute = require('../models/BusRoute');
const BusSchedule = require('../models/BusSchedule');
const Booking = require('../models/Booking');

// Get all available routes (for dropdowns)
exports.getRoutes = async (req, res, next) => {
  try {
    const routes = await BusRoute.find({ isActive: true });
    res.status(200).json({ success: true, data: routes });
  } catch (error) {
    next(error);
  }
};

// Search for buses
exports.searchBuses = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;

    // 1. Find the route matching origin and destination
    const route = await BusRoute.findOne({ 
      origin: { $regex: new RegExp(from, 'i') }, 
      destination: { $regex: new RegExp(to, 'i') },
      isActive: true 
    });

    if (!route) {
      return res.status(200).json({ success: true, data: [] });
    }

    // 2. Find schedules for this route on the given date
    // Note: In a real app, date parsing needs to be more robust to handle timezones
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

    const schedules = await BusSchedule.find({
      route: route._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['scheduled', 'running'] }
    }).populate('route', 'origin destination fare stops');

    res.status(200).json({ success: true, data: schedules });
  } catch (error) {
    next(error);
  }
};

// Book a seat
exports.bookSeat = async (req, res, next) => {
  try {
    const { scheduleId, seatNumber } = req.body;
    const userId = req.user.id;

    // 1. Check if schedule exists and has space
    const schedule = await BusSchedule.findById(scheduleId);
    if (!schedule) {
      const err = new Error('Bus schedule not found');
      err.statusCode = 404;
      throw err;
    }

    if (schedule.availableSeats <= 0) {
      const err = new Error('Bus is full');
      err.statusCode = 400;
      throw err;
    }

    // 2. Check if seat is already booked
    const existingBooking = await Booking.findOne({
      schedule: scheduleId,
      seatNumber: seatNumber,
      status: 'booked'
    });

    if (existingBooking) {
      const err = new Error('Seat already booked');
      err.statusCode = 400;
      throw err;
    }

    // 3. Create Booking
    const booking = await Booking.create({
      user: userId,
      schedule: scheduleId,
      seatNumber
    });

    // 4. Update available seats
    schedule.availableSeats -= 1;
    await schedule.save();

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// Get user's bookings
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate({
        path: 'schedule',
        populate: { path: 'route', select: 'origin destination fare' }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

// Get booked seats for a schedule
exports.getScheduleSeats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookings = await Booking.find({ schedule: id, status: 'booked' }).select('seatNumber');
    const bookedSeats = bookings.map(b => b.seatNumber);
    res.status(200).json({ success: true, data: bookedSeats });
  } catch (error) {
    next(error);
  }
};
