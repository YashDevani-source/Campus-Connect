const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assessments: [
      {
        type: {
          type: String,
          enum: ['quiz', 'midsem', 'endsem', 'assignment'],
          required: true,
        },
        title: String,
        maxMarks: { type: Number, required: true },
        obtainedMarks: { type: Number, required: true },
        weightage: { type: Number, default: 0 },
      },
    ],
    totalWeighted: { type: Number, default: 0 },
    grade: { type: String },
    gradePoint: { type: Number },
  },
  { timestamps: true }
);

marksSchema.index({ course: 1, student: 1 }, { unique: true });

// Auto-calculate totalWeighted and grade before save
marksSchema.pre('save', function () {
  if (this.assessments && this.assessments.length > 0) {
    let totalWeighted = 0;
    let totalWeightage = 0;
    this.assessments.forEach((a) => {
      if (a.maxMarks > 0) {
        totalWeighted += (a.obtainedMarks / a.maxMarks) * a.weightage;
        totalWeightage += a.weightage;
      }
    });
    // Normalize if total weightage isn't 100
    this.totalWeighted = totalWeightage > 0 ? (totalWeighted / totalWeightage) * 100 : 0;

    // Grade mapping
    const score = this.totalWeighted;
    if (score >= 90) { this.grade = 'AA'; this.gradePoint = 10; }
    else if (score >= 80) { this.grade = 'AB'; this.gradePoint = 9; }
    else if (score >= 70) { this.grade = 'BB'; this.gradePoint = 8; }
    else if (score >= 60) { this.grade = 'BC'; this.gradePoint = 7; }
    else if (score >= 50) { this.grade = 'CC'; this.gradePoint = 6; }
    else if (score >= 40) { this.grade = 'CD'; this.gradePoint = 5; }
    else { this.grade = 'F'; this.gradePoint = 0; }
  }
});

module.exports = mongoose.model('Marks', marksSchema);
