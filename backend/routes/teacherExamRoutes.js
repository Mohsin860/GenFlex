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
    deleteSubmission,
    deleteAllSubmissions,
    updateEvaluation,
    getQueriesByTeacher,
    respondToQuery
} = require('../controllers/teacherExamController');
const {
    checkExamPlagiarism,
    getPlagiarismHistory
    // testPlagiarismSystem // Add this new controller

} = require('../controllers/plagiarismController');

// Basic exam management routes
router.get('/exams', protect, getTeacherExams);
router.post('/toggle-publish', protect, toggleExamPublish);
router.get('/exam-solution/:examType/:examId', protect, getExamForSolution);
router.post('/save-solutions', protect, saveTeacherSolution);

// Submission management routes
router.get('/exam-submissions/:examType/:examId', protect, getExamSubmissions);
router.get('/submission/:submissionId', protect, getSubmissionDetails);
router.put('/evaluation/:submissionId', protect, updateEvaluation);

// Publishing results routes
router.post('/publish-results/:submissionId', protect, publishSubmissionResults);
router.post('/publish-all-results/:examType/:examId', protect, publishAllResults);

// Delete routes
router.delete('/submission/:submissionId', protect, deleteSubmission);
router.delete('/submissions/:examType/:examId', protect, deleteAllSubmissions);

// Query routes
router.get('/queries/:examType/:examId', protect, getQueriesByTeacher);
router.put('/query/:queryId', protect, respondToQuery);

// Plagiarism routes
router.post('/plagiarism-check/:examType/:examId', protect, checkExamPlagiarism);
router.get('/plagiarism-history/:examType/:examId', protect, getPlagiarismHistory);

// // NEW: Debugging route (remove in production)
// router.get('/debug/plagiarism-test', protect, testPlagiarismSystem);


module.exports = router;