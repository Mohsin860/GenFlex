const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // Add this import
const { 
    generateCodingQuestions,
    generateComplexQuestions,
    generateMathQuestions,
    generateDiverseCodeQuestions,
    saveEditedExam, 
    downloadCodingExam 
} = require('../controllers/codingExamController');

// Add protect middleware to each route
router.post('/generate', protect, generateCodingQuestions);
router.post('/generate-complex', protect, generateComplexQuestions);
router.post('/generate-math', protect, generateMathQuestions);
router.post('/generate-diverse', protect, generateDiverseCodeQuestions);
router.post('/save', protect, saveEditedExam);
router.post('/download', protect, downloadCodingExam);

module.exports = router;