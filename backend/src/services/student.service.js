const Doubt = require('../models/Doubt');
const ChatMessage = require('../models/ChatMessage');
const BusSchedule = require('../models/BusSchedule');
const BusRoute = require('../models/BusRoute');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const Marks = require('../models/Marks');
const Attendance = require('../models/Attendance');
const SemesterReport = require('../models/SemesterReport');
const User = require('../models/User');
const Course = require('../models/Course');

// ─── Doubts ───
exports.getCourseDoubts = async (courseId, userId) => {
  // Verify student is enrolled
  const course = await Course.findOne({
    _id: courseId,
    enrolledStudents: userId
  });

  if (!course) {
    const err = new Error('Course not found or access denied (not enrolled)');
    err.statusCode = 403;
    throw err;
  }

  return Doubt.find({ course: courseId })
    .populate('askedBy', 'name rollNumber profilePhoto')
    .populate('replies.author', 'name role profilePhoto')
    .sort({ createdAt: -1 })
    .lean();
};

exports.askDoubt = async (courseId, userId, doubtData) => {
  const course = await Course.findOne({
    _id: courseId,
    enrolledStudents: userId
  });

  if (!course) {
    const err = new Error('Course not found or access denied (not enrolled)');
    err.statusCode = 403;
    throw err;
  }

  return Doubt.create({
    course: courseId,
    title: doubtData.title,
    description: doubtData.description,
    askedBy: userId,
    tags: doubtData.tags || [],
  });
};

exports.replyToDoubt = async (doubtId, userId, content) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) {
    const err = new Error('Doubt not found');
    err.statusCode = 404;
    throw err;
  }

  doubt.replies.push({ content, author: userId });
  await doubt.save();
  return doubt;
};

// ─── Chat ───
exports.getConversations = async (userId) => {
  const messages = await ChatMessage.aggregate([
    { $match: { $or: [{ sender: userId }, { receiver: userId }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$content' },
        lastDate: { $first: '$createdAt' },
        sender: { $first: '$sender' },
        receiver: { $first: '$receiver' },
        unreadCount: {
          $sum: { $cond: [{ $and: [{ $eq: ['$receiver', userId] }, { $eq: ['$read', false] }] }, 1, 0] },
        },
      },
    },
    { $sort: { lastDate: -1 } },
  ]);

  // Populate the other user's info
  const mongoose = require('mongoose');
  const conversations = [];
  for (const msg of messages) {
    const otherUserId = msg.sender.toString() === userId.toString() ? msg.receiver : msg.sender;
    const otherUser = await User.findById(otherUserId).select('name email profilePhoto role').lean();
    conversations.push({
      conversationId: msg._id,
      otherUser,
      lastMessage: msg.lastMessage,
      lastDate: msg.lastDate,
      unreadCount: msg.unreadCount,
    });
  }

  return conversations;
};

exports.getMessages = async (userId, otherUserId) => {
  const conversationId = ChatMessage.getConversationId(userId, otherUserId);

  // Mark messages as read
  await ChatMessage.updateMany(
    { conversationId, receiver: userId, read: false },
    { read: true }
  );

  return ChatMessage.find({ conversationId })
    .populate('sender', 'name profilePhoto role')
    .populate('receiver', 'name profilePhoto role')
    .sort({ createdAt: 1 })
    .lean();
};

exports.sendMessage = async (senderId, receiverId, content) => {
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }

  const conversationId = ChatMessage.getConversationId(senderId, receiverId);
  return ChatMessage.create({
    sender: senderId,
    receiver: receiverId,
    content,
    conversationId,
  });
};

// ─── Bus ───
exports.getBusSchedule = async (query = {}) => {
  const filter = { status: { $in: ['scheduled', 'running'] } };

  if (query.date) {
    const searchDate = new Date(query.date);
    const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));
    filter.date = { $gte: startOfDay, $lte: endOfDay };
  }

  return BusSchedule.find(filter)
    .populate('route')
    .sort({ date: 1, departureTime: 1 })
    .lean();
};

