// examController.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateExamPDF } = require('../utils/pdfGenerator');
const Exam = require('../models/Exam');

const generateQuestionsFromPDF = (pdfPath, numQuestions) => {
    return new Promise((resolve, reject) => {
        const pythonScript = spawn('python', [
            path.join(__dirname, '..', 'utils', 'generateQuestions.py'),
            pdfPath,
            numQuestions.toString()
        ]);

        let result = '';
        let error = '';

        pythonScript.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonScript.stderr.on('data', (data) => {
            error += data.toString();
            console.error('Python error:', data.toString());
        });

        pythonScript.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Question generation failed: ${error}`));
                return;
            }

            try {
                const lines = result.trim().split('\n');
                let jsonLine = lines[lines.length - 1];
                const questions = JSON.parse(jsonLine);
                resolve(questions);
            } catch (parseError) {
                console.error('Parse error:', parseError);
                console.error('Raw output:', result);
                reject(new Error('Failed to parse generated questions'));
            }
        });
    });
};

// Fixed createExam function in examController.js - properly handles duration

const createExam = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No PDF file uploaded'
            });
        }

        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Using authenticated user ID: ${userId}`);
        } else {
            console.log('No authenticated user, proceeding with null user ID');
        }

        const { title } = req.body;
        const numQuestions = parseInt(req.body.numQuestions) || 5;
        
        // Parse duration with explicit check for presence and type conversion
        let duration;
        if (req.body.duration) {
            duration = parseInt(req.body.duration);
            if (isNaN(duration)) {
                duration = 120; // Default if parsing failed
            }
        } else {
            duration = 120; // Default if not provided
        }
        
        console.log(`Creating exam with duration: ${duration} minutes`);
        
        const pdfPath = req.file.path;

        // Generate questions
        const questions = await generateQuestionsFromPDF(pdfPath, numQuestions);
        
        // Save exam to database
        const exam = new Exam({
            title,
            questions,
            createdBy: userId,
            isPublished: false,
            publishedAt: null,
            duration: duration // Add duration field
        });
        await exam.save();

        // Generate initial PDF
        const pdfFileName = await generateExamPDF(title, questions, false, duration);

        // Clean up uploaded PDF file
        fs.unlink(pdfPath, (err) => {
            if (err) console.error('Error deleting uploaded PDF:', err);
        });

        res.status(200).json({
            success: true,
            examId: exam._id,
            questions: questions,
            pdfUrl: `/downloads/${pdfFileName}`
        });

    } catch (error) {
        console.error('Error in createExam:', error);
        // Clean up uploaded file in case of error
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting uploaded PDF:', err);
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to generate exam',
            error: error.message
        });
    }
};

const updateAndDownload = async (req, res) => {
    try {
        const { title, questions, content, type, examId, duration } = req.body;

        // Input validation
        if (!title || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data'
            });
        }

        // Process questions to ensure proper format
        const processedQuestions = questions.map(q => ({
            question: q.question.trim(),
            answer: q.answer || '',
            context: q.context || ''
        }));

        // Update exam in database if examId is provided
        if (examId) {
            try {
                await Exam.findByIdAndUpdate(examId, {
                    title,
                    questions: processedQuestions,
                    duration: parseInt(duration) || 120 // Add duration
                });
            } catch (dbError) {
                console.error('Error updating exam in database:', dbError);
                // Continue with PDF generation even if database update fails
            }
        }

        // Generate PDF with updated questions
        const pdfFileName = await generateExamPDF(title, processedQuestions);
        const pdfPath = path.join(__dirname, '..', 'downloads', pdfFileName);

        // Send the PDF file
        res.download(pdfPath, `${title.replace(/\s+/g, '_')}_exam.pdf`, (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send PDF',
                    error: err.message
                });
            }
            
            // Clean up the generated PDF file after sending (optional)
            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting generated PDF:', unlinkErr);
            });
        });

    } catch (error) {
        console.error('Error in updateAndDownload:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update and download exam',
            error: error.message
        });
    }
};

module.exports = {
    createExam,
    updateAndDownload
};