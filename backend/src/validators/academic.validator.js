const Joi = require('joi');

const createCourseSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  code: Joi.string().trim().uppercase().required(),
  description: Joi.string().max(1000).allow(''),
  department: Joi.string().trim().allow(''),
  semester: Joi.string().trim().allow(''),
});

const createResourceSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(500).allow(''),
  fileUrl: Joi.string().uri().required(),
  fileType: Joi.string().valid('pdf', 'doc', 'ppt', 'video', 'other').default('other'),
});

module.exports = { createCourseSchema, createResourceSchema };
