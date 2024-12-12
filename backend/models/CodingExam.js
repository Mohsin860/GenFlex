const mongoose = require('mongoose');

const codingExamSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    questions: [{
        question: String,
        solution: String
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    editedContent: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('CodingExam', codingExamSchema);