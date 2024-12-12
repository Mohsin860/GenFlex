const express = require('express');
const router = express.Router();
const { 
    generateCodingQuestions,
    generateComplexQuestions,
    generateMathQuestions,
    generateDiverseCodeQuestions,
    saveEditedExam, 
    downloadCodingExam 
} = require('../controllers/codingExamController');

router.post('/generate', generateCodingQuestions);
router.post('/generate-complex', generateComplexQuestions);
router.post('/generate-math', generateMathQuestions);
router.post('/generate-diverse', generateDiverseCodeQuestions); // Make sure this matches the frontend API call
router.post('/save', saveEditedExam);
router.post('/download', downloadCodingExam);

module.exports = router;