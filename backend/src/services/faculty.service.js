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

exports.assignMarks = async (courseId, facultyId, marksData) => {
  const course = await Course.findOne({ _id: courseId, instructor: facultyId });
  if (!course) {
    const err = new Error('Course not found or access denied');
    err.statusCode = 404;
    throw err;
  }

  const { assessmentType, title, maxMarks, weightage, marks: studentMarks } = marksData;
  const results = [];

  for (const sm of studentMarks) {
    let marksDoc = await Marks.findOne({ course: courseId, student: sm.student });
    if (!marksDoc) {
      marksDoc = new Marks({ course: courseId, student: sm.student, assessments: [] });
    }

    // Check if this assessment type+title already exists
    const existingIndex = marksDoc.assessments.findIndex(
      a => a.type === assessmentType && a.title === title
    );

    const assessment = {
      type: assessmentType,
      title,
      maxMarks,
      obtainedMarks: sm.obtainedMarks,
      weightage,
    };

    if (existingIndex >= 0) {
      marksDoc.assessments[existingIndex] = assessment;
    } else {
      marksDoc.assessments.push(assessment);
    }

    await marksDoc.save(); // triggers pre-save grade calculation
    results.push(marksDoc);
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
    .sort({ createdAt: -1 })
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
