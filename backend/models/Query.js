const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
  attempt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExamAttempt',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  examType: {
    type: String,
    enum: ['Exam', 'CodingExam'],
    required: true
  },
  questionId: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  response: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Query', querySchema);