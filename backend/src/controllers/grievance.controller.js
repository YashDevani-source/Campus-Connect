const grievanceService = require('../services/grievance.service');

exports.create = async (req, res, next) => {
  try {
    const grievance = await grievanceService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const result = await grievanceService.getAll(req.query, req.user.role, req.user.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const grievance = await grievanceService.getById(req.params.id, req.user.role, req.user.id);
    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const grievance = await grievanceService.updateStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const grievance = await grievanceService.addComment(req.params.id, req.body.text, req.user.id);
    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
};

exports.assign = async (req, res, next) => {
  try {
    const grievance = await grievanceService.assign(req.params.id, req.body.assignedTo);
    res.status(200).json({ success: true, data: grievance });
  } catch (error) {
    next(error);
  }
};
