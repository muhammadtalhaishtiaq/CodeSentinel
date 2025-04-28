const fs = require('fs');
const path = require('path');
const util = require('util');
const AdmZip = require('adm-zip');
const Project = require('../models/Project');
const Scan = require('../models/Scan');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const rmdir = util.promisify(fs.rm);

// Temp directory for extracted files
const TEMP_DIR = path.join(__dirname, '../../temp');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

// Create temp directory if it doesn't exist
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// @desc    Upload and scan code
// @route   POST /api/scans/upload
// @access  Private
exports.uploadAndScan = async(req, res, next) => {
    try {
        console.log("[DEBUG] Starting file upload process");

        // Check if file exists in request
        if (!req.files || !req.files.codeFile) {
            console.log("[DEBUG] No file uploaded");
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const file = req.files.codeFile;
        const projectName = req.body.projectName || 'Unnamed Project';
        const projectDescription = req.body.description || '';

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            console.log(`[DEBUG] File too large: ${file.size} bytes`);
            return res.status(400).json({
                success: false,
                message: 'File size should not exceed 20MB'
            });
        }

        // Validate file is a zip
        if (file.mimetype !== 'application/zip' && !file.name.endsWith('.zip')) {
            console.log(`[DEBUG] Invalid file type: ${file.mimetype}`);
            return res.status(400).json({
                success: false,
                message: 'Please upload a zip file'
            });
        }

        // Create a unique folder for this scan
        const scanId = uuidv4();
        const extractPath = path.join(TEMP_DIR, scanId);
        await mkdir(extractPath, { recursive: true });

        // Save zip file temporarily
        const zipPath = path.join(extractPath, 'upload.zip');
        await writeFile(zipPath, file.data);

        console.log(`[DEBUG] File saved to ${zipPath}`);

        // Create scan record in database
        const scan = await Scan.create({
            repositoryUrl: 'file-upload',
            status: 'in-progress',
            createdBy: req.user._id
        });

        // Create project record
        const project = await Project.create({
            name: projectName,
            description: projectDescription,
            user: req.user._id,
            latestScan: scan._id,
            scanHistory: [scan._id]
        });

        // Return scan ID for client to poll
        res.status(201).json({
            success: true,
            data: {
                scanId: scan._id,
                projectId: project._id
            },
            message: 'Upload successful, scan started'
        });

        // Process the scan asynchronously
        processScan(scan._id, zipPath, extractPath, req.user._id, project._id).catch(err => {
            console.error('Error processing scan:', err);
        });

    } catch (error) {
        console.error('[ERROR] Upload error:', error);
        next(error);
    }
};

// @desc    Get scan status
// @route   GET /api/scans/:id
// @access  Private
exports.getScanStatus = async(req, res, next) => {
    try {
        const scan = await Scan.findOne({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: scan
        });
    } catch (error) {
        next(error);
    }
};

