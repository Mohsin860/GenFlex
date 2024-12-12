const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createLecture, downloadSummary } = require('../controllers/lectureController');

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

router.post('/create', upload.single('pdf'), createLecture);
router.get('/downloads/:filename', downloadSummary);


module.exports = router;