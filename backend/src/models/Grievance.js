const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
});

const grievanceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    category: {
      type: String,
      enum: ['academic', 'infrastructure', 'hostel', 'ragging', 'sexual-harassment', 'other'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'in-review', 'resolved'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    comments: [commentSchema],
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true }
);

grievanceSchema.index({ submittedBy: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ category: 1 });
grievanceSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Grievance', grievanceSchema);
