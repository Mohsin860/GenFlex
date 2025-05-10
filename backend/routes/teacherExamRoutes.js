const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getTeacherExams,
    toggleExamPublish,
    getExamForSolution,
    saveTeacherSolution,
    getExamSubmissions,
    getSubmissionDetails,
    publishSubmissionResults,
    publishAllResults,
    deleteSubmission,        // Add this
    deleteAllSubmissions,
    updateEvaluation     // Add this

} = require('../controllers/teacherExamController');

// Routes
router.get('/exams', protect, getTeacherExams);
router.post('/toggle-publish', protect, toggleExamPublish);
router.get('/exam-solution/:examType/:examId', protect, getExamForSolution);
router.post('/save-solutions', protect, saveTeacherSolution);
router.get('/exam-submissions/:examType/:examId', protect, getExamSubmissions);
router.get('/submission/:submissionId', protect, getSubmissionDetails);
router.put('/evaluation/:submissionId', protect, updateEvaluation);

// New routes for publishing results
router.post('/publish-results/:submissionId', protect, publishSubmissionResults);
router.post('/publish-all-results/:examType/:examId', protect, publishAllResults);
// Add these routes
router.delete('/submission/:submissionId', protect, deleteSubmission);
router.delete('/submissions/:examType/:examId', protect, deleteAllSubmissions);

module.exports = router;