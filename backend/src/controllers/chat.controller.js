const Chat = require('../models/Chat');
const Message = require('../models/Message');
const User = require('../models/User');
const Course = require('../models/Course'); // Assuming Course model exists

// Access or create a Direct Chat (One-on-One)
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({ message: 'UserId param not sent with request' });
  }

  // Check if chat exists
  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user.id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name email role',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user.id, userId],
      type: 'direct'
    };

    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        'users',
        '-password'
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400).throw(error.message);
    }
  }
};

// Fetch all chats for the user (including DMs, Course Chats, Role Rooms)
exports.fetchChats = async (req, res) => {
  try {
    // 1. Find courses user is enrolled in or teaching
    let courseIds = [];
    if (req.user.role === 'student') {
      const courses = await Course.find({
        $or: [{ enrolledStudents: req.user.id }, { instructor: req.user.id }]
      });
      courseIds = courses.map(c => c._id);
    } else if (req.user.role === 'faculty') {
      const courses = await Course.find({ instructor: req.user.id });
      courseIds = courses.map(c => c._id);
    }

    // 2. Find relevant chats
    Chat.find({
      $or: [
        { users: { $elemMatch: { $eq: req.user.id } } }, // DMs and Custom Groups
        { course: { $in: courseIds } }, // Course Chats
        { allowedRoles: { $elemMatch: { $eq: req.user.role } } } // Role Rooms
      ]
    })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .populate('course', 'title code')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: 'latestMessage.sender',
          select: 'name email role',
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Create a Course Chat (Usually automatic, but exposed for setup)
exports.createCourseChat = async (req, res) => {
  const { courseId, chatName } = req.body;
  if (!courseId) return res.status(400).send({ message: 'Course ID required' });

  try {
    const chat = await Chat.create({
      chatName: chatName || 'Course Context',
      isGroupChat: true,
      type: 'course',
      course: courseId,
      groupAdmin: req.user.id // Faculty who created it
    });
    const fullChat = await Chat.findOne({ _id: chat._id }).populate('course');
    res.status(200).json(fullChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Create Role-Based Room (Admin only)
exports.createRoleRoom = async (req, res) => {
  const { roles, roomName } = req.body; // e.g. ['faculty', 'admin'], "Faculty Lounge"
  if (!roles || !roomName) return res.status(400).json({ message: 'Roles and Name required' });

  try {
    const chat = await Chat.create({
      chatName: roomName,
      isGroupChat: true,
      type: 'role-based',
      allowedRoles: roles,
      groupAdmin: req.user.id
    });
    res.status(200).json(chat);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Send Message
exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    console.log('Invalid data passed into request');
    return res.sendStatus(400);
  }

  var newMessage = {
    sender: req.user.id,
    content: content,
    chat: chatId,
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate('sender', 'name role');
    message = await message.populate('chat');
    message = await User.populate(message, {
      path: 'chat.users',
      select: 'name email role',
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    // Emit via Socket.io
    req.io.to(chatId).emit('message received', message);

    res.json(message);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the feilds" });
  }

  var users = req.body.users; // Expecting array of User IDs

  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }

  users.push(req.user.id);

  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user.id,
      type: 'group'
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

// Fetch Messages for a Chat
exports.allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate('sender', 'name email role')
      .populate('chat');
    res.json(messages);
  } catch (error) {
    res.status(400).send(error.message);
  }
};
