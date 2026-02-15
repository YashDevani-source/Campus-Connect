const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: 200,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    department: {
      type: String,
      trim: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: String,
      trim: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // New fields
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
    createdByRole: {
      type: String,
      enum: ['faculty', 'admin'],
    },
    requiredAttendance: {
      type: Number,
      default: 75,
      min: 0,
      max: 100,
    },
    credits: {
      type: Number,
      default: 3,
    },
  },
  { timestamps: true }
);

courseSchema.index({ instructor: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ status: 1 });

module.exports = mongoose.model('Course', courseSchema);
