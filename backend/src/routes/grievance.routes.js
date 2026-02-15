const express = require('express');
const router = express.Router();
const grievanceController = require('../controllers/grievance.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createGrievanceSchema,
  updateStatusSchema,
  addCommentSchema,
  assignGrievanceSchema,
} = require('../validators/grievance.validator');

// All routes require authentication
router.use(auth);

// Student & Faculty create grievance
router.post('/', authorize('student', 'faculty'), validate(createGrievanceSchema), grievanceController.create);

// List grievances (students/faculty see own, managementMember/admin see all)
router.get('/', authorize('student', 'faculty', 'managementMember', 'admin'), grievanceController.getAll);

// Get single grievance
router.get('/:id', authorize('student', 'faculty', 'managementMember', 'admin'), grievanceController.getById);

// ManagementMember/Admin update status
router.patch('/:id/status', authorize('managementMember', 'admin'), validate(updateStatusSchema), grievanceController.updateStatus);

// Add comment (all involved parties)
router.post('/:id/comments', authorize('student', 'faculty', 'managementMember', 'admin'), validate(addCommentSchema), grievanceController.addComment);

// Admin assigns grievance to managementMember
router.patch('/:id/assign', authorize('admin'), validate(assignGrievanceSchema), grievanceController.assign);

module.exports = router;
