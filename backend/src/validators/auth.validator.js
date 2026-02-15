const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().trim().max(100).required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().min(6).max(50).required(),
  role: Joi.string().valid('student', 'faculty', 'managementMember', 'admin').default('student'),
  department: Joi.string().trim().allow(''),
  rollNumber: Joi.string().trim().allow(''),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema };
