const { spawn } = require('child_process');
const path = require('path');
const ExamAttempt = require('../models/ExamAttempt');
const CodingExam = require('../models/CodingExam');

/**
 * Run the Python evaluation script with JSON input and get JSON output
 * @param {Object} inputData - Data to send to Python script
 * @returns {Promise<Object>} - Parsed JSON result from Python
 */
const runMathEvaluator = async (inputData) => {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [
            path.join(__dirname, '..', 'utils', 'mathEvaluator.py')
        ]);

        let outputData = '';
        let errorData = '';

        // Send data to Python script
        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();

        // Collect output
        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        // Collect errors
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
            console.error(`Python Error: ${data}`);
        });

        // Handle process completion
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Math evaluation script exited with code ${code}: ${errorData}`));
                return;
            }

            try {
                const result = JSON.parse(outputData);
                resolve(result);
            } catch (error) {
                reject(new Error(`Failed to parse Python output: ${error.message}`));
            }
        });
    });
};

/**
 * Evaluate math exam submission
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const evaluateMathExam = async (req, res) => {
    try {
        const { submissionId } = req.params;

        // Get the submission
        const submission = await ExamAttempt.findById(submissionId)
            .populate('student', 'name email')
            .populate('exam');

        if (!submission) {
            return res.status(404).json({
                success: false,
                message: 'Submission not found'
            });
        }

        // Verify the teacher owns the exam
        if (submission.examType === 'CodingExam') {
            const exam = await CodingExam.findOne({
                _id: submission.exam,
                createdBy: req.user._id,
                type: 'math' // Ensure it's a math exam
            });

            if (!exam) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to evaluate this submission or this is not a math exam'
                });
            }

            // Prepare data for evaluation
            const evaluationData = {
                submissions: []
            };

            // Map questions and answers for evaluation
            submission.answers.forEach(answer => {
                // Find corresponding question in the exam
                const question = exam.questions.find(q => q._id.toString() === answer.questionId);
                
                if (question && question.teacherSolution) {
                    evaluationData.submissions.push({
                        questionId: answer.questionId,
                        question: question.question,
                        answer: answer.answer,
                        referenceAnswer: question.teacherSolution
                    });
                }
            });

            if (evaluationData.submissions.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No teacher solutions found for evaluation'
                });
            }

            // Run the Python evaluator
            const evaluationResult = await runMathEvaluator(evaluationData);

            if (!evaluationResult.success) {
                throw new Error(evaluationResult.error || 'Evaluation failed');
            }

            // Update submission with evaluation results
            let totalScore = 0;
            
            // Process each evaluated answer
            for (const result of evaluationResult.results) {
                const answerIndex = submission.answers.findIndex(
                    answer => answer.questionId === result.questionId
                );
                
                if (answerIndex !== -1) {
                    submission.answers[answerIndex].score = result.score;
                    submission.answers[answerIndex].feedback = result.feedback;
                    totalScore += result.score;
                }
            }

            // Calculate average score
            const questionsCount = evaluationResult.results.length;
            const averageScore = totalScore / questionsCount;
            
            // Update submission status and score
            submission.totalScore = Math.round(averageScore);
            submission.status = 'evaluated';
            submission.evaluatedAt = Date.now();
            
            await submission.save();

            return res.status(200).json({
                success: true,
                message: 'Submission evaluated successfully',
                totalScore: submission.totalScore,
                evaluatedAt: submission.evaluatedAt
            });
        } else {
            return res.status(400).json({
                success: false,
                message: 'This endpoint only supports math exam evaluation'
            });
        }
    } catch (error) {
        console.error('Error in evaluateMathExam:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate submission',
            error: error.message
        });
    }
};

/**
 * Bulk evaluate all math submissions for an exam
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
const evaluateAllMathSubmissions = async (req, res) => {
    try {
        const { examId } = req.params;

        // Verify teacher owns the exam
        const exam = await CodingExam.findOne({
            _id: examId,
            createdBy: req.user._id,
            type: 'math' // Ensure it's a math exam
        });

        if (!exam) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to evaluate submissions for this exam or this is not a math exam'
            });
        }

        // Get all submissions for this exam
        const submissions = await ExamAttempt.find({
            exam: examId,
            examType: 'CodingExam',
            status: 'submitted' // Only evaluate not-yet-evaluated submissions
        });

        if (submissions.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No pending submissions found for this exam',
                evaluatedCount: 0
            });
        }

        let evaluatedCount = 0;
        let failedCount = 0;

        // Evaluate each submission
        for (const submission of submissions) {
            try {
                // Prepare data for evaluation
                const evaluationData = {
                    submissions: []
                };

                // Map questions and answers for evaluation
                submission.answers.forEach(answer => {
                    const question = exam.questions.find(q => q._id.toString() === answer.questionId);
                    
                    if (question && question.teacherSolution) {
                        evaluationData.submissions.push({
                            questionId: answer.questionId,
                            question: question.question,
                            answer: answer.answer,
                            referenceAnswer: question.teacherSolution
                        });
                    }
                });

                if (evaluationData.submissions.length === 0) {
                    continue; // Skip this submission if no solutions found
                }

                // Run the Python evaluator
                const evaluationResult = await runMathEvaluator(evaluationData);

                if (!evaluationResult.success) {
                    failedCount++;
                    continue;
                }

                // Update submission with evaluation results
                let totalScore = 0;
                
                // Process each evaluated answer
                for (const result of evaluationResult.results) {
                    const answerIndex = submission.answers.findIndex(
                        answer => answer.questionId === result.questionId
                    );
                    
                    if (answerIndex !== -1) {
                        submission.answers[answerIndex].score = result.score;
                        submission.answers[answerIndex].feedback = result.feedback;
                        totalScore += result.score;
                    }
                }

                // Calculate average score
                const questionsCount = evaluationResult.results.length;
                const averageScore = totalScore / questionsCount;
                
                // Update submission status and score
                submission.totalScore = Math.round(averageScore);
                submission.status = 'evaluated';
                submission.evaluatedAt = Date.now();
                
                await submission.save();
                evaluatedCount++;
            } catch (error) {
                console.error(`Error evaluating submission ${submission._id}:`, error);
                failedCount++;
            }
        }

        return res.status(200).json({
            success: true,
            message: `Evaluation complete. ${evaluatedCount} submissions evaluated successfully, ${failedCount} failed.`,
            evaluatedCount,
            failedCount
        });

    } catch (error) {
        console.error('Error in evaluateAllMathSubmissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate submissions',
            error: error.message
        });
    }
};

module.exports = {
    evaluateMathExam,
    evaluateAllMathSubmissions
};