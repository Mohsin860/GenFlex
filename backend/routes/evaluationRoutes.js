const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    evaluateEssayExam,
    evaluateAllSubmissions
} = require('../controllers/evaluationController');
const {
    evaluateMathExam,
    evaluateAllMathSubmissions
} = require('../controllers/mathEvaluationController');
const {
    evaluateCodingExam,
    evaluateAllCodingSubmissions
} = require('../controllers/codingEvaluationController');

// Essay exam evaluation routes
router.post('/essay-exam/:submissionId', protect, evaluateEssayExam);
router.post('/bulk/:examType/:examId', protect, evaluateAllSubmissions);

// Math exam evaluation routes
router.post('/math-exam/:submissionId', protect, evaluateMathExam);
router.post('/math-bulk/:examId', protect, evaluateAllMathSubmissions);

// Coding exam evaluation routes
router.post('/coding-exam/:submissionId', protect, evaluateCodingExam);
router.post('/coding-bulk/:examId', protect, evaluateAllCodingSubmissions);

module.exports = router;