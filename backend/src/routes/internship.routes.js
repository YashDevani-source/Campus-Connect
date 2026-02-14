const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internship.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createOpportunitySchema,
  applySchema,
  updateApplicationStatusSchema,
} = require('../validators/internship.validator');

// All routes require authentication
router.use(auth);

// Opportunity CRUD
router.post('/', authorize('faculty', 'admin'), validate(createOpportunitySchema), internshipController.createOpportunity);
router.get('/', internshipController.getAllOpportunities);
router.get('/applications/my', authorize('student'), internshipController.getMyApplications);
router.get('/:id', internshipController.getOpportunityById);
router.patch('/:id', authorize('faculty', 'admin'), internshipController.updateOpportunity);

// Applications
router.post('/:id/apply', authorize('student'), validate(applySchema), internshipController.apply);
router.get('/:id/applications', authorize('faculty', 'admin'), internshipController.getApplicationsForOpportunity);

// Update application status
router.patch('/applications/:id/status', authorize('faculty', 'admin'), validate(updateApplicationStatusSchema), internshipController.updateApplicationStatus);

module.exports = router;
