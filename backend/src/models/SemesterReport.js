const mongoose = require('mongoose');

const semesterReportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    courses: [
      {
        course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        courseCode: String,
        courseTitle: String,
        credits: Number,
        grade: String,
        gradePoint: Number,
      },
    ],
    sgpa: { type: Number, default: 0 },
    cgpa: { type: Number, default: 0 },
    totalCredits: { type: Number, default: 0 },
    totalCreditsEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);

semesterReportSchema.index({ student: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('SemesterReport', semesterReportSchema);