// Helper function to process scan asynchronously
async function processScan(scanId, zipPath, extractPath, userId, projectId) {
    try {
        console.log(`[DEBUG] Processing scan ${scanId}`);

        // Extract zip
        const zip = new AdmZip(zipPath);
        zip.extractAllTo(extractPath, true);

        console.log(`[DEBUG] Zip extracted to ${extractPath}`);

        // Get the scan from database
        const scan = await Scan.findById(scanId);
        if (!scan) {
            console.error(`[ERROR] Scan ${scanId} not found`);
            return;
        }

        // Get the project from database
        const project = await Project.findById(projectId);
        if (!project) {
            console.error(`[ERROR] Project ${projectId} not found`);
            return;
        }

        // Find files recursively
        const files = findFiles(extractPath);
        console.log(`[DEBUG] Found ${files.length} files to scan`);

        // Initialize results
        let vulnerabilities = [];
        let lowCount = 0;
        let mediumCount = 0;
        let highCount = 0;
        let criticalCount = 0;

        // Process each file with LLM
        for (const file of files) {
            try {
                // Skip binaries, images, etc.
                if (isTextFile(file)) {
                    // Read file content
                    const content = await readFile(file, 'utf8');

                    // Get relative path for display
                    const relativePath = path.relative(extractPath, file);
                    console.log(`[DEBUG] Scanning file: ${relativePath}`);

                    // Skip empty files or files that are too large
                    if (!content.trim() || content.length > 100000) {
                        console.log(`[DEBUG] Skipping file (empty or too large): ${relativePath}`);
                        continue;
                    }

                    // Analyze code with LLM
                    const fileVulnerabilities = await analyzeCodeWithLLM(content, relativePath);

                    if (fileVulnerabilities && fileVulnerabilities.length > 0) {
                        // Count vulnerabilities by severity
                        fileVulnerabilities.forEach(vuln => {
                            switch (vuln.severity) {
                                case 'low':
                                    lowCount++;
                                    break;
                                case 'medium':
                                    mediumCount++;
                                    break;
                                case 'high':
                                    highCount++;
                                    break;
                                case 'critical':
                                    criticalCount++;
                                    break;
                            }
                        });

                        vulnerabilities = [...vulnerabilities, ...fileVulnerabilities];
                    }
                }
            } catch (err) {
                console.error(`[ERROR] Error processing file ${file}:`, err);
            }
        }

        // Update scan with results
        scan.status = 'completed';
        scan.completedAt = Date.now();
        scan.result = {
            vulnerabilities,
            summary: {
                lowCount,
                mediumCount,
                highCount,
                criticalCount
            }
        };

        await scan.save();
        console.log(`[DEBUG] Scan completed with ${vulnerabilities.length} vulnerabilities found`);

        // Update project summary
        if (project) {
            await project.updateSummary(scan);
            console.log(`[DEBUG] Project ${projectId} summary updated`);
        }

        // Clean up extracted files
        try {
            await rmdir(extractPath, { recursive: true });
            console.log(`[DEBUG] Cleaned up temporary files at ${extractPath}`);
        } catch (cleanupError) {
            console.error(`[ERROR] Error cleaning up files:`, cleanupError);
        }

    } catch (error) {
        console.error('[ERROR] Error processing scan:', error);

        // Update scan status to failed
        try {
            const scan = await Scan.findById(scanId);
            if (scan) {
                scan.status = 'failed';
                await scan.save();
            }
        } catch (updateError) {
            console.error('[ERROR] Error updating scan status:', updateError);
        }

        // Clean up
        try {
            await rmdir(extractPath, { recursive: true });
        } catch (cleanupError) {
            console.error('[ERROR] Error cleaning up files:', cleanupError);
        }
    }
}

