// pdfGenerator.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateExamPDF = (title, questions, includeAnswers = false) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                size: 'A4',
                margin: 50,
                bufferPages: true
            });

            const fileName = `${Date.now()}_exam.pdf`;
            const filePath = path.join(__dirname, '..', 'downloads', fileName);

            // Ensure downloads directory exists
            const downloadsDir = path.join(__dirname, '..', 'downloads');
            if (!fs.existsSync(downloadsDir)) {
                fs.mkdirSync(downloadsDir, { recursive: true });
            }

            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Add header
            doc.fontSize(16)
               .font('Helvetica-Bold')
               .text(title, { align: 'center' });

            doc.moveDown();
            doc.fontSize(12)
               .font('Helvetica')
               .text('Essay Questions', { align: 'center' });

            doc.moveDown();

            // Add questions
            questions.forEach((qa, index) => {
                // Check for page break
                if (doc.y > 700) {
                    doc.addPage();
                }

                // Question number and text
                doc.font('Helvetica-Bold')
                   .fontSize(12)
                   .text(`Question ${index + 1}:`, { continued: false });

                doc.font('Helvetica')
                   .fontSize(11)
                   .text(qa.question, {
                       lineGap: 2,
                       paragraphGap: 5,
                       width: doc.page.width - 100,
                       align: 'justify'
                   });

                doc.moveDown();

                // Answer section
                if (includeAnswers && qa.answer) {
                    doc.font('Helvetica-Bold')
                       .text('Answer:', { continued: false });
                    doc.font('Helvetica')
                       .text(qa.answer);
                } else {
                    // Add answer lines
                    doc.text('Answer:', { continued: false });
                    for (let i = 0; i < 5; i++) {
                        doc.moveDown(0.5);
                        doc.lineCap('butt')
                           .moveTo(50, doc.y)
                           .lineTo(doc.page.width - 50, doc.y)
                           .stroke();
                    }
                }

                doc.moveDown(2);
            });

            // Add page numbers
            let pages = doc.bufferedPageRange();
            for (let i = 0; i < pages.count; i++) {
                doc.switchToPage(i);
                doc.fontSize(10)
                   .text(
                       `Page ${i + 1} of ${pages.count}`,
                       0,
                       doc.page.height - 50,
                       { align: 'center' }
                   );
            }

            doc.end();

            stream.on('finish', () => {
                resolve(fileName);
            });

            stream.on('error', (error) => {
                reject(error);
            });

        } catch (error) {
            reject(error);
        }
    });
};

module.exports = { generateExamPDF };