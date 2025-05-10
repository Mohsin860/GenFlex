
// Fixed generateCodingExamPDF in codingExamPdfGenerator.js - properly handles duration

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateCodingExamPDF = (title, questions, duration = 120) => {
    return new Promise((resolve, reject) => {
        try {
            // Parse duration as a number
            duration = parseInt(duration) || 120;
            
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            const fileName = `${Date.now()}_coding_exam.pdf`;
            const filePath = path.join(__dirname, '..', 'downloads', fileName);
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Header
            doc.font('Helvetica-Bold')
               .fontSize(18)
               .text(title.toUpperCase(), { align: 'center' });
            
            // Add a horizontal line under the title
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();

            // Exam details
            doc.moveDown();
            doc.fontSize(12)
               .font('Helvetica')
               .text(`Duration: ${formatDuration(duration)}`, { align: 'right' })
               .text('Maximum Marks: 100', { align: 'right' });

            // Instructions
            doc.moveDown(1.5);
            doc.font('Helvetica-Bold')
               .text('Instructions:', { continued: false });
            
            doc.font('Helvetica')
               .fontSize(11)
               .moveDown(0.5);
            
            const instructions = [
                'All questions are compulsory.',
                'Each question carries equal marks.',
                'Write clean, efficient code with proper comments.',
                'Proper indentation and code formatting will be considered for marking.',
                'Time complexity analysis will be considered in evaluation.',
                `You have ${formatDuration(duration)} to complete this exam. The timer starts when you begin the exam.`
            ];

            instructions.forEach((instruction, index) => {
                doc.text(`${index + 1}. ${instruction}`);
            });

            // Add a line after instructions
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y)
               .lineTo(545, doc.y)
               .stroke();

            // Questions
            questions.forEach((q, index) => {
                if (index > 0 && doc.y > 650) {
                    doc.addPage();
                }

                doc.moveDown();
                doc.font('Helvetica-Bold')
                   .fontSize(12)
                   .text(`Question ${index + 1}. [${Math.floor(100/questions.length)} Marks]`, { underline: true });
                
                doc.moveDown(0.5);
                
                // Clean question text
                let questionText = q.question
                    .replace(/[^\x00-\x7F]+/g, '') // Remove non-ASCII characters
                    .replace(/`/g, '"')            // Replace backticks with quotes
                    .trim();

                // Format bullet points
                questionText = questionText.split('\n').map(line => {
                    if (line.trim().startsWith('•')) {
                        return `  ${line.trim()}`; // Add proper indentation to bullet points
                    }
                    return line;
                }).join('\n');

                doc.font('Helvetica')
                   .fontSize(11)
                   .text(questionText, {
                       lineGap: 1,
                       align: 'justify',
                       indent: 20
                   });

                // Add space for answer
                doc.moveDown(2);
                doc.font('Helvetica')
                   .fontSize(10)
                   .text('Answer:', { indent: 20 });
                doc.moveDown(6);
            });

            // Footer with page numbers
            let pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.font('Helvetica')
                   .fontSize(10)
                   .text(
                       `Page ${i + 1} of ${pages.count}`,
                       50,
                       doc.page.height - 50,
                       {
                           align: 'center',
                           width: doc.page.width - 100
                       }
                   );
            }

            doc.end();

            stream.on('finish', () => resolve(fileName));
            stream.on('error', reject);

        } catch (error) {
            reject(error);
        }
    });
};

// Helper function to format duration in minutes to a human-readable format
function formatDuration(minutes) {
    if (typeof minutes !== 'number') {
        minutes = parseInt(minutes) || 120;
    }
    
    if (minutes >= 60) {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}${remainingMinutes > 0 ? ` ${remainingMinutes} minutes` : ''}`;
    } else {
        return `${minutes} minutes`;
    }
}

module.exports = { generateCodingExamPDF };

