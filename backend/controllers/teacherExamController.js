const Exam = require('../models/Exam');
const CodingExam = require('../models/CodingExam');
const ExamAttempt = require('../models/ExamAttempt'); // Add this import
//onst ExamAttempt = require(path.join(__dirname, '..', 'models', 'ExamAttempt.js'));



// Get all exams created by teacher
const getTeacherExams = async (req, res) => {
    try {
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Using authenticated user ID: ${userId}`);
        } else {
            console.log('No authenticated user, proceeding with null user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to view your exams'
            });
        }
        
        // Log all exams in database (for debugging)
        const allEssayExams = await Exam.find({});
        const allCodingExams = await CodingExam.find({});
        
        console.log(`Total exams in database: ${allEssayExams.length} essay exams, ${allCodingExams.length} coding exams`);
        
        // Find exams that strictly match this user's ID
        const essayExams = await Exam.find({ createdBy: userId })
            .select('title questions createdAt isPublished publishedAt');
        
        const codingExams = await CodingExam.find({ createdBy: userId })
            .select('title type difficulty numQuestions createdAt isPublished publishedAt');
        
        console.log(`Found for this user: ${essayExams.length} essay exams, ${codingExams.length} coding exams`);
        
        // Print example exams to verify createdBy field
        if (allEssayExams.length > 0) {
            console.log('Example essay exam:', {
                id: allEssayExams[0]._id,
                title: allEssayExams[0].title,
                createdBy: allEssayExams[0].createdBy
            });
        }
        
        if (allCodingExams.length > 0) {
            console.log('Example coding exam:', {
                id: allCodingExams[0]._id,
                title: allCodingExams[0].title,
                createdBy: allCodingExams[0].createdBy
            });
        }
        
        // Transform to user-friendly format
        const formattedEssayExams = essayExams.map(exam => ({
            _id: exam._id,
            title: exam.title,
            type: 'essay',
            questionCount: exam.questions ? exam.questions.length : 0,
            createdAt: exam.createdAt,
            isPublished: exam.isPublished || false,
            publishedAt: exam.publishedAt || null,
            examModel: 'Exam'
        }));
        
        const formattedCodingExams = codingExams.map(exam => ({
            _id: exam._id,
            title: exam.title,
            type: exam.type || 'coding',
            difficulty: exam.difficulty || 'medium',
            questionCount: exam.questions ? exam.questions.length : (exam.numQuestions || 0),
            createdAt: exam.createdAt,
            isPublished: exam.isPublished || false,
            publishedAt: exam.publishedAt || null,
            examModel: 'CodingExam'
        }));
        
        // Combine all exams
        const allExams = [...formattedEssayExams, ...formattedCodingExams];
        
        res.status(200).json({
            success: true,
            exams: allExams
        });
    } catch (error) {
        console.error('Error fetching teacher exams:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exams',
            error: error.message
        });
    }
};

// Publish or unpublish an exam
const toggleExamPublish = async (req, res) => {
    try {
        const { examId, examType, publish } = req.body;

        if (!examId || !examType) {
            return res.status(400).json({
                success: false,
                message: 'Please provide both examId and examType'
            });
        }

        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Using authenticated user ID: ${userId}`);
        } else {
            console.log('No authenticated user');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to publish/unpublish exams'
            });
        }

        let exam;
        const updateData = {
            isPublished: !!publish,
            publishedAt: !!publish ? Date.now() : null
        };

        // Strict ownership check - only update if the exam belongs to this user
        if (examType === 'Exam') {
            exam = await Exam.findOneAndUpdate(
                { _id: examId, createdBy: userId },
                updateData,
                { new: true }
            );
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findOneAndUpdate(
                { _id: examId, createdBy: userId },
                updateData,
                { new: true }
            );
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type specified'
            });
        }

        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you are not authorized to modify this exam'
            });
        }

        res.status(200).json({
            success: true,
            message: publish ? 'Exam published successfully' : 'Exam unpublished successfully',
            exam: {
                _id: exam._id,
                title: exam.title,
                isPublished: exam.isPublished,
                publishedAt: exam.publishedAt
            }
        });
    } catch (error) {
        console.error('Error toggling exam publish status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update exam publish status',
            error: error.message
        });
    }
};

