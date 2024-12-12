const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createExam, updateAndDownload } = require('../controllers/examController');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// Routes
router.post('/create', upload.single('pdf'), createExam);
router.post('/update-and-download', updateAndDownload);


module.exports = router;