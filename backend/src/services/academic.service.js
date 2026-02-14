const Course = require('../models/Course');
const Resource = require('../models/Resource');

exports.createCourse = async (data, instructorId) => {
  const course = await Course.create({ ...data, instructor: instructorId });
  return course;
};

exports.getAllCourses = async (query) => {
  const { page = 1, limit = 20, department } = query;
  const filter = {};
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
