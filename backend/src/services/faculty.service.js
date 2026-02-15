const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Marks = require('../models/Marks');
const Doubt = require('../models/Doubt');
const User = require('../models/User');
const Resource = require('../models/Resource');

exports.getMyCourses = async (facultyId) => {
  return Course.find({ instructor: facultyId, status: 'approved' })
    .populate('enrolledStudents', 'name email rollNumber')
    .sort({ createdAt: -1 })
    .lean();
};

exports.getStudentsInCourse = async (courseId, facultyId, query = {}) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId })
    .populate('enrolledStudents', 'name email rollNumber department academicYear');
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  let students = course.enrolledStudents;
  if (query.search) {
    const regex = new RegExp(query.search, 'i');
    students = students.filter(s => regex.test(s.name) || regex.test(s.rollNumber));
  }
  return students;
};

exports.createCourseAsFaculty = async (data, facultyId) => {
  data.instructor = facultyId;
  data.status = 'pending';
  data.createdByRole = 'faculty';
  const course = await Course.create(data);
  return course;
};

exports.addResource = async (courseId, facultyId, resourceData) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  resourceData.course = courseId;
  resourceData.uploadedBy = facultyId;
  return Resource.create(resourceData);
};

exports.setAttendanceReq = async (courseId, facultyId, requiredAttendance) => {
  const course = await Course.findOneAndUpdate(
    { _id: courseId, instructor: facultyId },
    { requiredAttendance },
    { new: true }
  );
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return course;
};

exports.markAttendance = async (courseId, facultyId, date, records) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  // Upsert attendance for the date
  const attendance = await Attendance.findOneAndUpdate(
    { course: courseId, date: new Date(date) },
    {
      course: courseId,
      date: new Date(date),
      markedBy: facultyId,
      records,
    },
    { upsert: true, new: true }
  );
  return attendance;
};

exports.getAttendanceRecords = async (courseId, facultyId, query = {}) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const filter = { course: courseId };
  if (query.date) filter.date = new Date(query.date);

  return Attendance.find(filter)
    .populate('records.student', 'name rollNumber')
    .sort({ date: -1 })
    .lean();
};

exports.getAttendanceAnalytics = async (courseId, facultyId) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId })
    .populate('enrolledStudents', 'name rollNumber');
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const attendanceRecords = await Attendance.find({ course: courseId }).lean();
  const totalClasses = attendanceRecords.length;

  const studentStats = {};
  course.enrolledStudents.forEach(s => {
    studentStats[s._id.toString()] = {
      student: { _id: s._id, name: s.name, rollNumber: s.rollNumber },
      totalClasses,
      present: 0,
      absent: 0,
      late: 0,
      percentage: 0,
    };
  });

  attendanceRecords.forEach(record => {
    record.records.forEach(r => {
      const sid = r.student.toString();
      if (studentStats[sid]) {
        studentStats[sid][r.status]++;
      }
    });
  });

  // Calculate percentages
  Object.values(studentStats).forEach(stat => {
    stat.percentage = totalClasses > 0
      ? Math.round(((stat.present + stat.late) / totalClasses) * 100)
      : 0;
    stat.belowRequired = stat.percentage < course.requiredAttendance;
  });

  return {
    totalClasses,
    requiredAttendance: course.requiredAttendance,
    students: Object.values(studentStats),
  };
};

exports.assignMarks = async (courseId, facultyId, marksData) => { // Check course ownership
  if (!courseId || !facultyId) {
    throw new Error('Invalid parameters');
  }
  console.log(`Assign Marks Request: courseId=${courseId}, facultyId=${facultyId}, data=${JSON.stringify(marksData)}`);
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const { assessmentType, title, maxMarks, weightage, marks } = marksData;
  const results = [];
  const errors = [];

  // Sequential processing
  for (const item of marks) {
    const { student, obtainedMarks } = item;
    try {
      if (!student) throw new Error('Student ID missing');

      // Ensure student is just the ID string if it came as object (though Joi handles this)
      const studentId = typeof student === 'object' ? student.id || student._id : student;

      let markDoc = await Marks.findOne({ course: courseId, student: studentId });
      if (!markDoc) {
        // Create new if not exists
        markDoc = new Marks({ course: courseId, student: studentId, assessments: [] });
      }

      // Check if assessment exists
      const existingAssessIndex = markDoc.assessments.findIndex(
        (a) => a.type === assessmentType && a.title === title
      );

      if (existingAssessIndex >= 0) {
        // Update existing assessment
        markDoc.assessments[existingAssessIndex].obtainedMarks = obtainedMarks;
        markDoc.assessments[existingAssessIndex].maxMarks = maxMarks;
        markDoc.assessments[existingAssessIndex].weightage = weightage;
      } else {
        // Add new assessment
        markDoc.assessments.push({
          type: assessmentType,
          title,
          maxMarks,
          obtainedMarks,
          weightage,
        });
      }

      // Save triggers calculation
      await markDoc.save();
      results.push(markDoc);
    } catch (e) {
      console.error(`Failed to save marks for student ${student}:`, e);
      errors.push(`Failed for student ${student}: ${e.message}`);
    }
  }

  if (errors.length > 0 && results.length === 0) {
    // If all failed
    throw new Error(`Mark assignment failed: ${errors.join(', ')}`);
  }

  return results;
};

exports.getCourseMarks = async (courseId, facultyId) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  return Marks.find({ course: courseId })
    .populate('student', 'name rollNumber email')
    .lean();
};

exports.getCourseDoubts = async (courseId, facultyId) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  return Doubt.find({ course: courseId })
    .populate('askedBy', 'name rollNumber profilePhoto')
    .populate('replies.author', 'name role profilePhoto')
    .sort({ updatedAt: -1 })
    .lean();
};

exports.replyToDoubt = async (doubtId, facultyId, content) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) {
    const err = new Error('Doubt not found');
    err.statusCode = 404;
    throw err;
  }

  doubt.replies.push({ content, author: facultyId });
  await doubt.save();
  return doubt;
};

exports.resolveDoubt = async (doubtId, facultyId) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) {
    const err = new Error('Doubt not found');
    err.statusCode = 404;
    throw err;
  }

  doubt.isResolved = true;
  await doubt.save();
  return doubt;
};

exports.updateGrade = async (courseId, facultyId, { studentId, grade }) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const marks = await Marks.findOne({ course: courseId, student: studentId });
  if (!marks) {
    // Maybe create if doesn't exist? But grading usually happens after marks.
    // Let's create a blank record if needed, but safer to assume marks exist.
    // If not, we can create one.
    const newMarks = new Marks({
      course: courseId,
      student: studentId,
      assessments: [], // No assessments yet
      grade: grade, // Set manual grade
      isManualGrade: true,
      totalWeighted: 0
    });
    // Need to handle grade points manually? Or use helper.
    // For simplicity, let's just save.
    // We should probably map grade to points if possible, but let's stick to just saving for now.
    await newMarks.save();
    return newMarks;
  }

  marks.grade = grade;
  marks.isManualGrade = true;
  await marks.save();
  return marks;
};
