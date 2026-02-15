const express = require('express');
const router = express.Router();
const managementController = require('../controllers/management.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const csvUpload = require('../middleware/csvParser');
const { createPaymentSchema, busDetailsSchema, certificateSchema, idCardSchema } = require('../validators/management.validator');
const { createOpportunitySchema } = require('../validators/internship.validator');
const { updateStatusSchema, addCommentSchema } = require('../validators/grievance.validator');

// All routes require managementMember auth
router.use(auth, authorize('managementMember'));

// Grievances
router.get('/grievances', managementController.getGrievances);
router.patch('/grievances/:id/status', validate(updateStatusSchema), managementController.updateGrievanceStatus);
router.post('/grievances/:id/comments', validate(addCommentSchema), managementController.addGrievanceComment);

// Payments
router.get('/payments', managementController.getAllPayments);
router.post('/payments', validate(createPaymentSchema), managementController.createPayment);
router.post('/payments/:id/remind', managementController.sendReminder);

// Bus
router.post('/bus/schedule/csv', csvUpload.single('file'), managementController.uploadBusScheduleCSV);
router.post('/bus/details', validate(busDetailsSchema), managementController.addBusDetails);

// Certificates
router.post('/certificates', validate(certificateSchema), managementController.addCertificate);
router.get('/certificates/:studentId', managementController.getStudentCertificates);

// ID Cards
router.post('/idcards', validate(idCardSchema), managementController.updateIdCard);
router.get('/idcards/:studentId', managementController.getIdCard);

// Opportunities
router.post('/opportunities', validate(createOpportunitySchema), managementController.createOpportunity);

module.exports = router;
