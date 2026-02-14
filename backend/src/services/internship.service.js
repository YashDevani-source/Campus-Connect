const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

exports.createOpportunity = async (data, userId) => {
  const opportunity = await Opportunity.create({ ...data, postedBy: userId });
  return opportunity;
};

exports.getAllOpportunities = async (query) => {
  const { page = 1, limit = 20, type } = query;
  const filter = { isActive: true };
  if (type) filter.type = type;

  const opportunities = await Opportunity.find(filter)
    .populate('postedBy', 'name email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Opportunity.countDocuments(filter);
  return { opportunities, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getOpportunityById = async (id) => {
  const opportunity = await Opportunity.findById(id).populate('postedBy', 'name email');
  if (!opportunity) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }
  return opportunity;
};

exports.updateOpportunity = async (id, data, userId, userRole) => {
  const opportunity = await Opportunity.findById(id);
  if (!opportunity) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && opportunity.postedBy.toString() !== userId.toString()) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  Object.assign(opportunity, data);
  await opportunity.save();
  return opportunity;
};

exports.apply = async (opportunityId, data, studentId) => {
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity || !opportunity.isActive) {
    const err = new Error('Opportunity not found or inactive');
    err.statusCode = 404;
    throw err;
  }

  // Check deadline
  if (opportunity.deadline && new Date(opportunity.deadline) < new Date()) {
    const err = new Error('Application deadline has passed');
    err.statusCode = 400;
    throw err;
  }

  const existing = await Application.findOne({ opportunity: opportunityId, applicant: studentId });
  if (existing) {
    const err = new Error('Already applied');
    err.statusCode = 400;
    throw err;
  }

  const application = await Application.create({
    ...data,
    opportunity: opportunityId,
    applicant: studentId,
    statusHistory: [{ status: 'applied', changedBy: studentId }],
  });

  return application;
};

exports.getMyApplications = async (studentId, query = {}) => {
  const { page = 1, limit = 20 } = query;

  const applications = await Application.find({ applicant: studentId })
    .populate('opportunity', 'title type department deadline')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await Application.countDocuments({ applicant: studentId });
  return { applications, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.getApplicationsForOpportunity = async (opportunityId, userId, userRole) => {
  const opportunity = await Opportunity.findById(opportunityId);
  if (!opportunity) {
    const err = new Error('Opportunity not found');
    err.statusCode = 404;
    throw err;
  }

  if (userRole !== 'admin' && opportunity.postedBy.toString() !== userId.toString()) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  const applications = await Application.find({ opportunity: opportunityId })
    .populate('applicant', 'name email rollNumber department')
    .sort({ createdAt: -1 })
    .lean();

  return applications;
};

exports.updateApplicationStatus = async (applicationId, status, userId, userRole) => {
  const application = await Application.findById(applicationId).populate('opportunity');
  if (!application) {
    const err = new Error('Application not found');
    err.statusCode = 404;
    throw err;
  }

  if (
    userRole !== 'admin' &&
    application.opportunity.postedBy.toString() !== userId.toString()
  ) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  application.status = status;
  application.statusHistory.push({ status, changedBy: userId });
  await application.save();
  return application;
};
