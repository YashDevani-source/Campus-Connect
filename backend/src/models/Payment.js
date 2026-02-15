const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['tuition', 'bus', 'hostel', 'other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      sparse: true,
    },
    method: {
      type: String,
      enum: ['dummy', 'razorpay'],
      default: 'dummy',
    },
    description: String,
    dueDate: Date,
    paidAt: Date,
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ transactionId: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
