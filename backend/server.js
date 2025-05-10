const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const lectureRoutes = require('./routes/lectures');
const examRoutes = require('./routes/examRoutes');
const codingExamRoutes = require('./routes/codingExamRoutes');
const studentExamRoutes = require('./routes/studentExamRoutes');
const teacherExamRoutes = require('./routes/teacherExamRoutes');
const Exam = require('./models/Exam');
const CodingExam = require('./models/CodingExam');
const evaluationRoutes = require('./routes/evaluationRoutes');

//const evaluationRoutes = require('./routes/evaluationRoutes');


require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Add this function to your server.js and call it once
const updateExistingExams = async (userId) => {
    try {
        console.log(`Updating existing exams to associate with user: ${userId}`);
        
        // Update all essay exams that don't have a creator
        const essayResult = await Exam.updateMany(
            { createdBy: null },
            { $set: { createdBy: userId } }
        );
        
        // Update all coding exams that don't have a creator
        const codingResult = await CodingExam.updateMany(
            { createdBy: null },
            { $set: { createdBy: userId } }
        );
        
        console.log(`Updated ${essayResult.modifiedCount} essay exams and ${codingResult.modifiedCount} coding exams`);
    } catch (error) {
        console.error('Error updating existing exams:', error);
    }
};

// Call this function with your user ID
// You can run this once from anywhere in your code
updateExistingExams('6741d84aa5360fcf5ff30b88');







// Middleware - Set these up before routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create required directories
const fs = require('fs');
const directories = {
    uploads: path.join(__dirname, 'uploads'),
    downloads: path.join(__dirname, 'downloads'),
    exams: path.join(__dirname, 'exams'),
    data: path.join(__dirname, 'utils', 'data')
};

Object.values(directories).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Routes - Register all routes after middleware is set up
app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/coding-exams', codingExamRoutes);
app.use('/api/student/exams', studentExamRoutes);
app.use('/api/teacher', teacherExamRoutes);
app.use('/api/evaluation', evaluationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'An error occurred',
        error: err.message
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});