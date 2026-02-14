const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transport.controller');
const auth = require('../middleware/auth');

// Public/Protected Routes (All require auth for now)
router.get('/routes', auth, transportController.getRoutes);
router.get('/search', auth, transportController.searchBuses);
router.get('/bookings', auth, transportController.getMyBookings);
router.get('/schedule/:id/seats', auth, transportController.getScheduleSeats);
router.post('/book', auth, transportController.bookSeat);

module.exports = router;
