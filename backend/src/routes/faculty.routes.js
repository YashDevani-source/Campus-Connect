const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/faculty.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');
const validate = require('../middleware/validate');
const { createCourseSchema, createResourceSchema } = require('../validators/academic.validator');
const { markAttendanceSchema, assignMarksSchema, setAttendanceReqSchema, replyDoubtSchema } = require('../validators/faculty.validator');

// All routes require faculty auth
router.use(auth, authorize('faculty'));

// Courses
router.get('/courses', facultyController.getMyCourses);
router.post('/courses', validate(createCourseSchema), facultyController.createCourse);
router.get('/courses/:id/students', facultyController.getStudentsInCourse);

// Resources
router.post('/courses/:id/resources', validate(createResourceSchema), facultyController.addResource);

// Attendance
router.patch('/courses/:id/attendance-req', validate(setAttendanceReqSchema), facultyController.setAttendanceReq);
router.post('/courses/:id/attendance', validate(markAttendanceSchema), facultyController.markAttendance);
router.get('/courses/:id/attendance', facultyController.getAttendanceRecords);
router.get('/courses/:id/attendance/analytics', facultyController.getAttendanceAnalytics);

// Marks
router.post('/courses/:id/marks', validate(assignMarksSchema), facultyController.assignMarks);
router.get('/courses/:id/marks', facultyController.getCourseMarks);

// Doubts
router.get('/courses/:id/doubts', facultyController.getCourseDoubts);
router.post('/courses/:id/doubts/:doubtId/reply', validate(replyDoubtSchema), facultyController.replyToDoubt);
router.patch('/courses/:id/doubts/:doubtId/resolve', facultyController.resolveDoubt);

module.exports = router;
