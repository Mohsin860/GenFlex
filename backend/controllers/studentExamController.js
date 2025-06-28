const Exam = require('../models/Exam');
const CodingExam = require('../models/CodingExam');
const ExamAttempt = require('../models/ExamAttempt');
const { spawn } = require('child_process');
const path = require('path');
const Query = require('../models/Query');

// Get all available exams for students
// In studentExamController.js, enhance the error handling:

// Update the getAvailableExams function
const getAvailableExams = async (req, res) => {
    try {
        // Fetch only published essay exams
        const essayExams = await Exam.find({ isPublished: true })
            .select('title questions createdAt')
            .sort({ createdAt: -1 });

        // Fetch only published coding exams
        const codingExams = await CodingExam.find({ isPublished: true })
            .select('title type difficulty numQuestions createdAt')
            .sort({ createdAt: -1 });

        console.log(`Found ${essayExams.length} published essay exams`);
        console.log(`Found ${codingExams.length} published coding exams`);

        // Transform to more user-friendly format with safe access to questions array
        const formattedEssayExams = essayExams.map(exam => ({
            _id: exam._id,
            title: exam.title,
            type: 'essay',
            questionCount: exam.questions ? exam.questions.length : 0, // Safe access
            createdAt: exam.createdAt,
            examModel: 'Exam'
        }));

        const formattedCodingExams = codingExams.map(exam => ({
            _id: exam._id,
            title: exam.title,
            type: exam.type || 'coding',
            difficulty: exam.difficulty,
            questionCount: exam.numQuestions || (exam.questions ? exam.questions.length : 0), // Safe access
            createdAt: exam.createdAt,
            examModel: 'CodingExam'
        }));

        // Combine all exams
        const allExams = [...formattedEssayExams, ...formattedCodingExams];

        console.log(`Returning ${allExams.length} total exams to student`);

        res.status(200).json({
            success: true,
            exams: allExams
        });
    } catch (error) {
        console.error('Error fetching available exams:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve available exams',
            error: error.message
        });
    }
};
// Get exam details by ID and type
// Fixed getExamById function in studentExamController.js

const getExamById = async (req, res) => {
    try {
        const { examId, examType } = req.params;

        let exam;
        if (examType === 'Exam') {
            exam = await Exam.findById(examId);
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findById(examId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type specified'
            });
        }

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Make sure duration is included in the response
        const examResponse = {
            ...exam.toObject(),
            duration: exam.duration || 120 // Ensure duration is set (default 120 minutes if not set)
        };

        // If exam details include timestamp fields, ensure they're properly formatted
        if (examResponse.createdAt) {
            examResponse.createdAt = new Date(examResponse.createdAt).toISOString();
        }

        if (examResponse.updatedAt) {
            examResponse.updatedAt = new Date(examResponse.updatedAt).toISOString();
        }

        console.log(`Sending exam with duration: ${examResponse.duration} minutes`);

        res.status(200).json({
            success: true,
            exam: examResponse
        });
    } catch (error) {
        console.error('Error fetching exam details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exam details',
            error: error.message
        });
    }
};

// Submit exam attempt without evaluation
// Submit exam attempt without evaluation
// Submit exam attempt with duration handling
// Updated submitExamAttempt function with improved handling of duration and expiration

