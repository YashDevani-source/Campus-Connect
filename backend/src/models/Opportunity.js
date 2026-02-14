const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 2000,
    },
    type: {
      type: String,
      enum: ['internship', 'research', 'project'],
      required: true,
    },
    department: {
      type: String,
      trim: true,
    },
    eligibility: {
      type: String,
      maxlength: 500,
    },
    deadline: {
      type: Date,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

opportunitySchema.index({ type: 1 });
opportunitySchema.index({ isActive: 1 });
opportunitySchema.index({ deadline: 1 });
opportunitySchema.index({ postedBy: 1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
