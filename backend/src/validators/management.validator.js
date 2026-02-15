const Joi = require('joi');

const createPaymentSchema = Joi.object({
  student: Joi.string().required(),
  type: Joi.string().valid('tuition', 'bus', 'hostel', 'other').required(),
  amount: Joi.number().positive().required(),
  description: Joi.string().max(500),
  dueDate: Joi.date(),
});

const busDetailsSchema = Joi.object({
  scheduleId: Joi.string().required(),
  driverName: Joi.string().required(),
  driverPhone: Joi.string().required(),
  busType: Joi.string().valid('AC', 'Non-AC', 'Mini'),
});

const certificateSchema = Joi.object({
  student: Joi.string().required(),
  title: Joi.string().required(),
  type: Joi.string().valid('course', 'internship', 'achievement', 'other').required(),
  issuer: Joi.string().required(),
  issueDate: Joi.date().required(),
  fileUrl: Joi.string().uri().required(),
});

const idCardSchema = Joi.object({
  studentId: Joi.string().required(),
  cardNumber: Joi.string().required(),
  issueDate: Joi.date(),
  expiryDate: Joi.date(),
  photoUrl: Joi.string(),
  barcode: Joi.string(),
});

module.exports = {
  createPaymentSchema,
  busDetailsSchema,
  certificateSchema,
  idCardSchema,
};