// Get exam details for solution editor
const getExamForSolution = async (req, res) => {
    try {
        const { examId, examType } = req.params;
        
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Getting exam for solution editing by user: ${userId}`);
        } else {
            console.log('No authenticated user, proceeding with null user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to edit solutions'
            });
        }
        
        let exam;
        if (examType === 'Exam') {
            exam = await Exam.findOne({ _id: examId, createdBy: userId });
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findOne({ _id: examId, createdBy: userId });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type specified'
            });
        }
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you are not authorized to edit this exam'
            });
        }
        
        res.status(200).json({
            success: true,
            exam
        });
    } catch (error) {
        console.error('Error fetching exam for solution editing:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve exam',
            error: error.message
        });
    }
};

// Save teacher solution for exam
const saveTeacherSolution = async (req, res) => {
    try {
        const { examId, examType, solutions } = req.body;
        
        if (!examId || !examType || !solutions || !Array.isArray(solutions)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide valid solution data'
            });
        }
        
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Saving solutions by user: ${userId}`);
        } else {
            console.log('No authenticated user, proceeding with null user ID');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to save solutions'
            });
        }
        
        let exam;
        if (examType === 'Exam') {
            // For Essay Exams
            exam = await Exam.findOne({ _id: examId, createdBy: userId });
            
            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found or you are not authorized to edit this exam'
                });
            }
            
            // Update each question's solution
            solutions.forEach((solution, index) => {
                if (index < exam.questions.length) {
                    exam.questions[index].teacherSolution = solution.solution;
                }
            });
            
            await exam.save();
            
        } else if (examType === 'CodingExam') {
            // For Coding Exams
            exam = await CodingExam.findOne({ _id: examId, createdBy: userId });
            
            if (!exam) {
                return res.status(404).json({
                    success: false,
                    message: 'Exam not found or you are not authorized to edit this exam'
                });
            }
            
            // Update each question's solution
            solutions.forEach((solution, index) => {
                if (index < exam.questions.length) {
                    exam.questions[index].teacherSolution = solution.solution;
                }
            });
            
            await exam.save();
            
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type specified'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Teacher solutions saved successfully',
            examId: exam._id
        });
    } catch (error) {
        console.error('Error saving teacher solutions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to save solutions',
            error: error.message
        });
    }
};

// Get student submissions for a specific exam
const getExamSubmissions = async (req, res) => {
    try {
        const { examId, examType } = req.params;
        
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Getting exam submissions for teacher: ${userId}`);
        } else {
            console.log('No authenticated user');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to view submissions'
            });
        }
        
        // First, verify the exam belongs to this teacher
        let exam;
        if (examType === 'Exam') {
            exam = await Exam.findOne({ _id: examId, createdBy: userId });
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findOne({ _id: examId, createdBy: userId });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type specified'
            });
        }
        
        if (!exam) {
            return res.status(404).json({
                success: false,
                message: 'Exam not found or you are not authorized to view submissions for this exam'
            });
        }
        
        // Fetch all submissions for this exam
        const submissions = await ExamAttempt.find({
            exam: examId,
            examType: examType
        }).populate('student', 'name email'); // Join with user data to get student names
        
        const submissionDetails = submissions.map(submission => ({
            submissionId: submission._id,
            studentId: submission.student._id,
            studentName: submission.student.name,
            studentEmail: submission.student.email,
            submittedAt: submission.submittedAt,
            status: submission.status,
            totalScore: submission.totalScore,
            evaluatedAt: submission.evaluatedAt,
            resultsPublished: submission.resultsPublished || false
        }));
        
        res.status(200).json({
            success: true,
            exam: {
                _id: exam._id,
                title: exam.title,
                type: examType === 'Exam' ? 'essay' : (exam.type || 'coding')
            },
            submissions: submissionDetails
        });
    } catch (error) {
        console.error('Error fetching exam submissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve submissions',
            error: error.message
        });
    }
};

// Get details of a specific submission
const getSubmissionDetails = async (req, res) => {
    try {
        const { submissionId } = req.params;
        
        let userId = null;
        if (req.user && req.user._id) {
            userId = req.user._id;
            console.log(`Getting submission details for teacher: ${userId}`);
        } else {
            console.log('No authenticated user');
            return res.status(401).json({
                success: false,
                message: 'Authentication required to view submission details'
            });
        }
        
        // Find the submission
        const submission = await ExamAttempt.findById(submissionId)
            .populate('student', 'name email')
            .populate('exam');
        
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }
        
        // Verify the exam belongs to this teacher
        let exam;
        if (submission.examType === 'Exam') {
            exam = await Exam.findOne({
                _id: submission.exam,
                createdBy: userId
            });
        } else if (submission.examType === 'CodingExam') {
            exam = await CodingExam.findOne({
                _id: submission.exam,
                createdBy: userId
            });
        }
        
        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this submission'
            });
        }
        
        res.status(200).json({
            success: true,
            submission: {
                _id: submission._id,
                examId: submission.exam._id,
                examTitle: submission.exam.title,
                examType: submission.examType,
                student: {
                    id: submission.student._id,
                    name: submission.student.name,
                    email: submission.student.email
                },
                answers: submission.answers,
                status: submission.status,
                totalScore: submission.totalScore,
                resultsPublished: submission.resultsPublished || false,
                submittedAt: submission.submittedAt,
                evaluatedAt: submission.evaluatedAt
            }
        });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve submission details',
            error: error.message
        });
    }
};

// Publish evaluation results to students
const publishSubmissionResults = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Get the submission
        const submission = await ExamAttempt.findById(submissionId);
        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Verify the teacher owns the exam
        let exam;
        if (submission.examType === 'Exam') {
            exam = await Exam.findOne({
                _id: submission.exam,
                createdBy: req.user._id
            });
        } else if (submission.examType === 'CodingExam') {
            exam = await CodingExam.findOne({
                _id: submission.exam,
                createdBy: req.user._id
            });
        }

        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to publish results for this submission'
            });
        }

        // Check if the submission has been evaluated
        if (submission.status !== 'evaluated') {
            return res.status(400).json({
                success: false,
                message: 'Cannot publish results for an unevaluated submission'
            });
        }

        // Update the submission to publish results
        submission.resultsPublished = true;
        await submission.save();

        return res.status(200).json({
            success: true,
            message: 'Results published successfully'
        });
    } catch (error) {
        console.error('Error publishing results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish results',
            error: error.message
        });
    }
};

// Publish all evaluation results for an exam
const publishAllResults = async (req, res) => {
    try {
        const { examId, examType } = req.params;

        // Verify teacher owns the exam
        let exam;
        if (examType === 'Exam') {
            exam = await Exam.findOne({
                _id: examId,
                createdBy: req.user._id
            });
        } else if (examType === 'CodingExam') {
            exam = await CodingExam.findOne({
                _id: examId,
                createdBy: req.user._id
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid exam type'
            });
        }

        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to publish results for this exam'
            });
        }

        // Update all evaluated submissions for this exam
        const result = await ExamAttempt.updateMany(
            {
                exam: examId,
                examType: examType,
                status: 'evaluated',
                resultsPublished: false
            },
            {
                $set: { resultsPublished: true }
            }
        );

        return res.status(200).json({
            success: true,
            message: `Published results for ${result.modifiedCount} submissions`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error publishing all results:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish results',
            error: error.message
        });
    }
};

// Delete a specific submission
const deleteSubmission = async (req, res) => {
    try {
      const { submissionId } = req.params;
      
      // Find the submission first (to check permissions)
      const submission = await ExamAttempt.findById(submissionId);
      
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }
      
      // Check if the exam belongs to this teacher
      let exam;
      if (submission.examType === 'Exam') {
        exam = await Exam.findOne({
          _id: submission.exam,
          createdBy: req.user._id
        });
      } else if (submission.examType === 'CodingExam') {
        exam = await CodingExam.findOne({
          _id: submission.exam,
          createdBy: req.user._id
        });
      }
      
      if (!exam) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete this submission'
        });
      }
      
      // Delete the submission and evaluation
      await ExamAttempt.findByIdAndDelete(submissionId);
      
      res.status(200).json({
        success: true,
        message: 'Submission and evaluation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete submission',
        error: error.message
      });
    }
  };
  
  // Delete all submissions for an exam
  const deleteAllSubmissions = async (req, res) => {
    try {
      const { examId, examType } = req.params;
      
      // Verify the teacher owns the exam
      let exam;
      if (examType === 'Exam') {
        exam = await Exam.findOne({
          _id: examId,
          createdBy: req.user._id
        });
      } else if (examType === 'CodingExam') {
        exam = await CodingExam.findOne({
          _id: examId,
          createdBy: req.user._id
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid exam type specified'
        });
      }
      
      if (!exam) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to delete submissions for this exam'
        });
      }
      
      // Delete all submissions for this exam
      const result = await ExamAttempt.deleteMany({
        exam: examId,
        examType: examType
      });
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} submissions deleted successfully`
      });
    } catch (error) {
      console.error('Error deleting submissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete submissions',
        error: error.message
      });
    }
  };

  // Update evaluation for a submission
