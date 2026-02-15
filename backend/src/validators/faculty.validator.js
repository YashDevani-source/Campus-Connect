const Joi = require('joi');

const markAttendanceSchema = Joi.object({
  date: Joi.date().required(),
  records: Joi.array().items(
    Joi.object({
      student: Joi.string().required(),
      status: Joi.string().valid('present', 'absent', 'late').required(),
    })
  ).min(1).required(),
});

const assignMarksSchema = Joi.object({
  assessmentType: Joi.string().valid('quiz', 'midsem', 'endsem', 'assignment').required(),
  title: Joi.string().required(),
  maxMarks: Joi.number().positive().required(),
  weightage: Joi.number().min(0).max(100).required(),
  marks: Joi.array().items(
    Joi.object({
      student: Joi.string().required(),
      obtainedMarks: Joi.number().min(0).required(),
    })
  ).min(1).required(),
});

const setAttendanceReqSchema = Joi.object({
  requiredAttendance: Joi.number().min(0).max(100).required(),
});

const replyDoubtSchema = Joi.object({
  content: Joi.string().min(1).max(2000).required(),
});

module.exports = {
  markAttendanceSchema,
  assignMarksSchema,
  setAttendanceReqSchema,
  replyDoubtSchema,
};
