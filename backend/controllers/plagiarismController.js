const ExamAttempt = require('../models/ExamAttempt');
const CodingExam = require('../models/CodingExam');
const PlagiarismChecker = require('../utils/plagiarismChecker');

/**
 * Check plagiarism for all submissions of a coding exam
 */
const checkExamPlagiarism = async (req, res) => {
    try {
        const { examId, examType } = req.params;
        
        // Verify this is a coding exam and teacher owns it
        if (examType !== 'CodingExam') {
            return res.status(400).json({
                success: false,
                message: 'Plagiarism checking is only available for coding exams'
            });
        }
        
        // Verify teacher owns the exam
        const exam = await CodingExam.findOne({
            _id: examId,
            createdBy: req.user._id
        });
        
        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to check plagiarism for this exam'
            });
        }
        
        // Get all submissions for this exam
        const submissions = await ExamAttempt.find({
            exam: examId,
            examType: examType
        }).populate('student', 'name email');
        
        if (submissions.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least 2 submissions are required for plagiarism checking'
            });
        }
        
        // Filter only coding submissions (ignore empty or non-code answers)
        const codingSubmissions = submissions.filter(submission => {
            return submission.answers && submission.answers.some(answer => 
                answer.answer && answer.answer.trim().length > 50 // Minimum code length
            );
        });
        
        if (codingSubmissions.length < 2) {
            return res.status(400).json({
                success: false,
                message: 'At least 2 valid coding submissions are required for plagiarism checking'
            });
        }
        
        // Prepare submission data for MOSS
        const submissionData = codingSubmissions.map(submission => ({
            studentId: submission.student._id.toString(),
            studentName: submission.student.name,
            studentEmail: submission.student.email,
            submissionId: submission._id.toString(),
            answers: submission.answers
        }));
        
        console.log(`Checking plagiarism for ${submissionData.length} submissions`);
        
        // Initialize plagiarism checker
        const plagiarismChecker = new PlagiarismChecker();
        
        // Run plagiarism check
        const result = await plagiarismChecker.checkPlagiarism(submissionData);
        
        res.status(200).json({
            success: true,
            examTitle: exam.title,
            examId: examId,
            resultUrl: result.resultUrl,
            submissionCount: result.submissionCount,
            message: result.message,
            checkedAt: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in checkExamPlagiarism:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to run plagiarism check',
            error: error.message
        });
    }
};

/**
 * Get plagiarism check history for an exam (if we want to store results later)
 */
const getPlagiarismHistory = async (req, res) => {
    try {
        const { examId, examType } = req.params;
        
        // Verify teacher owns the exam
        const exam = await CodingExam.findOne({
            _id: examId,
            createdBy: req.user._id
        });
        
        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view plagiarism history for this exam'
            });
        }
        
        // For now, return empty history since we're not storing results
        // This can be extended later to store plagiarism check results in database
        res.status(200).json({
            success: true,
            examTitle: exam.title,
            examId: examId,
            history: [],
            message: 'Plagiarism check history (feature coming soon)'
        });
        
    } catch (error) {
        console.error('Error in getPlagiarismHistory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve plagiarism history',
            error: error.message
        });
    }
};

module.exports = {
    checkExamPlagiarism,
    getPlagiarismHistory
};