exports.bookSeat = async (userId, scheduleId, seatNumber) => {
  const schedule = await BusSchedule.findById(scheduleId);
  if (!schedule) {
    const err = new Error('Bus schedule not found');
    err.statusCode = 404;
    throw err;
  }

  if (schedule.availableSeats <= 0) {
    const err = new Error('Bus is full');
    err.statusCode = 400;
    throw err;
  }

  const existingBooking = await Booking.findOne({
    schedule: scheduleId,
    seatNumber,
    status: 'booked',
  });

  if (existingBooking) {
    const err = new Error('Seat already booked');
    err.statusCode = 400;
    throw err;
  }

  const booking = await Booking.create({
    user: userId,
    schedule: scheduleId,
    seatNumber,
  });

  schedule.availableSeats -= 1;
  await schedule.save();

  return booking;
};

exports.getMyBookings = async (userId) => {
  return Booking.find({ user: userId })
    .populate({
      path: 'schedule',
      populate: { path: 'route', select: 'origin destination fare' },
    })
    .sort({ createdAt: -1 })
    .lean();
};

// ─── Payments ───
exports.makePayment = async (userId, paymentId) => {
  const payment = await Payment.findOne({ _id: paymentId, student: userId, status: 'pending' });
  if (!payment) {
    const err = new Error('Payment not found or already completed');
    err.statusCode = 404;
    throw err;
  }

  payment.status = 'completed';
  payment.transactionId = `DUM_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  payment.method = 'dummy';
  payment.paidAt = new Date();
  await payment.save();

  // Update user fee status
  const user = await User.findById(userId);
  user.feeStatus.paidAmount = (user.feeStatus.paidAmount || 0) + payment.amount;
  user.feeStatus.payments.push({
    amount: payment.amount,
    transactionId: payment.transactionId,
    method: 'dummy',
    status: 'completed',
  });
  await user.save();

  return payment;
};

exports.getMyPayments = async (userId) => {
  return Payment.find({ student: userId })
    .sort({ createdAt: -1 })
    .lean();
};

// ─── Profile ───
exports.getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  // Only allow certain fields to be updated by student
  const allowedFields = ['name', 'personalInfo', 'parentDetails', 'skills', 'projects', 'profilePhoto'];
  const sanitized = {};
  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) sanitized[field] = updateData[field];
  });

  const user = await User.findByIdAndUpdate(userId, sanitized, { new: true, runValidators: true });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

// ─── Semester Report & CGPA ───
exports.getSemesterReport = async (userId) => {
  return SemesterReport.find({ student: userId })
    .populate('courses.course', 'title code')
    .sort({ semester: 1 })
    .lean();
};

exports.getCGPA = async (userId) => {
  const reports = await SemesterReport.find({ student: userId }).sort({ semester: 1 }).lean();
  const user = await User.findById(userId).select('cgpa').lean();

  let totalCredits = 0;
  let totalGradePoints = 0;

  const semesters = reports.map(r => {
    totalCredits += r.totalCreditsEarned || 0;
    totalGradePoints += (r.sgpa || 0) * (r.totalCreditsEarned || 0);
    return {
      semester: r.semester,
      academicYear: r.academicYear,
      sgpa: r.sgpa,
      totalCredits: r.totalCredits,
      totalCreditsEarned: r.totalCreditsEarned,
      courses: r.courses,
    };
  });

  const cgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;

  return { semesters, cgpa, totalCreditsEarned: totalCredits };
};

// ─── Certificates ───
exports.getMyCertificates = async (userId) => {
  return Certificate.find({ student: userId })
    .populate('addedBy', 'name')
    .sort({ issueDate: -1 })
    .lean();
};

// ─── Attendance & Marks ───
exports.getMyAttendance = async (userId, courseId) => {
  const attendanceRecords = await Attendance.find({ course: courseId }).lean();
  let total = attendanceRecords.length;
  let present = 0;
  let absent = 0;
  let late = 0;

  attendanceRecords.forEach(record => {
    const studentRecord = record.records.find(r => r.student.toString() === userId.toString());
    if (studentRecord) {
      if (studentRecord.status === 'present') present++;
      else if (studentRecord.status === 'late') late++;
      else absent++;
    }
  });

  const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return { courseId, total, present, absent, late, percentage };
};

exports.getMyMarks = async (userId, courseId) => {
  const marks = await Marks.findOne({ course: courseId, student: userId }).lean();
  return marks || { assessments: [], totalWeighted: 0, grade: 'N/A', gradePoint: 0 };
};
