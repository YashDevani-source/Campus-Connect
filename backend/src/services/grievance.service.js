const Grievance = require('../models/Grievance');

exports.create = async (data, userId) => {
  const sensitiveCategories = ['ragging', 'sexual-harassment'];
  if (sensitiveCategories.includes(data.category)) {
    data.priority = 'high';
  }

  const grievance = await Grievance.create({
    ...data,
    submittedBy: userId,
    statusHistory: [{ status: 'pending', changedBy: userId }],
  });
  return grievance;
};

exports.getAll = async (query, userRole, userId) => {
  const { page = 1, limit = 20, status, category } = query;
  const filter = {};

  // Students and faculty see only their own
  if (userRole === 'student' || userRole === 'faculty') {
    filter.submittedBy = userId;
  }

  if (status) filter.status = status;
  if (category) filter.category = category;

  const grievances = await Grievance.find(filter)
    .populate('submittedBy', 'name email role')
    .populate('assignedTo', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Grievance.countDocuments(filter);

  return { grievances, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getById = async (id, userRole, userId) => {
  const grievance = await Grievance.findById(id)
    .populate('submittedBy', 'name email role')
    .populate('assignedTo', 'name email')
    .populate('comments.author', 'name email role');

  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  // Students and faculty can only see their own
  if ((userRole === 'student' || userRole === 'faculty') && grievance.submittedBy._id.toString() !== userId.toString()) {
    const err = new Error('Access denied');
    err.statusCode = 403;
    throw err;
  }

  return grievance;
};

exports.updateStatus = async (id, status, userId) => {
  const grievance = await Grievance.findById(id);
  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  grievance.status = status;
  grievance.statusHistory.push({ status, changedBy: userId });
  await grievance.save();

  return grievance;
};

exports.addComment = async (id, text, userId) => {
  const grievance = await Grievance.findById(id);
  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  grievance.comments.push({ text, author: userId });
  await grievance.save();

  return grievance;
};

exports.assign = async (id, assignedTo) => {
  const grievance = await Grievance.findByIdAndUpdate(
    id,
    { assignedTo },
    { new: true }
  ).populate('assignedTo', 'name email');

  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  return grievance;
};
