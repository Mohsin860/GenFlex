const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    questions: [{
        question: String,
        answer: String,
        context: String,
        teacherSolution: String  // Add this field for teacher's solution
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
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

module.exports = mongoose.model('Exam', examSchema);