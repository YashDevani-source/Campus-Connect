const express = require('express');
const router = express.Router();
const Notice = require('../models/Notice');
const auth = require('../middleware/auth');
const authorize = require('../middleware/role');

// All routes need authentication
router.use(auth);

// GET all active notices (all roles)
router.get('/', async (req, res) => {
  try {
    const notices = await Notice.find({ active: true })
      .populate('author', 'name role department')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, data: notices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create notice (faculty, management, admin)
router.post('/', authorize('faculty', 'managementMember', 'admin'), async (req, res) => {
  try {
    const { title, content, priority } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }
    const notice = await Notice.create({
      title,
      content,
      priority: priority || 'normal',
      author: req.user.id
    });
    const populated = await notice.populate('author', 'name role department');
    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE notice (only author or admin)
router.delete('/:id', authorize('faculty', 'managementMember', 'admin'), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    // Only author or admin can delete
    if (notice.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this notice' });
    }
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
