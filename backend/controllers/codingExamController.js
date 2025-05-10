const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { generateCodingExamPDF } = require('../utils/codingExamPdfGenerator');
const CodingExam = require('../models/CodingExam');

// Fixed generateMediumQuestions in codingExamController.js - properly handles duration

const generateCodingQuestions = async (req, res) => {
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
        const { prompt, difficulty, title, numQuestions = 5, duration = 120 } = req.body;

        // Parse duration to ensure it's a number
        const examDuration = parseInt(duration) || 120;
        console.log(`Creating coding exam with duration: ${examDuration} minutes`);

        if (!prompt || !difficulty) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both prompt and difficulty level'
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
            path.join(__dirname, '..', 'utils', 'codingQuestionGenerator.py'),
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

                if (!parsedResult.questions || !Array.isArray(parsedResult.questions)) {
                    return res.status(500).json({
                        success: false,
                        message: 'Invalid question format received'
                    });
                }

                const exam = new CodingExam({
                    title,
                    questions: parsedResult.questions,
                    type: 'coding',
                    difficulty,
                    numQuestions: requestedQuestions,
                    createdBy: userId,
                    duration: examDuration // Store the duration properly
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
        console.error('Error in generateCodingQuestions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate coding questions',
            error: error.message
        });
    }
};

const generateComplexQuestions = async (req, res) => {
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
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
            path.join(__dirname, '..', 'utils', 'complexQuestionGenerator.py'),
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
                    type: 'complex',
                    difficulty: 'complex',
                    numQuestions: requestedQuestions,
                    createdBy: userId
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
        console.error('Error in generateComplexQuestions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate complex questions',
            error: error.message
        });
    }
};

const generateMathQuestions = async (req, res) => {
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
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
        let errorOutput = '';

        pythonScript.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonScript.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error('Python stderr:', data.toString());
        });

        pythonScript.on('close', async (code) => {
            try {
                // Try to parse the result
                let parsedResult;
                try {
                    parsedResult = JSON.parse(result);
                } catch (parseError) {
                    console.error('Parse error:', { result, errorOutput });
                    throw new Error('Failed to parse Python script output');
                }

                if (!parsedResult.success) {
                    throw new Error(parsedResult.error || 'Unknown error occurred');
                }

                // Create exam in database
                const exam = new CodingExam({
                    title,
                    questions: parsedResult.questions,
                    type: 'math',
                    difficulty: 'math',
                    numQuestions: requestedQuestions,
                    createdBy: userId
                });
                await exam.save();

                res.status(200).json({
                    success: true,
                    examId: exam._id,
                    questions: parsedResult.questions
                });
            } catch (error) {
                console.error('Error processing Python script output:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Failed to generate math questions'
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

const generateDiverseCodeQuestions = async (req, res) => {

    // Add at the beginning of each exam creation function
    console.log('AUTH DEBUG - Creating exam with:', {
        userObject: req.user,
        userID: req.user?._id,
        authHeader: req.headers.authorization ? 'Present' : 'Missing'
    });
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
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
            path.join(__dirname, '..', 'utils', 'diverseCodeGenerator.py'),
            prompt,
            requestedQuestions.toString()
        ]);

        let result = '';
        let errorOutput = '';

        pythonScript.stdout.on('data', (data) => {
            result += data.toString();
        });

        pythonScript.stderr.on('data', (data) => {
            errorOutput += data.toString();
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
                    type: 'diverse',
                    difficulty: 'diverse',
                    numQuestions: requestedQuestions,
                    createdBy: userId
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
        console.error('Error in generateDiverseCodeQuestions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate diverse code questions',
            error: error.message
        });
    }
};

const saveEditedExam = async (req, res) => {

    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
        const { examId, title, questions, editedContent, duration } = req.body;

        if (!title || !questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid exam data'
            });
        }

        let exam;
        if (!examId) {
            exam = new CodingExam({
                title,
                questions,
                editedContent,
                type: 'coding',
                numQuestions: questions.length,
                createdBy: userId,
                duration: parseInt(duration) || 120 // Add duration
            });
        } else {
            exam = await CodingExam.findByIdAndUpdate(
                examId,
                {
                    title,
                    questions,
                    editedContent,
                    numQuestions: questions.length,
                    updatedAt: Date.now(),
                    duration: parseInt(duration) || 120 // Add duration
                },
                { new: true }
            );

            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found'
                });
            }
        }

        await exam.save();

        res.status(200).json({
            success: true,
            message: examId ? 'Exam updated successfully' : 'New exam created successfully',
            examId: exam._id,
            exam
        });
    } catch (error) {
        console.error('Error in saveEditedExam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save exam',
            error: error.message
        });
    }

    // When saving the exam
    console.log('AUTH DEBUG - Saving exam with createdBy:', userId);
};

const downloadCodingExam = async (req, res) => {
    let userId = null;
    if (req.user && req.user._id) {
        userId = req.user._id;
        console.log(`Using authenticated user ID: ${userId}`);
    } else {
        console.log('No authenticated user, proceeding with null user ID');
    }

    try {
        const { examId, title, questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid questions format'
            });
        }

        if (examId) {
            await CodingExam.findByIdAndUpdate(examId, {
                title,
                questions,
                numQuestions: questions.length,
                updatedAt: Date.now()
            });
        } else {
            const exam = new CodingExam({
                title,
                questions,
                type: 'coding',
                numQuestions: questions.length,
                createdBy: userId
            });
            await exam.save();
        }

        const pdfFileName = await generateCodingExamPDF(title, questions);
        const pdfPath = path.join(__dirname, '..', 'downloads', pdfFileName);

        res.download(pdfPath, `${title || 'coding_exam'}.pdf`, (err) => {
            if (err) {
                console.error('Error sending PDF:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to send PDF'
                });
            }

            fs.unlink(pdfPath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting PDF:', unlinkErr);
            });
        });
    } catch (error) {
        console.error('Error in downloadCodingExam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF',
            error: error.message
        });
    }
};

module.exports = {
    generateCodingQuestions,
    generateComplexQuestions,
    generateMathQuestions,
    generateDiverseCodeQuestions,
    saveEditedExam,
    downloadCodingExam
};