const Course = require('../models/Course');
const Resource = require('../models/Resource');

exports.createCourse = async (data, user) => {
  let courseData = { ...data };

  if (user.role === 'faculty') {
    courseData.instructor = user.id;
    courseData.status = 'pending';
    courseData.createdByRole = 'faculty';
    // Ensure faculty can only create for their department? Maybe not strict on frontend form but let's assume they pick their own department or it's auto-filled.
    // Ideally backend should enforce department match if critical, but for now let's trust the form or just let them pick.
  } else if (['admin', 'managementMember'].includes(user.role)) {
    courseData.status = 'approved';
    courseData.createdByRole = user.role;
    // Admin/Management must provide instructor ID in data.instructor
    if (!courseData.instructor) {
      throw new Error('Instructor is required for admin/management created courses');
    }
  }

  const course = await Course.create(courseData);
  return course;
};

exports.getAllCourses = async (query) => {
  const { page = 1, limit = 20, department, status = 'approved' } = query;
  const filter = { status }; // Default to approved courses only
  if (department) filter.department = department;

  const courses = await Course.find(filter)
    .populate('instructor', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Course.countDocuments(filter);
  return { courses, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getFacultyByDepartment = async (department) => {
  const User = require('../models/User');
  const filter = { role: 'faculty' };
  if (department) filter.department = department;
  return User.find(filter).select('name email department').lean();
};

exports.getPendingCourses = async (user) => {
  const filter = { status: 'pending' };

  if (user.role === 'managementMember') {
    // Management can only see pending courses from their department
    if (!user.department) throw new Error('Management member has no department assigned');
    filter.department = user.department;
  }
  // Admins see all pending courses

  return Course.find(filter)
    .populate('instructor', 'name email department')
    .sort({ createdAt: -1 })
    .lean();
};

exports.updateCourseStatus = async (courseId, status, user) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  if (user.role === 'managementMember') {
    if (course.department !== user.department) {
      const err = new Error('Not authorized to approve courses from other departments');
      err.statusCode = 403;
      throw err;
    }
  }

  course.status = status;
  await course.save();
  return course;
};

exports.getCourseById = async (id) => {
  const course = await Course.findById(id)
    .populate('instructor', 'name email')
    .populate('enrolledStudents', 'name email rollNumber');

  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  return course;
};

exports.enrollStudent = async (courseId, studentId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  if (course.enrolledStudents.includes(studentId)) {
    const err = new Error('Already enrolled');
    err.statusCode = 400;
    throw err;
  }

  course.enrolledStudents.push(studentId);
  await course.save();
  return course;
};

exports.addResource = async (courseId, data, uploaderId) => {
  const course = await Course.findById(courseId);
  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }

  const resource = await Resource.create({
    ...data,
    course: courseId,
    uploadedBy: uploaderId,
  });
  return resource;
};

exports.getResources = async (courseId) => {
  const resources = await Resource.find({ course: courseId })
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 })
    .lean();
  return resources;
};

exports.deleteResource = async (resourceId, userId, userRole) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    const err = new Error('Resource not found');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && resource.uploadedBy.toString() !== userId.toString()) {
    const err = new Error('Not authorized to delete this resource');
    err.statusCode = 403;
    throw err;
  }

  await Resource.findByIdAndDelete(resourceId);
  return { message: 'Resource deleted' };
};

exports.deleteCourse = async (courseId, user) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error('Course not found');

  // Authorization: Admin can delete any. Management can only delete their department's.
  if (user.role === 'managementMember' && course.department !== user.department) {
    const err = new Error('Not authorized to delete courses outside your department');
    err.statusCode = 403;
    throw err;
  }

  if (user.role === 'faculty') throw new Error('Faculty cannot delete courses');

  await Course.findByIdAndDelete(courseId);
  // Optional: Delete associated resources, attendance, marks? 
  // For now let's just delete the course.
  return { message: 'Course deleted' };
};