// Helper function to analyze code with Claude 3.7 Sonnet
async function analyzeCodeWithLLM(code, fileName) {
    try {
        console.log(`[DEBUG] Analyzing code with LLM: ${fileName}`);

        // Check if API key is set
        if (!process.env.AIMLAPI_KEY) {
            console.error('[ERROR] AIMLAPI_KEY environment variable is not set');
            // Return mock data in development mode or empty in production
            if (process.env.NODE_ENV === 'development') {
                console.log('[DEBUG] Using mock data for development');
                return [{
                    type: "Mock Vulnerability",
                    severity: "medium",
                    description: "This is a mock vulnerability for testing. AIMLAPI_KEY is not set.",
                    location: fileName,
                    lineNumber: 1
                }];
            }
            return [];
        }

        // Determine language from file extension
        const extension = path.extname(fileName).toLowerCase();
        const language = getLanguageFromExtension(extension);

        // Prepare prompt for LLM
        const prompt = `
        You are a security expert code reviewer with expertise in identifying security vulnerabilities, bugs, and code quality issues. 
        Your task is to analyze the following ${language} code for security vulnerabilities and quality issues.
        
        File: ${fileName}
        
        CODE:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Analyze the code for security vulnerabilities and issues. Focus on:
        1. Security vulnerabilities (SQL injection, XSS, CSRF, insecure authentication, etc.)
        2. Input validation issues
        3. Authentication/authorization flaws
        4. Insecure cryptography
        5. Data exposure issues
        6. Dependencies with known vulnerabilities
        7. Code quality issues that may lead to security problems
        
        For each issue found, return a JSON object with the following information:
        - type: The type of vulnerability or issue
        - severity: Use only 'low', 'medium', 'high', or 'critical'
        - description: A detailed explanation of the issue
        - location: The specific function, method, or section where the issue is found
        - lineNumber: Approximate line number where the issue exists (if possible)
        
        If no issues are found, return an empty array. Only return the JSON array with no other text.
        `;

        try {
            // Call Claude 3.7 Sonnet via aimlapi
            const response = await axios.post('https://api.aimlapi.com/v1/chat/completions', {
                model: 'claude-3-7-sonnet-20250219',
                messages: [
                    { role: 'system', content: 'You are a security-focused static code analysis tool.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 4000
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.AIMLAPI_KEY}`
                    s
                }
            });

            console.log(`[DEBUG] LLM response received for ${fileName}`);

            // Extract vulnerabilities from response
            const content = response.data.choices[0].message.content.trim();

            // Try to parse vulnerabilities
            try {
                // Find JSON array in the response if not a clean JSON
                const match = content.match(/\[[\s\S]*\]/);
                const jsonStr = match ? match[0] : content;

                const vulnerabilities = JSON.parse(jsonStr);

                // Validate and clean up vulnerabilities
                const validVulnerabilities = vulnerabilities.filter(v =>
                    v && v.type && v.severity && v.description && ['low', 'medium', 'high', 'critical'].includes(v.severity)
                );

                console.log(`[DEBUG] Found ${validVulnerabilities.length} vulnerabilities in ${fileName}`);
                return validVulnerabilities;
            } catch (parseError) {
                console.error(`[ERROR] Failed to parse LLM response for ${fileName}:`, parseError);
                console.log(`[DEBUG] Raw LLM response:`, content);
                return [];
            }
        } catch (apiError) {
            console.error(`[ERROR] API error when analyzing code with LLM:`, apiError.message);
            if (apiError.response) {
                console.error(`[ERROR] API response:`, apiError.response.data);
            }
            return [];
        }
    } catch (error) {
        console.error(`[ERROR] Error analyzing code with LLM:`, error);
        return [];
    }
}

// Helper function to find all files recursively
function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git and other common directories to avoid processing unnecessary files
            if (!['node_modules', '.git', 'dist', 'build', 'coverage'].includes(file)) {
                results = results.concat(findFiles(fullPath));
            }
        } else {
            results.push(fullPath);
        }
    });

    return results;
}

// Helper function to determine if file is a text file
function isTextFile(filePath) {
    // Skip common binary and image extensions
    const binaryExtensions = [
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
        '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
        '.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.so', '.dylib',
        '.class', '.jar', '.war', '.ear', '.pyc', '.pyo'
    ];

    const ext = path.extname(filePath).toLowerCase();
    return !binaryExtensions.includes(ext);
}

// Helper function to determine language from file extension
function getLanguageFromExtension(extension) {
    const languageMap = {
        '.js': 'javascript',
        '.ts': 'typescript',
        '.jsx': 'javascript',
        '.tsx': 'typescript',
        '.py': 'python',
        '.java': 'java',
        '.c': 'c',
        '.cpp': 'cpp',
        '.cs': 'csharp',
        '.go': 'go',
        '.rb': 'ruby',
        '.php': 'php',
        '.html': 'html',
        '.css': 'css',
        '.scss': 'scss',
        '.json': 'json',
        '.md': 'markdown',
        '.sql': 'sql',
        '.sh': 'bash',
        '.bat': 'batch',
        '.ps1': 'powershell',
        '.swift': 'swift',
        '.kt': 'kotlin',
        '.rs': 'rust'
    };

    return languageMap[extension] || 'plaintext';
}