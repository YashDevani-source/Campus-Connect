const studentService = require('../services/student.service');

// ─── Doubts ───
exports.getCourseDoubts = async (req, res, next) => {
  try {
    const data = await studentService.getCourseDoubts(req.params.courseId, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.askDoubt = async (req, res, next) => {
  try {
    const data = await studentService.askDoubt(req.params.courseId, req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.replyToDoubt = async (req, res, next) => {
  try {
    const data = await studentService.replyToDoubt(req.params.doubtId, req.user.id, req.body.content);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Chat ───
exports.getConversations = async (req, res, next) => {
  try {
    const data = await studentService.getConversations(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getMessages = async (req, res, next) => {
  try {
    const data = await studentService.getMessages(req.user.id, req.params.userId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.sendMessage = async (req, res, next) => {
  try {
    const data = await studentService.sendMessage(req.user.id, req.params.userId, req.body.content);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Bus ───
exports.getBusSchedule = async (req, res, next) => {
  try {
    const data = await studentService.getBusSchedule(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.bookSeat = async (req, res, next) => {
  try {
    const data = await studentService.bookSeat(req.user.id, req.body.scheduleId, req.body.seatNumber);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const data = await studentService.getMyBookings(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Payments ───
exports.makePayment = async (req, res, next) => {
  try {
    const data = await studentService.makePayment(req.user.id, req.body.paymentId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const data = await studentService.getMyPayments(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Profile ───
exports.getProfile = async (req, res, next) => {
  try {
    const data = await studentService.getProfile(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const data = await studentService.updateProfile(req.user.id, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Reports ───
exports.getSemesterReport = async (req, res, next) => {
  try {
    const data = await studentService.getSemesterReport(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getCGPA = async (req, res, next) => {
  try {
    const data = await studentService.getCGPA(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Certificates ───
exports.getMyCertificates = async (req, res, next) => {
  try {
    const data = await studentService.getMyCertificates(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Attendance & Marks ───
exports.getMyAttendance = async (req, res, next) => {
  try {
    const data = await studentService.getMyAttendance(req.user.id, req.params.courseId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getMyMarks = async (req, res, next) => {
  try {
    const data = await studentService.getMyMarks(req.user.id, req.params.courseId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
