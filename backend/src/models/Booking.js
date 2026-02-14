const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    schedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusSchedule',
      required: true
    },
    seatNumber: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked'
    },
    paymentId: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
