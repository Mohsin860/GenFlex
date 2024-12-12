const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const lectureRoutes = require('./routes/lectures');
const examRoutes = require('./routes/examRoutes');
const codingExamRoutes = require('./routes/codingExamRoutes');

require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the downloads and uploads folders
app.use('/downloads', express.static(path.join(__dirname, 'downloads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create required directories if they don't exist
const fs = require('fs');
const directories = {
    uploads: path.join(__dirname, 'uploads'),
    downloads: path.join(__dirname, 'downloads'),
    exams: path.join(__dirname, 'exams'),
    data: path.join(__dirname, 'utils', 'data') // Added for ML model files
};

Object.values(directories).forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/coding-exams', codingExamRoutes); // Changed to avoid route conflicts
app.use('/api/exams', examRoutes);
app.use('/api/lectures', lectureRoutes);

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