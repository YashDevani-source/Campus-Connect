const adminService = require('../services/admin.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const data = await adminService.getAllUsers(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getUserById = async (req, res, next) => {
  try {
    const data = await adminService.getUserById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await adminService.deleteUser(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) { next(error); }
};

exports.getAllGrievances = async (req, res, next) => {
  try {
    const data = await adminService.getAllGrievances(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.approveCourse = async (req, res, next) => {
  try {
    const data = await adminService.approveCourse(req.params.id, req.body.status);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.assignFaculty = async (req, res, next) => {
  try {
    const data = await adminService.assignFaculty(req.params.id, req.body.facultyId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createCourse = async (req, res, next) => {
  try {
    req.body.instructor = req.body.instructor || req.user.id;
    const data = await adminService.createCourseAsAdmin(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createOpportunity = async (req, res, next) => {
  try {
    const data = await adminService.createOpportunity(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};
