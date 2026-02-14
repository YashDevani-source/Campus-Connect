const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academic.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCourseSchema, createResourceSchema } = require('../validators/academic.validator');

// All routes require authentication
router.use(auth);

// Course CRUD
router.post('/', authorize('faculty', 'admin'), validate(createCourseSchema), academicController.createCourse);
router.get('/', academicController.getAllCourses);
router.get('/:id', academicController.getCourseById);

// Enrollment
router.post('/:id/enroll', authorize('student'), academicController.enrollStudent);

// Resources
router.post('/:id/resources', authorize('faculty', 'admin'), validate(createResourceSchema), academicController.addResource);
router.get('/:id/resources', academicController.getResources);

// Delete resource (separate route for resource id)
router.delete('/resources/:id', authorize('faculty', 'admin'), academicController.deleteResource);

module.exports = router;
