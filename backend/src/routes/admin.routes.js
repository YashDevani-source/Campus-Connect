const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCourseSchema } = require('../validators/academic.validator');
const { createOpportunitySchema } = require('../validators/internship.validator');
const { approveRejectCourseSchema, assignFacultySchema } = require('../validators/admin.validator');

// All routes require admin auth
router.use(auth, authorize('admin'));

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.delete('/users/:id', adminController.deleteUser);

// Grievances
router.get('/grievances', adminController.getAllGrievances);

// Courses
router.post('/courses', validate(createCourseSchema), adminController.createCourse);
router.patch('/courses/:id/approve', validate(approveRejectCourseSchema), adminController.approveCourse);
router.patch('/courses/:id/assign', validate(assignFacultySchema), adminController.assignFaculty);

// Opportunities
router.post('/opportunities', validate(createOpportunitySchema), adminController.createOpportunity);

module.exports = router;
