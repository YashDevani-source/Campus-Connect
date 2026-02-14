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
      type: String, // e.g., "08:30 AM"
      required: true
    },
    arrivalTime: {
      type: String, // e.g., "09:30 AM"
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
    }
  },
  { timestamps: true }
);

// Index for efficient searching
busScheduleSchema.index({ route: 1, date: 1 });

module.exports = mongoose.model('BusSchedule', busScheduleSchema);
