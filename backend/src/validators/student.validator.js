const Joi = require('joi');

const askDoubtSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().min(10).max(3000).required(),
  tags: Joi.array().items(Joi.string().max(30)).max(5),
});

const sendMessageSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

const bookSeatSchema = Joi.object({
  scheduleId: Joi.string().required(),
  seatNumber: Joi.number().integer().positive().required(),
});

const updateProfileSchema = Joi.object({
  name: Joi.string().max(100),
  personalInfo: Joi.object({
    dob: Joi.date(),
    bloodGroup: Joi.string(),
    address: Joi.string(),
    phone: Joi.string(),
  }),
  parentDetails: Joi.object({
    fatherName: Joi.string(),
    motherName: Joi.string(),
    guardianContact: Joi.string(),
  }),
  skills: Joi.array().items(Joi.string()),
  projects: Joi.array().items(
    Joi.object({
      title: Joi.string(),
      description: Joi.string(),
      link: Joi.string(),
    })
  ),
  profilePhoto: Joi.string(),
});

module.exports = {
  askDoubtSchema,
  sendMessageSchema,
  bookSeatSchema,
  updateProfileSchema,
};
