const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getAvailableExams,
    getExamById,
    submitExamAttempt,
    getExamResults,
    getStudentAttempts,
    submitQuery,
    getQueries
} = require('../controllers/studentExamController');

// Protected routes - require authentication
router.get('/available', protect, getAvailableExams);
router.get('/details/:examType/:examId', protect, getExamById);
router.post('/submit', protect, submitExamAttempt);
router.get('/results/:attemptId', protect, getExamResults);
router.get('/attempts', protect, getStudentAttempts);

// Query routes
router.post('/query', protect, submitQuery);
router.get('/queries/:attemptId', protect, getQueries);

module.exports = router;