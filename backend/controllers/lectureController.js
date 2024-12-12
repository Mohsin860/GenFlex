const Lecture = require('../models/Lecture');
const { summarizePDF } = require('../utils/summarizer');
const { generatePDF } = require('../utils/pdfGenerator0');
const path = require('path');
const fs = require('fs');

const createLecture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        const { title } = req.body;
        const pdfPath = req.file.path;

        // Generate summary
        const summary = await summarizePDF(pdfPath);
        
        // Generate downloadable PDF
        const summaryPdfName = await generatePDF(title, summary);

        // Create lecture in database
        const lecture = await Lecture.create({
            title,
            originalContent: pdfPath,
            summary,
            faculty: '6573c24e3ea8e1a6a9393a14', // Your placeholder faculty ID
            pdfPath,
            summaryPdfPath: summaryPdfName
        });

        res.status(201).json({
            success: true,
            data: lecture,
            summary,
            summaryPdfUrl: `/downloads/${summaryPdfName}`
        });

    } catch (error) {
        console.error('Error in createLecture:', error);
        res.status(500).json({
            message: 'Error creating lecture',
            error: error.message
        });
    }
};

const downloadSummary = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'downloads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(filePath);
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
};


module.exports = {
    createLecture,
    downloadSummary
};