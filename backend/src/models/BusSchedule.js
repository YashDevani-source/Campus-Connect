const mongoose = require('mongoose');

const busScheduleSchema = new mongoose.Schema(
  {
    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BusRoute',
      required: true
    },
    busNumber: {
      type: String,
      required: true,
      trim: true
    },
    departureTime: {
      type: String,
      required: true
    },
    arrivalTime: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    totalSeats: {
      type: Number,
      default: 30
    },
    availableSeats: {
      type: Number,
      default: 30
    },
    status: {
      type: String,
      enum: ['scheduled', 'running', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    // New fields
    driverName: { type: String, trim: true },
    driverPhone: { type: String, trim: true },
    busType: { type: String, enum: ['AC', 'Non-AC', 'Mini'], default: 'Non-AC' },
    seatLayout: {
      rows: { type: Number, default: 10 },
      seatsPerRow: { type: Number, default: 3 }
    }
  },
  { timestamps: true }
);

busScheduleSchema.index({ route: 1, date: 1 });

module.exports = mongoose.model('BusSchedule', busScheduleSchema);
