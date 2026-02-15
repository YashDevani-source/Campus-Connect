const facultyService = require('../services/faculty.service');

exports.getMyCourses = async (req, res, next) => {
  try {
    const data = await facultyService.getMyCourses(req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getStudentsInCourse = async (req, res, next) => {
  try {
    const data = await facultyService.getStudentsInCourse(req.params.id, req.user.id, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createCourse = async (req, res, next) => {
  try {
    const data = await facultyService.createCourseAsFaculty(req.body, req.user.id);
    res.status(201).json({ success: true, data, message: 'Course created. Awaiting admin approval.' });
  } catch (error) { next(error); }
};

exports.addResource = async (req, res, next) => {
  try {
    const data = await facultyService.addResource(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.setAttendanceReq = async (req, res, next) => {
  try {
    const data = await facultyService.setAttendanceReq(req.params.id, req.user.id, req.body.requiredAttendance);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.markAttendance = async (req, res, next) => {
  try {
    const data = await facultyService.markAttendance(req.params.id, req.user.id, req.body.date, req.body.records);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getAttendanceRecords = async (req, res, next) => {
  try {
    const data = await facultyService.getAttendanceRecords(req.params.id, req.user.id, req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getAttendanceAnalytics = async (req, res, next) => {
  try {
    const data = await facultyService.getAttendanceAnalytics(req.params.id, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.assignMarks = async (req, res, next) => {
  try {
    const data = await facultyService.assignMarks(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getCourseMarks = async (req, res, next) => {
  try {
    const data = await facultyService.getCourseMarks(req.params.id, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getCourseDoubts = async (req, res, next) => {
  try {
    const data = await facultyService.getCourseDoubts(req.params.id, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.replyToDoubt = async (req, res, next) => {
  try {
    const data = await facultyService.replyToDoubt(req.params.doubtId, req.user.id, req.body.content);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.resolveDoubt = async (req, res, next) => {
  try {
    const data = await facultyService.resolveDoubt(req.params.doubtId, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};
