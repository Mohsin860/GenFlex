const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Assuming you have an auth middleware
const {
    getAvailableExams,
    getExamById,
    submitExamAttempt,
    getExamResults,
    getStudentAttempts
} = require('../controllers/studentExamController');

// Protected routes - require authentication
router.get('/available', protect, getAvailableExams);
router.get('/details/:examType/:examId', protect, getExamById);
router.post('/submit', protect, submitExamAttempt);
router.get('/results/:attemptId', protect, getExamResults);
router.get('/attempts', protect, getStudentAttempts);

module.exports = router;