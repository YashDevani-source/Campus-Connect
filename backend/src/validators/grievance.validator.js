const Joi = require('joi');

const createGrievanceSchema = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(2000).required(),
  category: Joi.string().valid('academic', 'infrastructure', 'hostel', 'ragging', 'sexual-harassment', 'other').default('other'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
});

const updateStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in-review', 'resolved').required(),
});

const addCommentSchema = Joi.object({
  text: Joi.string().trim().max(1000).required(),
});

const assignGrievanceSchema = Joi.object({
  assignedTo: Joi.string().hex().length(24).required(),
});

module.exports = { createGrievanceSchema, updateStatusSchema, addCommentSchema, assignGrievanceSchema };
