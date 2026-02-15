const express = require('express');
const {
  accessChat, fetchChats, createCourseChat, createRoleRoom, sendMessage, allMessages, createGroupChat
} = require('../controllers/chat.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

router.use(auth); // Protect all routes

router.route('/').get(fetchChats);
router.route('/access').post(accessChat);
router.route('/message').post(sendMessage);
router.route('/:chatId/messages').get(allMessages);
router.route('/group').post(createGroupChat);
router.route('/course').post(authorize('faculty', 'admin', 'managementMember'), createCourseChat);
router.route('/role-room').post(authorize('admin'), createRoleRoom);

module.exports = router;
