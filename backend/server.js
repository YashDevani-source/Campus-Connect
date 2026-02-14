const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./src/config/db');
const { PORT, FRONTEND_URL, NODE_ENV } = require('./src/config/env');
const errorHandler = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const authRoutes = require('./src/routes/auth.routes');
const grievanceRoutes = require('./src/routes/grievance.routes');
const academicRoutes = require('./src/routes/academic.routes');
const internshipRoutes = require('./src/routes/internship.routes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize());
app.use(generalLimiter);

if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'AEGIS Protocol API is running', timestamp: new Date() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/courses', academicRoutes);
app.use('/api/opportunities', internshipRoutes);
app.use('/api/transport', require('./src/routes/transport.routes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AEGIS Protocol server running on port ${PORT}`);
  console.log(`📡 Environment: ${NODE_ENV}`);
});

module.exports = app;
