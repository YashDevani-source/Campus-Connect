const internshipService = require('../services/internship.service');

exports.createOpportunity = async (req, res, next) => {
  try {
    const opportunity = await internshipService.createOpportunity(req.body, req.user.id);
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const result = await internshipService.getAllOpportunities(req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getOpportunityById = async (req, res, next) => {
  try {
    const opportunity = await internshipService.getOpportunityById(req.params.id);
    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await internshipService.updateOpportunity(
      req.params.id, req.body, req.user.id, req.user.role
    );
    res.status(200).json({ success: true, data: opportunity });
  } catch (error) {
    next(error);
  }
};

exports.apply = async (req, res, next) => {
  try {
    const application = await internshipService.apply(req.params.id, req.body, req.user.id);
    res.status(201).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};

exports.getMyApplications = async (req, res, next) => {
  try {
    const result = await internshipService.getMyApplications(req.user.id, req.query);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getApplicationsForOpportunity = async (req, res, next) => {
  try {
    const applications = await internshipService.getApplicationsForOpportunity(
      req.params.id, req.user.id, req.user.role
    );
    res.status(200).json({ success: true, data: applications });
  } catch (error) {
    next(error);
  }
};

exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const application = await internshipService.updateApplicationStatus(
      req.params.id, req.body.status, req.user.id, req.user.role
    );
    res.status(200).json({ success: true, data: application });
  } catch (error) {
    next(error);
  }
};
