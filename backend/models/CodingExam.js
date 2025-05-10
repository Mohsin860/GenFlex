const mongoose = require('mongoose');

const codingExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    questions: [{
        question: String,
        solution: String,
        teacherSolution: String  // Add this field for teacher's solution
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    editedContent: {
        type: String,
        required: false
    },
    type: {
        type: String,
        default: 'coding'
    },
    difficulty: String,
    numQuestions: Number,
    isPublished: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date,
        default: null
    },
    // Add duration in minutes
    duration: {
        type: Number,
        default: 120 // Default 2 hours
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CodingExam', codingExamSchema);