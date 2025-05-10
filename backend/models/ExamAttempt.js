const mongoose = require('mongoose');

const examAttemptSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'examType',
        required: true
    },
    examType: {
        type: String,
        enum: ['Exam', 'CodingExam'],
        required: true
    },
    answers: [{
        questionId: String,
        answer: String,
        score: Number,
        feedback: String
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['submitted', 'evaluated', 'reviewing', 'expired'],
        default: 'submitted'
    },
    resultsPublished: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    evaluatedAt: Date
}, {
    timestamps: true
});

// Add a compound index to ensure a student can only have one attempt per exam
examAttemptSchema.index({ student: 1, exam: 1 }, { unique: true });

module.exports = mongoose.model('ExamAttempt', examAttemptSchema);