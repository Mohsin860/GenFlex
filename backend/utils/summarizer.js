const { spawn } = require('child_process');
const path = require('path');

const summarizePDF = (pdfPath) => {
    return new Promise((resolve, reject) => {
        const pythonScript = spawn('python', [
            path.join(__dirname, 'summarize.py'),
            pdfPath
        ]);

        let output = '';
        let errorOutput = '';

        pythonScript.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonScript.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonScript.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Summarization failed: ${errorOutput}`));
            } else {
                // Clean up the output and ensure proper bullet point formatting
                const summary = output
                    .split('\n')
                    .filter(line => line.trim())
                    .map(line => line.startsWith('•') ? line : `• ${line}`)
                    .join('\n');
                resolve(summary);
            }
        });
    });
};

module.exports = { summarizePDF };