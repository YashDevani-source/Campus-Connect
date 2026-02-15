const academicService = require('../services/academic.service');

exports.createCourse = async (req, res, next) => {
  try {
    const course = await academicService.createCourse(req.body, req.user);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.getAllCourses = async (req, res, next) => {
  try {
    const result = await academicService.getAllCourses(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getCourseById = async (req, res, next) => {
  try {
    const course = await academicService.getCourseById(req.params.id);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.getPendingCourses = async (req, res, next) => {
  try {
    const courses = await academicService.getPendingCourses(req.user);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

exports.updateCourseStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    const course = await academicService.updateCourseStatus(req.params.id, status, req.user);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

exports.getFacultyList = async (req, res, next) => {
  try {
    const list = await academicService.getFacultyByDepartment(req.query.department);
    res.status(200).json({ success: true, data: list });
  } catch (error) { next(error); }
};

exports.enrollStudent = async (req, res, next) => {
  try {
    const course = await academicService.enrollStudent(req.params.id, req.user.id);
    res.status(200).json({ success: true, data: course, message: 'Enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

exports.addResource = async (req, res, next) => {
  try {
    const resource = await academicService.addResource(req.params.id, req.body, req.user.id);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    next(error);
  }
};

exports.getResources = async (req, res, next) => {
  try {
    const resources = await academicService.getResources(req.params.id);
    res.status(200).json({ success: true, data: resources });
  } catch (error) {
    next(error);
  }
};

exports.deleteResource = async (req, res, next) => {
  try {
    const result = await academicService.deleteResource(req.params.id, req.user.id, req.user.role);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.deleteCourse = async (req, res, next) => {
  try {
    const result = await academicService.deleteCourse(req.params.id, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};
