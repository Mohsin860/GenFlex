const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class PlagiarismChecker {
    constructor(mossPath = 'C:\\Users\\mohsi\\OneDrive\\Desktop\\moss') {
        this.mossPath = mossPath;
        this.tempDir = path.join(__dirname, '..', 'temp_submissions');
        this.perlPath = 'C:\\Strawberry\\perl\\bin\\perl.exe'; // Full path to perl
    }

    async ensureTempDirExists() {
        try {
            await fs.access(this.tempDir);
        } catch (error) {
            await fs.mkdir(this.tempDir, { recursive: true });
        }
    }

    async createTempFiles(submissions) {
        await this.ensureTempDirExists();
        
        const fileNames = [];
        
        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            const fileName = `student_${submission.studentId}_${submission.studentName.replace(/\s+/g, '_')}.py`;
            const filePath = path.join(this.tempDir, fileName);
            
            // Extract code from all answers and combine them
            let combinedCode = '';
            submission.answers.forEach((answer, index) => {
                combinedCode += `# Question ${index + 1}\n`;
                combinedCode += `# Student: ${submission.studentName}\n`;
                combinedCode += answer.answer + '\n\n';
            });
            
            await fs.writeFile(filePath, combinedCode, 'utf8');
            fileNames.push(fileName);
        }
        
        return fileNames;
    }

    async runMossCheck(fileNames, language = 'python') {
        return new Promise((resolve, reject) => {
            // Copy files to MOSS directory
            const copyPromises = fileNames.map(async (fileName) => {
                const sourcePath = path.join(this.tempDir, fileName);
                const destPath = path.join(this.mossPath, fileName);
                const content = await fs.readFile(sourcePath, 'utf8');
                await fs.writeFile(destPath, content, 'utf8');
                return fileName;
            });
            
            Promise.all(copyPromises).then((copiedFiles) => {
                const fileArgs = copiedFiles.join(' ');
                // Use full path to perl.exe
                const command = `cd /d "${this.mossPath}" && "${this.perlPath}" moss.pl -l ${language} ${fileArgs}`;
                
                console.log('Running command:', command);
                
                exec(command, { 
                    maxBuffer: 1024 * 1024,
                    timeout: 120000 
                }, async (error, stdout, stderr) => {
                    // Clean up copied files
                    try {
                        for (const fileName of copiedFiles) {
                            await fs.unlink(path.join(this.mossPath, fileName));
                        }
                    } catch (cleanupError) {
                        console.warn('Warning: Could not clean up MOSS directory files:', cleanupError.message);
                    }
                    
                    if (error) {
                        console.error('MOSS execution error:', error);
                        console.error('stderr:', stderr);
                        console.error('stdout:', stdout);
                        reject(new Error(`MOSS execution failed: ${error.message}`));
                        return;
                    }
                    
                    console.log('MOSS stdout:', stdout);
                    if (stderr) console.log('MOSS stderr:', stderr);
                    
                    // Extract MOSS result URL from output
                    const urlMatch = stdout.match(/http:\/\/moss\.stanford\.edu\/results\/\d+\/\d+/);
                    
                    if (urlMatch) {
                        resolve({
                            success: true,
                            resultUrl: urlMatch[0],
                            fullOutput: stdout
                        });
                    } else {
                        reject(new Error(`Could not find MOSS result URL in output. Output: ${stdout}`));
                    }
                });
            }).catch(reject);
        });
    }

    async cleanup() {
        try {
            const files = await fs.readdir(this.tempDir);
            for (const file of files) {
                await fs.unlink(path.join(this.tempDir, file));
            }
            await fs.rmdir(this.tempDir);
        } catch (error) {
            console.warn('Warning: Could not clean up temp files:', error.message);
        }
    }

    async checkPlagiarism(submissions) {
        try {
            if (!submissions || submissions.length < 2) {
                throw new Error('At least 2 submissions are required for plagiarism checking');
            }
            
            console.log(`Starting plagiarism check for ${submissions.length} submissions`);
            
            // Create temporary files
            const fileNames = await this.createTempFiles(submissions);
            console.log('Created temp files:', fileNames);
            
            // Run MOSS
            const result = await this.runMossCheck(fileNames);
            console.log('MOSS check completed:', result.resultUrl);
            
            // Cleanup temp files
            await this.cleanup();
            
            return {
                success: true,
                resultUrl: result.resultUrl,
                submissionCount: submissions.length,
                message: `Plagiarism check completed for ${submissions.length} submissions`
            };
            
        } catch (error) {
            // Cleanup on error
            await this.cleanup();
            throw error;
        }
    }
}

module.exports = PlagiarismChecker;