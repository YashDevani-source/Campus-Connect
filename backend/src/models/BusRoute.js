const mongoose = require('mongoose');

const busRouteSchema = new mongoose.Schema(
  {
    routeNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    origin: {
      type: String,
      required: true,
      trim: true
    },
    destination: {
      type: String,
      required: true,
      trim: true
    },
    stops: [{
      type: String,
      trim: true
    }],
    fare: {
      type: Number,
      required: true,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('BusRoute', busRouteSchema);
