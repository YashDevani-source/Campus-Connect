const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
});

const applicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: {
      type: String,
      maxlength: 2000,
    },
    resumeUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'accepted', 'rejected'],
      default: 'applied',
    },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

applicationSchema.index({ opportunity: 1, applicant: 1 }, { unique: true });
applicationSchema.index({ status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
