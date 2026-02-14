const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileType: {
      type: String,
      enum: ['pdf', 'doc', 'ppt', 'video', 'other'],
      default: 'other',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

resourceSchema.index({ course: 1 });
resourceSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Resource', resourceSchema);
