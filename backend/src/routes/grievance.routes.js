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

// Student creates grievance
router.post('/', authorize('student'), validate(createGrievanceSchema), grievanceController.create);

// List grievances (students see own, authority/admin see all)
router.get('/', authorize('student', 'authority', 'admin'), grievanceController.getAll);

// Get single grievance
router.get('/:id', authorize('student', 'authority', 'admin'), grievanceController.getById);

// Authority/Admin update status
router.patch('/:id/status', authorize('authority', 'admin'), validate(updateStatusSchema), grievanceController.updateStatus);

// Add comment (all involved parties)
router.post('/:id/comments', authorize('student', 'authority', 'admin'), validate(addCommentSchema), grievanceController.addComment);

// Admin assigns grievance to authority
router.patch('/:id/assign', authorize('admin'), validate(assignGrievanceSchema), grievanceController.assign);

module.exports = router;
