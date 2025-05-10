const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createLecture, downloadSummary } = require('../controllers/lectureController');
const { protect } = require('../middleware/auth');
const Lecture = require('../models/Lecture');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

router.get('/count', async (req, res) => {
    try {
      const totalLectures = await Lecture.countDocuments();
      res.json({ count: totalLectures });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});

const upload = multer({ storage: storage });

// Add protect middleware to routes that need authentication
router.post('/create', protect, upload.single('pdf'), createLecture);

// Modified download route to check authentication
router.get('/downloads/:filename', protect, downloadSummary);

module.exports = router;