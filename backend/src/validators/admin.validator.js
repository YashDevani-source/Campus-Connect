const Joi = require('joi');

const approveRejectCourseSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required(),
});

const assignFacultySchema = Joi.object({
  facultyId: Joi.string().required(),
});

module.exports = {
  approveRejectCourseSchema,
  assignFacultySchema,
};
