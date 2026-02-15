const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    type: {
      type: String,
      enum: ['direct', 'course', 'role-based', 'group'],
      default: 'direct'
    },
    // For Direct/Custom Group chats
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // For Course chats
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    // For Role-Based chats (e.g., "Faculty Lounge")
    allowedRoles: [{
      type: String,
      enum: ['student', 'faculty', 'admin', 'managementMember']
    }],
    latestMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
