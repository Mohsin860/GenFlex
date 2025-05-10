const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateCodingExamPDF } = require('../utils/codingExamPdfGenerator');
const CodingExam = require('../models/CodingExam');

const generateMathQuestions = async (req, res) => {
   try {
       let userId = null;
       if (req.user && req.user._id) {
           userId = req.user._id;
           console.log(`Using authenticated user ID: ${userId}`);
       } else {
           console.log('No authenticated user, proceeding with null user ID');
       }

       const { prompt, title, numQuestions = 5 } = req.body;

       if (!prompt || !title) {
           return res.status(400).json({
               success: false,
               message: 'Please provide both prompt and title'
           });
       }

       const requestedQuestions = parseInt(numQuestions);
       if (isNaN(requestedQuestions) || requestedQuestions < 1 || requestedQuestions > 15) {
           return res.status(400).json({
               success: false,
               message: 'Number of questions must be between 1 and 15'
           });
       }

       const pythonScript = spawn('python', [
           path.join(__dirname, '..', 'utils', 'mathQuestionGenerator.py'),
           prompt,
           requestedQuestions.toString()
       ]);

       let result = '';

       pythonScript.stdout.on('data', (data) => {
           result += data.toString();
       });

       pythonScript.stderr.on('data', (data) => {
           console.error('Python stderr:', data.toString());
       });

       pythonScript.on('close', async (code) => {
           try {
               const parsedResult = JSON.parse(result);

               if (parsedResult.error) {
                   return res.status(500).json({
                       success: false,
                       message: parsedResult.error
                   });
               }

               const exam = new CodingExam({
                   title,
                   questions: parsedResult.questions,
                   type: 'math',
                   difficulty: 'math',
                   numQuestions: requestedQuestions,
                   createdBy: userId,
                   isPublished: false,
                   publishedAt: null
               });
               await exam.save();

               res.status(200).json({
                   success: true,
                   examId: exam._id,
                   questions: parsedResult.questions
               });
           } catch (parseError) {
               console.error('Parse error:', parseError, 'Raw output:', result);
               res.status(500).json({
                   success: false,
                   message: 'Failed to parse generated questions'
               });
           }
       });
   } catch (error) {
       console.error('Error in generateMathQuestions:', error);
       res.status(500).json({
           success: false,
           message: 'Failed to generate math questions',
           error: error.message
       });
   }
};

module.exports = {
   generateMathQuestions
};