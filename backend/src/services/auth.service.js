const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

exports.register = async (data) => {
  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) {
    const err = new Error('Email already registered');
    err.statusCode = 400;
    throw err;
  }

  const user = await User.create(data);
  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

exports.getMe = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.getAllUsers = async (query = {}) => {
  const { page = 1, limit = 20, role } = query;
  const filter = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .lean();

  const total = await User.countDocuments(filter);

  return { users, total, page: parseInt(page), pages: Math.ceil(total / limit) };
};

exports.updateUserRole = async (userId, newRole) => {
  const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    const err = new Error('User not found');
    err.statusCode = 404;
    throw err;
  }
  return user;
};
