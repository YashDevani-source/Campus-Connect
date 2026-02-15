const managementService = require('../services/management.service');

// ─── Grievances ───
exports.getGrievances = async (req, res, next) => {
  try {
    const data = await managementService.getGrievances(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.updateGrievanceStatus = async (req, res, next) => {
  try {
    const data = await managementService.updateGrievanceStatus(req.params.id, req.body.status, req.user.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.addGrievanceComment = async (req, res, next) => {
  try {
    const data = await managementService.addGrievanceComment(req.params.id, req.body.text, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Payments ───
exports.getAllPayments = async (req, res, next) => {
  try {
    const data = await managementService.getAllPayments(req.query);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.createPayment = async (req, res, next) => {
  try {
    const data = await managementService.createPayment(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.sendReminder = async (req, res, next) => {
  try {
    const data = await managementService.sendReminder(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Bus ───
exports.uploadBusScheduleCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }
    const csvData = req.file.buffer.toString('utf-8');
    const data = await managementService.uploadBusScheduleCSV(csvData);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.addBusDetails = async (req, res, next) => {
  try {
    const data = await managementService.addBusDetails(req.body);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Certificates ───
exports.addCertificate = async (req, res, next) => {
  try {
    const data = await managementService.addCertificate(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getStudentCertificates = async (req, res, next) => {
  try {
    const data = await managementService.getStudentCertificates(req.params.studentId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── ID Cards ───
exports.updateIdCard = async (req, res, next) => {
  try {
    const data = await managementService.updateIdCard(req.body.studentId, req.body);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

exports.getIdCard = async (req, res, next) => {
  try {
    const data = await managementService.getIdCard(req.params.studentId);
    res.status(200).json({ success: true, data });
  } catch (error) { next(error); }
};

// ─── Opportunities ───
exports.createOpportunity = async (req, res, next) => {
  try {
    const data = await managementService.createOpportunity(req.body, req.user.id);
    res.status(201).json({ success: true, data });
  } catch (error) { next(error); }
};
