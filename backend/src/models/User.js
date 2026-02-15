const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'managementMember', 'admin'],
      default: 'student',
    },
    department: {
      type: String,
      trim: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    // Profile Fields
    profilePhoto: { type: String, default: '' },
    academicYear: { type: String, trim: true },
    cgpa: { type: Number, default: 0 },

    academicDetails: [{
      semester: String,
      sgpa: Number,
      cgpa: Number,
      subjects: [{ name: String, grade: String }]
    }],

    certificates: {
      courses: [{ title: String, issuer: String, date: Date, link: String }],
      internships: [{ title: String, company: String, duration: String, link: String }],
      extraCurricular: [{ title: String, event: String, date: Date, link: String }]
    },

    personalInfo: {
      dob: Date,
      bloodGroup: String,
      address: String,
      phone: String,
    },

    parentDetails: {
      fatherName: String,
      motherName: String,
      guardianContact: String
    },

    skills: [String],
    projects: [{ title: String, description: String, link: String }],
    attendance: { type: Number, default: 0 },

    // ID Card Data (managed by ManagementMember)
    idCardData: {
      cardNumber: { type: String, default: '' },
      issueDate: Date,
      expiryDate: Date,
      photoUrl: { type: String, default: '' },
      barcode: { type: String, default: '' },
    },

    // Fee Status
    feeStatus: {
      totalFee: { type: Number, default: 0 },
      paidAmount: { type: Number, default: 0 },
      dueDate: Date,
      payments: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        transactionId: String,
        method: { type: String, enum: ['dummy', 'razorpay', 'bank'], default: 'dummy' },
        status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' }
      }]
    },

    // Bus Pass
    busPass: {
      routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'BusRoute' },
      validTill: Date,
      isActive: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