const submitExamAttempt = async (req, res) => {
    try {
        const { examId, examType, answers, startedAt, timerExpired } = req.body;

        if (!examId || !examType || !answers || !Array.isArray(answers)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid exam attempt data'
            });
        }

        // First check if the exam exists
        let exam;
        if (examType === 'Exam') {
            exam = await Exam.findById(examId);
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findById(examId);
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type'
            });
        }

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Calculate expected end time based on exam duration and start time
        const startTime = startedAt ? new Date(parseInt(startedAt)) : new Date();
        const durationMinutes = exam.duration || 120; // Default 2 hours if not specified
        const expectedEndTime = new Date(startTime.getTime() + (durationMinutes * 60 * 1000));

        // Check if the student is submitting after the time limit
        const now = new Date();
        const isLate = now > expectedEndTime;

        // Get submission status - if timer expired or late submission, mark as "expired"
        const submissionStatus = timerExpired || isLate ? 'expired' : 'submitted';

        console.log(`Submitting exam with status: ${submissionStatus}, started at ${startTime}, expires at ${expectedEndTime}`);

        // Check if the student has already submitted this exam
        const existingAttempt = await ExamAttempt.findOne({
            student: req.user._id,
            exam: examId,
            examType: examType
        });

        if (existingAttempt) {
            // Option 1: Reject the new submission
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this exam',
                attemptId: existingAttempt._id
            });
        }

        // Create the exam attempt
        const examAttempt = new ExamAttempt({
            student: req.user._id, // Assuming user is available from auth middleware
            exam: examId,
            examType,
            answers: answers.map(answer => ({
                questionId: answer.questionId,
                answer: answer.answer,
                score: 0, // Will be updated during evaluation
                feedback: ''
            })),
            status: submissionStatus,
            resultsPublished: false,
            startedAt: startTime,
            expiresAt: expectedEndTime
        });

        await examAttempt.save();

        res.status(200).json({
            success: true,
            message: 'Exam submitted successfully',
            attemptId: examAttempt._id,
            isLate: isLate, // Inform client if submission was late
            timeTaken: Math.floor((now - startTime) / 60000) // Time taken in minutes
        });
    } catch (error) {
        console.error('Error submitting exam attempt:', error);

        // Check if this is a duplicate key error (MongoDB error code 11000)
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'You have already submitted this exam'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to submit exam attempt',
            error: error.message
        });
    }
};
// Get student's exam results
const getExamResults = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const attempt = await ExamAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Exam attempt not found'
            });
        }

        // Check if the attempt belongs to the requesting user
        if (attempt.student.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view these results'
            });
        }

        // Get exam details
        let exam;
        if (attempt.examType === 'Exam') {
            exam = await Exam.findById(attempt.exam);
        } else if (attempt.examType === 'CodingExam') {
            exam = await CodingExam.findById(attempt.exam);
        }

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Original exam not found'
            });
        }

        // Create base response with submission data but no scores
        const responseData = {
            success: true,
            examTitle: exam.title,
            examType: attempt.examType,
            status: attempt.status,
            submittedAt: attempt.submittedAt
        };

        // Student answers are always visible (without scores/feedback if not published)
        const studentAnswers = attempt.answers.map(answer => ({
            questionId: answer.questionId,
            answer: answer.answer
        }));

        // If evaluated and results are published, include scores and feedback
        if (attempt.status === 'evaluated' && attempt.resultsPublished) {
            responseData.totalScore = attempt.totalScore;
            responseData.evaluatedAt = attempt.evaluatedAt;
            responseData.answers = attempt.answers; // Include full answer data with scores
        } else {
            // Only evaluated but not published
            if (attempt.status === 'evaluated') {
                responseData.message = 'Your exam has been evaluated but results are not published yet.';
            } else {
                responseData.message = 'Your exam has been submitted and is pending evaluation.';
            }
            responseData.answers = studentAnswers; // Only include student answers, no scores
        }

        res.status(200).json(responseData);
    } catch (error) {
        console.error('Error retrieving exam results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exam results',
            error: error.message
        });
    }
};
// Get all attempts for a student
const getStudentAttempts = async (req, res) => {
    try {
        const attempts = await ExamAttempt.find({
            student: req.user._id
        }).sort({ submittedAt: -1 });

        // Get exam details for each attempt
        const attemptsWithDetails = await Promise.all(attempts.map(async (attempt) => {
            let exam;
            if (attempt.examType === 'Exam') {
                exam = await Exam.findById(attempt.exam);
            } else if (attempt.examType === 'CodingExam') {
                exam = await CodingExam.findById(attempt.exam);
            }

            // Only include scores if results are published
            const hasPublishedResults = attempt.status === 'evaluated' && attempt.resultsPublished;

            return {
                _id: attempt._id,
                examTitle: exam ? exam.title : 'Unknown Exam',
                examType: attempt.examType,
                // Only show scores if evaluated AND published
                totalScore: hasPublishedResults ? attempt.totalScore : null,
                status: attempt.status,
                resultsPublished: attempt.resultsPublished || false,
                submittedAt: attempt.submittedAt,
                evaluatedAt: attempt.evaluatedAt
            };
        }));

        res.status(200).json({
            success: true,
            attempts: attemptsWithDetails
        });
    } catch (error) {
        console.error('Error retrieving student attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exam attempts',
            error: error.message
        });
    }
};

// Submit a query about exam results
const submitQuery = async (req, res) => {
    try {
        const { attemptId, questionId, message } = req.body;
        
        // Get the attempt details
        const attempt = await ExamAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Exam attempt not found'
            });
        }

        // Get the exam to find the teacher
        let exam;
        if (attempt.examType === 'Exam') {
            exam = await Exam.findById(attempt.exam);
        } else if (attempt.examType === 'CodingExam') {
            exam = await CodingExam.findById(attempt.exam);
        }

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found'
            });
        }

        // Create the query
        const query = new Query({
            attempt: attemptId,
            student: req.user._id,
            teacher: exam.createdBy,
            exam: attempt.exam,
            examType: attempt.examType,
            questionId,
            message
        });

        await query.save();

        res.status(201).json({
            success: true,
            message: 'Query submitted successfully',
            query
        });
    } catch (error) {
        console.error('Error submitting query:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit query',
            error: error.message
        });
    }
};

// Get queries for an attempt
const getQueries = async (req, res) => {
    try {
        const { attemptId } = req.params;

        const queries = await Query.find({ attempt: attemptId })
            .sort({ createdAt: -1 })
            .populate('student', 'name email')
            .populate('teacher', 'name email');

        res.status(200).json({
            success: true,
            queries
        });
    } catch (error) {
        console.error('Error fetching queries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve queries',
            error: error.message
        });
    }
};

// Add these to exports
module.exports = {
    getAvailableExams,
    getExamById,
    submitExamAttempt,
    getExamResults,
    getStudentAttempts,
    submitQuery,
    getQueries
};