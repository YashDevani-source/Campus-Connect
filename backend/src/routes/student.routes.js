const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { askDoubtSchema, sendMessageSchema, bookSeatSchema, updateProfileSchema } = require('../validators/student.validator');

// All routes require auth
router.use(auth);

// ─── Doubts (student only) ───
router.get('/courses/:courseId/doubts', authorize('student'), studentController.getCourseDoubts);
router.post('/courses/:courseId/doubts', authorize('student'), validate(askDoubtSchema), studentController.askDoubt);
router.post('/doubts/:doubtId/reply', authorize('student'), validate(sendMessageSchema), studentController.replyToDoubt);

// ─── Chat (all roles) ───
router.get('/chat/conversations', studentController.getConversations);
router.get('/chat/:userId', studentController.getMessages);
router.post('/chat/:userId', validate(sendMessageSchema), studentController.sendMessage);

// ─── Bus (student + faculty) ───
router.get('/bus/schedule', authorize('student', 'faculty'), studentController.getBusSchedule);
router.post('/bus/book', authorize('student', 'faculty'), validate(bookSeatSchema), studentController.bookSeat);
router.get('/bus/bookings', authorize('student', 'faculty'), studentController.getMyBookings);

// ─── Payments (student only) ───
router.post('/payments/pay', authorize('student'), studentController.makePayment);
router.get('/payments', authorize('student'), studentController.getMyPayments);

// ─── Profile (student only for edit) ───
router.get('/profile', authorize('student'), studentController.getProfile);
router.patch('/profile', authorize('student'), validate(updateProfileSchema), studentController.updateProfile);

// ─── Reports (student only) ───
router.get('/report', authorize('student'), studentController.getSemesterReport);
router.get('/cgpa', authorize('student'), studentController.getCGPA);

// ─── Certificates (student only) ───
router.get('/certificates', authorize('student'), studentController.getMyCertificates);

// ─── Attendance & Marks (student only) ───
router.get('/attendance/:courseId', authorize('student'), studentController.getMyAttendance);
router.get('/marks/:courseId', authorize('student'), studentController.getMyMarks);

module.exports = router;
