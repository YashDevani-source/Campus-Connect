const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { MONGODB_URI } = require('../config/env');
const User = require('../models/User');
const Course = require('../models/Course');
const Grievance = require('../models/Grievance');
const Opportunity = require('../models/Opportunity');

const seedData = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Grievance.deleteMany({});
    await Opportunity.deleteMany({});

    // Create users
    const users = await User.create([
      { name: 'Admin User', email: 'admin@aegis.edu', password: 'admin123', role: 'admin', department: 'Administration' },
      { name: 'Dr. Sharma', email: 'faculty@aegis.edu', password: 'faculty123', role: 'faculty', department: 'Computer Science' },
      { name: 'Prof. Gupta', email: 'faculty2@aegis.edu', password: 'faculty123', role: 'faculty', department: 'Electrical Engineering' },
      { name: 'Authority Officer', email: 'authority@aegis.edu', password: 'authority123', role: 'authority', department: 'Student Affairs' },
      { name: 'Rahul Kumar', email: 'student@aegis.edu', password: 'student123', role: 'student', department: 'Computer Science', rollNumber: 'CS2024001' },
      { name: 'Priya Singh', email: 'student2@aegis.edu', password: 'student123', role: 'student', department: 'Electrical Engineering', rollNumber: 'EE2024001' },
    ]);

    const [admin, faculty, faculty2, authority, student, student2] = users;

    // Create courses
    const courses = await Course.create([
      { title: 'Data Structures & Algorithms', code: 'CS201', description: 'Fundamental data structures and algorithm design', department: 'Computer Science', instructor: faculty._id, semester: 'Spring 2026', enrolledStudents: [student._id] },
      { title: 'Digital Signal Processing', code: 'EE301', description: 'Analysis of signals and systems', department: 'Electrical Engineering', instructor: faculty2._id, semester: 'Spring 2026', enrolledStudents: [student2._id] },
      { title: 'Machine Learning', code: 'CS401', description: 'Introduction to ML concepts and applications', department: 'Computer Science', instructor: faculty._id, semester: 'Spring 2026' },
    ]);

    // Create grievances
    await Grievance.create([
      { title: 'Library Wi-Fi Issues', description: 'The Wi-Fi in the library has been extremely slow for the past week, affecting our study sessions.', category: 'infrastructure', priority: 'high', submittedBy: student._id, assignedTo: authority._id, status: 'in-review', statusHistory: [{ status: 'pending', changedBy: student._id }, { status: 'in-review', changedBy: authority._id }], comments: [{ text: 'We are looking into this issue.', author: authority._id }] },
      { title: 'Hostel Water Supply', description: 'Irregular water supply in Hostel Block C during morning hours.', category: 'hostel', priority: 'medium', submittedBy: student2._id, statusHistory: [{ status: 'pending', changedBy: student2._id }] },
    ]);

    // Create opportunities
    await Opportunity.create([
      { title: 'ML Research Assistant', description: 'Research position in the Machine Learning lab working on NLP projects.', type: 'research', department: 'Computer Science', eligibility: 'CS students with ML coursework', deadline: new Date('2026-03-15'), postedBy: faculty._id },
      { title: 'Summer Internship - Web Development', description: 'Build internal tools for the university IT department.', type: 'internship', department: 'IT Department', eligibility: 'Any year, basic web dev skills', deadline: new Date('2026-04-01'), postedBy: admin._id },
      { title: 'IoT Lab Project', description: 'Collaborative project on smart campus IoT sensors.', type: 'project', department: 'Electrical Engineering', eligibility: 'EE/CS students', deadline: new Date('2026-03-20'), postedBy: faculty2._id },
    ]);

    console.log('✅ Seed data created successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('  Admin:     admin@aegis.edu / admin123');
    console.log('  Faculty:   faculty@aegis.edu / faculty123');
    console.log('  Authority: authority@aegis.edu / authority123');
    console.log('  Student:   student@aegis.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedData();
