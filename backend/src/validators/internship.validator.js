const Joi = require('joi');

const createOpportunitySchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(2000).required(),
  type: Joi.string().valid('internship', 'research', 'project').required(),
  department: Joi.string().trim().allow(''),
  eligibility: Joi.string().max(500).allow(''),
  deadline: Joi.date().iso().allow(null),
});

const applySchema = Joi.object({
  coverLetter: Joi.string().max(2000).allow(''),
  resumeUrl: Joi.string().uri().allow(''),
});

const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid('applied', 'shortlisted', 'accepted', 'rejected').required(),
});

module.exports = { createOpportunitySchema, applySchema, updateApplicationStatusSchema };
