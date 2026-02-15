const User = require('../models/User');
const Grievance = require('../models/Grievance');
const Course = require('../models/Course');
const Opportunity = require('../models/Opportunity');

exports.getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, role, department, search } = query;
  const filter = {};
  if (role) filter.role = role;
  if (department) filter.department = { $regex: department, $options: 'i' };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { rollNumber: { $regex: search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await User.countDocuments(filter);
  return { users, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getUserById = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.deleteUser = async (userId) => {
  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.getAllGrievances = async (query = {}) => {
  const { page = 1, limit = 20, status, category, priority, startDate, endDate } = query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const grievances = await Grievance.find(filter)
    .populate('submittedBy', 'name email rollNumber')
    .populate('assignedTo', 'name email')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await Grievance.countDocuments(filter);
  return { grievances, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.approveCourse = async (courseId, status) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    { status },
    { new: true }
  ).populate('instructor', 'name email');

  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  return course;
};

exports.assignFaculty = async (courseId, facultyId) => {
  const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
  if (!faculty) {
    const err = new Error('Faculty not found');
    err.statusCode = 404;
    throw err;
  }

  const course = await Course.findByIdAndUpdate(
    courseId,
    { instructor: facultyId },
    { new: true }
  ).populate('instructor', 'name email');

  if (!course) {
    const err = new Error('Course not found');
    err.statusCode = 404;
    throw err;
  }
  return course;
};

exports.createCourseAsAdmin = async (data) => {
  data.status = 'approved';
  data.createdByRole = 'admin';
  const course = await Course.create(data);
  return course;
};

exports.createOpportunity = async (data, userId) => {
  data.postedBy = userId;
  const opportunity = await Opportunity.create(data);
  return opportunity;
};