const updateEvaluation = async (req, res) => {
    try {
      const { submissionId } = req.params;
      const { answers, totalScore } = req.body;
      
      // Find the submission
      const submission = await ExamAttempt.findById(submissionId);
      if (!submission) {
        return res.status(404).json({
          success: false,
          message: 'Submission not found'
        });
      }
      
      // Verify the teacher owns the exam
      let exam;
      if (submission.examType === 'Exam') {
        exam = await Exam.findOne({
          _id: submission.exam,
          createdBy: req.user._id
        });
      } else if (submission.examType === 'CodingExam') {
        exam = await CodingExam.findOne({
          _id: submission.exam,
          createdBy: req.user._id
        });
      }
      
      if (!exam) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to update this evaluation'
        });
      }
      
      // Update each answer's score and feedback
      answers.forEach((updatedAnswer) => {
        const answerIndex = submission.answers.findIndex(
          a => a._id.toString() === updatedAnswer.answerId
        );
        
        if (answerIndex !== -1) {
          submission.answers[answerIndex].score = updatedAnswer.score;
          submission.answers[answerIndex].feedback = updatedAnswer.feedback;
        }
      });
      
      // Update total score
      submission.totalScore = totalScore;
      
      // Update evaluation timestamp
      submission.evaluatedAt = Date.now();
      
      await submission.save();
      
      res.status(200).json({
        success: true,
        message: 'Evaluation updated successfully'
      });
    } catch (error) {
      console.error('Error updating evaluation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update evaluation',
        error: error.message
      });
    }
  };

// Add these to your exports
module.exports = {
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
    updateEvaluation
  };



