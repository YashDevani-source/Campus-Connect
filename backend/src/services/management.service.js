const Grievance = require('../models/Grievance');
const Payment = require('../models/Payment');
const Certificate = require('../models/Certificate');
const BusSchedule = require('../models/BusSchedule');
const BusRoute = require('../models/BusRoute');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

// ─── Grievances ───
exports.getGrievances = async (query = {}) => {
  const { page = 1, limit = 20, status, category, priority } = query;
  const filter = {};
  if (status) filter.status = status;
  if (category) filter.category = category;
  if (priority) filter.priority = priority;

  const grievances = await Grievance.find(filter)
    .populate('submittedBy', 'name email rollNumber')
    .populate('assignedTo', 'name email')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await Grievance.countDocuments(filter);
  return { grievances, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.updateGrievanceStatus = async (grievanceId, status, userId) => {
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  grievance.status = status;
  grievance.statusHistory.push({ status, changedBy: userId });
  await grievance.save();
  return grievance;
};

exports.addGrievanceComment = async (grievanceId, text, userId) => {
  const grievance = await Grievance.findById(grievanceId);
  if (!grievance) {
    const err = new Error('Grievance not found');
    err.statusCode = 404;
    throw err;
  }

  grievance.comments.push({ text, author: userId });
  await grievance.save();
  return grievance;
};

// ─── Payments / Fees ───
exports.getAllPayments = async (query = {}) => {
  const { page = 1, limit = 20, status, type, studentId } = query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;
  if (studentId) filter.student = studentId;

  const payments = await Payment.find(filter)
    .populate('student', 'name email rollNumber')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();

  const total = await Payment.countDocuments(filter);
  return { payments, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.createPayment = async (data) => {
  const student = await User.findOne({ _id: data.student, role: 'student' });
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }

  const payment = await Payment.create(data);

  // Update student's fee status
  student.feeStatus.totalFee = (student.feeStatus.totalFee || 0) + data.amount;
  await student.save();

  return payment;
};

exports.sendReminder = async (paymentId) => {
  const payment = await Payment.findById(paymentId).populate('student', 'name email');
  if (!payment) {
    const err = new Error('Payment not found');
    err.statusCode = 404;
    throw err;
  }

  // Mark reminder sent (in real app, send email/notification)
  payment.reminderSent = true;
  await payment.save();

  return { message: `Reminder sent to ${payment.student.email}`, payment };
};

// ─── Bus Schedule CSV Upload ───
exports.uploadBusScheduleCSV = async (csvData) => {
  const lines = csvData.split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    const err = new Error('CSV must have header and at least one data row');
    err.statusCode = 400;
    throw err;
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, idx) => { row[h] = values[idx]; });

    // Find or create route
    let route = await BusRoute.findOne({ routeNumber: row.routenumber || row.route_number });
    if (!route && row.origin && row.destination) {
      route = await BusRoute.create({
        routeNumber: row.routenumber || row.route_number || `R${i}`,
        origin: row.origin,
        destination: row.destination,
        stops: row.stops ? row.stops.split(';') : [],
        fare: parseFloat(row.fare) || 0,
      });
    }

    if (route) {
      const schedule = await BusSchedule.create({
        route: route._id,
        busNumber: row.busnumber || row.bus_number || `BUS-${i}`,
        departureTime: row.departuretime || row.departure_time || '08:00 AM',
        arrivalTime: row.arrivaltime || row.arrival_time || '09:00 AM',
        date: new Date(row.date || Date.now()),
        totalSeats: parseInt(row.totalseats || row.total_seats) || 30,
        availableSeats: parseInt(row.totalseats || row.total_seats) || 30,
        driverName: row.drivername || row.driver_name || '',
        driverPhone: row.driverphone || row.driver_phone || '',
        busType: row.bustype || row.bus_type || 'Non-AC',
      });
      results.push(schedule);
    }
  }

  return { created: results.length, schedules: results };
};

exports.addBusDetails = async (data) => {
  const schedule = await BusSchedule.findByIdAndUpdate(
    data.scheduleId,
    {
      driverName: data.driverName,
      driverPhone: data.driverPhone,
      busType: data.busType,
    },
    { new: true }
  ).populate('route');

  if (!schedule) {
    const err = new Error('Schedule not found');
    err.statusCode = 404;
    throw err;
  }
  return schedule;
};

// ─── Certificates ───
exports.addCertificate = async (data, addedById) => {
  data.addedBy = addedById;
  return Certificate.create(data);
};

exports.getStudentCertificates = async (studentId) => {
  return Certificate.find({ student: studentId })
    .populate('addedBy', 'name')
    .sort({ issueDate: -1 })
    .lean();
};

// ─── ID Cards ───
exports.updateIdCard = async (studentId, cardData) => {
  const student = await User.findOneAndUpdate(
    { _id: studentId, role: 'student' },
    { idCardData: cardData },
    { new: true }
  );

  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  return student.idCardData;
};

exports.getIdCard = async (studentId) => {
  const student = await User.findById(studentId).select('name email rollNumber department idCardData profilePhoto').lean();
  if (!student) {
    const err = new Error('Student not found');
    err.statusCode = 404;
    throw err;
  }
  return student;
};

// ─── Opportunities ───
exports.createOpportunity = async (data, userId) => {
  data.postedBy = userId;
  const opportunity = await Opportunity.create(data);
  return opportunity;
};
