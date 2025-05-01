const fs = require('fs');
const path = require('path');
const util = require('util');
const AdmZip = require('adm-zip');
const Project = require('../models/Project');
const Scan = require('../models/Scan');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { exec } = require('child_process');
const execPromise = util.promisify(exec);
const SourceCredential = require('../models/SourceCredential');
const sharedEmitter = require('../utils/eventEmitter');

const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const rmdir = util.promisify(fs.rm);
const stat = util.promisify(fs.stat);

// Temp directory for extracted files
const TEMP_DIR = path.join(__dirname, '../../temp');
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_CONCURRENT_SCANS = 5; // Number of files to process in parallel

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

        console.log('File size', file.size);

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
        processScan(scan._id, project._id, req.body.branch).catch(err => {
            console.error('Error processing scan:', err);
        });

    } catch (error) {
        console.error('[ERROR] Upload error:', error);
        next(error);
    }
};

// @desc    Get scan status
// @route   GET /api/projects/:projectId/scans/:scanId/status
// @access  Private
exports.getScanStatus = async(req, res) => {
    try {
        const scan = await Scan.findById(req.params.scanId);
        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                status: scan.status,
                progress: scan.progress,
                message: scan.message,
                totalFiles: scan.totalFiles,
                scannedFiles: scan.scannedFiles
            }
        });
    } catch (error) {
        console.error('Error fetching scan status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching scan status'
        });
    }
};

// @desc    Start a new scan
// @route   POST /api/scans/start
// @access  Private
exports.startScan = async(req, res, next) => {
    console.log('[DEBUG] Starting scan...');
    try {
        const { projectId, branch } = req.body;
        console.log(`[DEBUG] Starting scan for projectId: ${projectId}, branch: ${branch}`);

        if (!projectId || !branch) {
            console.log('[DEBUG] Missing required parameters:', { projectId, branch });
            return res.status(400).json({
                success: false,
                message: 'Project ID and branch are required'
            });
        }

        // Find project
        console.log('[DEBUG] Looking up project...');
        const project = await Project.findOne({
            _id: projectId,
            user: req.user._id
        });

        if (!project) {
            console.log('[DEBUG] Project not found');
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Create new scan
        console.log('[DEBUG] Creating new scan record...');
        const scan = await Scan.create({
            project: projectId,
            user: req.user._id,
            status: 'pending',
            branch
        });

        // Update project's latest scan
        console.log('[DEBUG] Updating project with new scan...');
        project.latestScan = scan._id;
        project.scanHistory.push(scan._id);
        await project.save();

        // Start the scan process in background
        console.log('[DEBUG] Starting background scan process...');
        processScan(scan._id, projectId, branch).catch(error => {
            console.error('[DEBUG] Error in background scan process:', error);
            // Update scan status to failed if background process fails
            Scan.findByIdAndUpdate(scan._id, {
                status: 'failed',
                error: error.message,
                completedAt: Date.now()
            }).catch(updateError => {
                console.error('[DEBUG] Error updating scan status after failure:', updateError);
            });
        });

        // Respond immediately with scan ID
        console.log('[DEBUG] Sending immediate response with scan ID');
        res.status(200).json({
            success: true,
            data: scan
        });
    } catch (error) {
        console.error('[DEBUG] Error in startScan:', error);
        next(error);
    }
};

// Background process for scanning
const startScanningProcess = async(scanId, projectId, branch) => {
    try {
        // Find project and get repository details
        const project = await Project.findById(projectId).populate('repository');
        if (!project) {
            throw new Error('Project not found');
        }

        // Get user's GitHub credentials
        const credential = await SourceCredential.findOne({
            user: project.user,
            provider: 'github',
            isActive: true
        });

        if (!credential || !credential.githubToken) {
            throw new Error('No active GitHub credentials found');
        }

        // Fetch code from GitHub
        const fetchResponse = await fetch(`https://api.github.com/repos/${project.repository.name}/contents`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `token ${credential.githubToken}`
            }
        });

        if (!fetchResponse.ok) {
            throw new Error('Failed to fetch repository code from GitHub');
        }

        const files = await fetchResponse.json();
        const totalFiles = files.length;

        console.log('[DEBUG] Total files:', totalFiles);
        return false;

        // Update scan record with total files
        await Scan.findByIdAndUpdate(scanId, { totalFiles });

        // Process each file
        for (const file of files) {
            if (file.type === 'file') {
                // Fetch file content
                const fileResponse = await fetch(file.download_url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw',
                        'Authorization': `token ${credential.githubToken}`
                    }
                });

                if (!fileResponse.ok) {
                    console.error(`Failed to fetch file ${file.path}:`, fileResponse.statusText);
                    continue;
                }

                const content = await fileResponse.text();

                // Update scan progress
                await Scan.findByIdAndUpdate(scanId, {
                    $inc: { scannedFiles: 1 },
                    currentFile: file.path
                });

                // Analyze file content for vulnerabilities
                const vulnerabilities = await scanFile({ content, path: file.path });
                if (vulnerabilities.length > 0) {
                    await Scan.findByIdAndUpdate(scanId, {
                        vulnerabilities: vulnerabilities,
                        currentFile: file.path
                    });
                }
            }
        }

        // Update scan status to completed
        await Scan.findByIdAndUpdate(scanId, {
            status: 'completed',
            completedAt: Date.now()
        });

    } catch (error) {
        console.error('Error in scanning process:', error);
        await Scan.findByIdAndUpdate(scanId, {
            status: 'failed',
            error: error.message,
            completedAt: Date.now()
        });
    }
};

// Helper function to create directory structure
function createDirectoryStructure(fileTree) {
    const structure = {};

    Object.keys(fileTree).forEach(filePath => {
        const parts = filePath.split('/');
        let current = structure;

        for (let i = 0; i < parts.length - 1; i++) {
            const dir = parts[i];
            if (!current[dir]) {
                current[dir] = {
                    name: dir,
                    path: parts.slice(0, i + 1).join('/'),
                    files: [],
                    subdirectories: {}
                };
            }
            current = current[dir].subdirectories;
        }

        // Add file to its directory
        const dirPath = parts.slice(0, -1).join('/');
        const dir = getDirectory(structure, dirPath);
        if (dir) {
            dir.files.push(parts[parts.length - 1]);
        }
    });

    return structure;
}

// Helper function to get directory from structure
function getDirectory(structure, path) {
    const parts = path.split('/');
    let current = structure;

    for (const part of parts) {
        if (!current[part]) return null;
        current = current[part].subdirectories;
    }

    return current;
}

// Update processScan function
exports.processScan = async(scanId, projectId, branch, userId) => {
    try {
        // Get user's GitHub credentials
        const credential = await SourceCredential.findOne({
            user: userId,
            provider: 'github',
            isActive: true
        });

        if (!credential || !credential.githubToken) {
            throw new Error('No active GitHub credentials found');
        }

        // First get project details to get repository information
        const project = await Project.findById(projectId).populate('repository');
        if (!project || !project.repository) {
            throw new Error('Project or repository not found');
        }

        // Emit initial status
        try {
            sharedEmitter.emit('scan-progress', { scanId, progress: 0, message: 'Initializing scan...' });
        } catch (error) {
            console.error(`[ERROR] Failed to emit initial progress for scanId ${scanId}:`, error);
        }

        // Fetch only changed files from GitHub
        console.log(`[DEBUG] Fetching changes from GitHub for repo: ${project.repository.name}, branch: ${branch}`);
        console.log(`[DEBUG] Using GitHub token: ${credential.githubToken ? 'Present' : 'Missing'}`);

        try {
            const fetchResponse = await fetch(`https://api.github.com/repos/${project.repository.name}/compare/main...${branch}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${credential.githubToken}`
                },
                timeout: 60000
            });

            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                console.error(`[ERROR] GitHub API error: ${fetchResponse.status} - ${errorData.message}`);
                throw new Error(`Failed to fetch repository code from GitHub: ${errorData.message}`);
            }

            const compareData = await fetchResponse.json();
            console.log(`[DEBUG] Successfully fetched ${compareData.files?.length || 0} files from GitHub`);
            const files = compareData.files.filter(file =>
                file.status === 'modified' || file.status === 'added'
            );
            const totalFiles = files.length;

            // Update scan with total files and emit progress (25%)
            await Scan.findByIdAndUpdate(scanId, {
                totalFiles: files.length,
                progress: 25,
                message: 'Scanning files...'
            });
            try {
                sharedEmitter.emit('scan-progress', { scanId, progress: 25, message: 'Scanning files...' });
            } catch (error) {
                console.error(`[ERROR] Failed to emit 25% progress for scanId ${scanId}:`, error);
            }

            let scannedFiles = 0;
            let allVulnerabilities = [];

            // Process each file
            for (const file of files) {
                const fileResponse = await fetch(file.raw_url, {
                    headers: {
                        'Accept': 'application/vnd.github.v3.raw',
                        'Authorization': `token ${credential.githubToken}`
                    },
                    timeout: 60000
                });

                if (!fileResponse.ok) {
                    console.error(`Failed to fetch file ${file.raw_url}:`, fileResponse.statusText);
                    continue;
                }

                const content = await fileResponse.text();
                scannedFiles++;

                // Update scan progress and emit update (25-75%)
                const currentProgress = Math.min(25 + Math.floor((scannedFiles / files.length) * 50), 75);
                await Scan.findByIdAndUpdate(scanId, {
                    $inc: { scannedFiles: 1 },
                    currentFile: file.raw_url,
                    progress: currentProgress,
                    message: `Scanned ${scannedFiles} of ${files.length} files...`
                });
                let file_extension = file.raw_url.split('.').pop();
                let vulnerabilities = await scanFile(content, file.raw_url, file_extension);
                console.log('vulnerabilities', vulnerabilities);
                if (vulnerabilities.length > 0) {
                    console.log('All vulnerabilities before concat', allVulnerabilities);
                    allVulnerabilities = allVulnerabilities.concat(vulnerabilities);
                    console.log('All vulnerabilities after concat', allVulnerabilities);
                }
            }

            console.log('=== Starting Scan Results Processing ===');
            console.log(`Total vulnerabilities found: ${allVulnerabilities.length}`);
            console.log('Sample vulnerability:', allVulnerabilities[0]);

            // Calculate summary
            const summary = {
                total: allVulnerabilities.length,
                lowCount: allVulnerabilities.filter(v => v.severity === 'low').length,
                mediumCount: allVulnerabilities.filter(v => v.severity === 'medium').length,
                highCount: allVulnerabilities.filter(v => v.severity === 'high').length,
                criticalCount: allVulnerabilities.filter(v => v.severity === 'critical').length
            };

            console.log('\n=== Vulnerability Summary ===');
            console.log('Summary counts:', summary);

            // Prepare final result while maintaining schema structure
            const finalResult = {
                progress: 100,
                message: 'Scan completed',
                status: 'completed',
                result: {
                    vulnerabilities: allVulnerabilities.map(vuln => ({
                        type: vuln.type,
                        severity: vuln.severity,
                        description: vuln.description,
                        location: vuln.file_path,
                        lineNumber: vuln.line_number,
                        file_path: vuln.file_path,
                        file_name: vuln.file_name,
                        file_extension: vuln.file_extension,
                        original_code: vuln.original_code,
                        suggested_code: vuln.suggested_code,
                        potential_impact: vuln.potential_impact,
                        potential_solution: vuln.potential_solution,
                        potential_risk: vuln.potential_risk,
                        potential_mitigation: vuln.potential_mitigation,
                        potential_prevention: vuln.potential_prevention,
                        potential_detection: vuln.potential_detection
                    })),
                    summary: summary
                }
            };

            console.log('\n=== Final Result Structure ===');
            console.log('Result keys:', Object.keys(finalResult.result));
            console.log('Result summary:', finalResult.result.summary);
            console.log('Number of vulnerabilities:', finalResult.result.vulnerabilities.length);

            // Update scan with results
            await Scan.findByIdAndUpdate(scanId, finalResult);

            // Show last saved scan results in console
            const lastScan = await Scan.findById(scanId);
            console.log('\n=== Saved Scan Results ===');
            console.log('Scan ID:', lastScan._id);
            console.log('Status:', lastScan.status);
            console.log('Progress:', lastScan.progress);
            console.log('Message:', lastScan.message);
            console.log('Result summary:', lastScan.result.summary);
            console.log('Number of vulnerabilities:', lastScan.result.vulnerabilities.length);

        } catch (error) {
            console.error('Error in fetching changes from GitHub:', error);
            await Scan.findByIdAndUpdate(scanId, {
                status: 'failed',
                error: error.message,
                completedAt: Date.now()
            });
        }

    } catch (error) {
        console.error('\n=== Error in processScan ===');
        console.error('Error details:', error);
        await Scan.findByIdAndUpdate(scanId, {
            status: 'failed',
            error: error.message,
            completedAt: Date.now()
        });
    }
};

//2nd call for file scanning in which we are calling LLM for analysis and in result we are getting vulnerabilities
// Helper function to scan a single file
const scanFile = async(content, fileName, file_extension) => {
    // console.log([content, fileName, file_extension]);
    try {
        console.log(`[DEBUG] Scanning file: ${fileName}`);
        const vulnerabilities = [];

        // Analyze code with LLM
        const analysisResults = await analyzeCodeWithLLM(content, fileName, file_extension);
        console.log(['Befor pushing into vulnerabilities array ', analysisResults]);
        vulnerabilities.push(...analysisResults);
        console.log(['After pushing into vulnerabilities array ', vulnerabilities]);
        return vulnerabilities;
    } catch (error) {
        console.error(`[DEBUG] Error scanning file: ${fileName}`, error);
        return [];
    }
};

//3rd call for file scanning in which we are calling LLM for analysis and in result we are getting vulnerabilities
// Helper function to analyze code with Claude 3.7 Sonnet
async function analyzeCodeWithLLM(code, fileName, file_extension) {
    try {
        // console.log(`[DEBUG] Analyzing code with LLM: ${fileName}`);

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
        // const extension = path.extname(fileName).toLowerCase();
        const language = getLanguageFromExtension('.' + file_extension);

        console.log([
            "language",
            language,
            "extension",
            file_extension
        ]);

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
        8. Any other issues that you think are important
        9. If you are not sure about the severity, use 'medium'
        10. If you are not sure about the type, use 'Security Issue'
        11. If you are not sure about the location, use 'Unknown'
        12. Make sure to include the line number of the issue
        13. Make sure to include the file name of the issue
        
        For each issue found, return a JSON object with the following information:
        - type: The type of vulnerability or issue
        - severity: Use only 'low', 'medium', 'high', or 'critical'
        - description: A detailed explanation of the issue
        - location: The specific function, method, or section where the issue is found
        - lineNumber: Approximate line number where the issue exists (if any issue is found)
        - file_extension: The extension of the file
        - file_name: The name of the file
        - file_path: The path of the file
        - original_code: The original code that is vulnerable
        - suggested_code: The suggested code to fix the issue
        - potential_error: The potential error that can occur if the issue is not fixed
        - potential_impact: The potential impact of the issue
        - potential_risk: The potential risk of the issue
        - potential_solution: The potential solution to fix the issue
        - potential_mitigation: The potential mitigation to fix the issue
        - potential_prevention: The potential prevention to fix the issue
        - potential_detection: The potential detection to fix the issue
        
        
        If no issues are found, return an empty array. Only return the JSON array with no other text.
        `;

        // console.log([
        //     "prompt",
        //     prompt
        // ]);

        // try {
        // Simple API call with retries
        let response = null;
        let retries = 0;
        const maxRetries = 1;

        // while (!response && retries < maxRetries) {
        // try {
        // Call Claude 3.7 Sonnet via AIMLAPI according to docs
        // console.log(`[DEBUG] Attempting API call (attempt ${retries+1}/${maxRetries})`);

        // Try with x-api-key header instead of Authorization
        console.log('AIMLAPI_KEY', '0a1961ec336d4c14bb852f50b54fe191');
        response = await axios({
            method: 'post',
            url: 'https://api.aimlapi.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer 0a1961ec336d4c14bb852f50b54fe191`,
                'Content-Type': 'application/json',
                'Accept': '*/*'
            },
            data: {
                model: 'claude-3-7-sonnet-20250219',
                messages: [
                    // { role: 'system', content: 'You are a security-focused static code analysis tool.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.1,
                max_tokens: 4000,
            },
            timeout: 60000 // 60 second timeout
        });

        // console.log(`[DEBUG] API call successful for ${fileName}`);
        //     } catch (apiError) {
        //         retries++;
        //         console.error(`[ERROR] API call failed (attempt ${retries}/${maxRetries}):`, apiError.message);

        //         // Log more details about the error
        //         if (apiError.response) {
        //             console.error(`[ERROR] Status: ${apiError.response.status}, Data:`, apiError.response.data);
        //         }

        //         if (retries >= maxRetries) {
        //             throw apiError; // Re-throw if max retries reached
        //         }

        //         // Simple delay between retries
        //         await new Promise(resolve => setTimeout(resolve, 2000 * retries));
        //     }
        // }

        if (!response) {
            throw new Error('Failed to get response from API after retries');
        }

        // console.log(`[DEBUG] LLM response received for ${fileName}`);

        // Extract vulnerabilities from response
        const content = response.data.choices[0].message.content.trim();

        // console.log([
        //     "content",
        //     content
        // ]);

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
        // } catch (apiError) {
        //     console.error(`[ERROR] API error when analyzing code with LLM:`, apiError.message);
        //     if (apiError.response) {
        //         console.error(`[ERROR] API response:`, apiError.response.data);
        //     }
        //     // Return empty results on failure
        //     return [];
        // }
    } catch (error) {
        console.error(`[ERROR] Error analyzing code with LLM:`, error);
        return [];
    }
}

// Helper function to group vulnerabilities by file
const groupVulnerabilitiesByFile = (vulnerabilities) => {
    const grouped = {};

    vulnerabilities.forEach(vuln => {
        if (!grouped[vuln.location]) {
            grouped[vuln.location] = [];
        }
        grouped[vuln.location].push(vuln);
    });

    return grouped;
};

// Helper function to find line number of a pattern
const findLineNumber = (content, pattern) => {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(pattern)) {
            return i + 1;
        }
    }
    return -1;
};

// Helper function to extract code around a line
const extractCodeAroundLine = (content, lineNumber, context = 3) => {
    const lines = content.split('\n');
    const start = Math.max(0, lineNumber - context - 1);
    const end = Math.min(lines.length, lineNumber + context);
    return lines.slice(start, end).join('\n');
};

// Helper function to find all files recursively
function findFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git and other common directories to avoid processing unnecessary files
            if (!['node_modules', '.git', 'dist', 'build', 'coverage', '.idea', '.vscode'].includes(file)) {
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
    try {
        // Skip common binary and image extensions
        const binaryExtensions = [
            '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.svg',
            '.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx',
            '.zip', '.tar', '.gz', '.rar', '.7z', '.exe', '.dll', '.so', '.dylib',
            '.class', '.jar', '.war', '.ear', '.pyc', '.pyo', '.o', '.obj',
            '.mp3', '.mp4', '.avi', '.mov', '.flv', '.wmv', '.wma', '.aac',
            '.ttf', '.woff', '.woff2', '.eot', '.otf'
        ];

        const ext = path.extname(filePath).toLowerCase();
        if (binaryExtensions.includes(ext)) {
            return false;
        }

        // Check file size - skip large files
        const fileStat = fs.statSync(filePath);
        if (fileStat.size > 1024 * 1024) { // Skip files larger than 1MB
            return false;
        }

        // Try to read first few bytes to detect binary content
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(4096);
        const bytesRead = fs.readSync(fd, buffer, 0, 4096, 0);
        fs.closeSync(fd);

        // Check if the buffer contains null bytes (common in binary files)
        for (let i = 0; i < bytesRead; i++) {
            if (buffer[i] === 0) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error(`[ERROR] Error checking if file is text: ${filePath}`, error);
        return false;
    }
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
        '.rs': 'rust',
        '.dart': 'dart',
        '.kt': 'kotlin',
        '.swift': 'swift',
    };

    return languageMap[extension] || 'plaintext';
}

// @desc    Get scan progress via SSE
// @route   GET /api/scans/:scanId/progress
// @access  Private
exports.getScanProgress = async(req, res) => {
    console.log('[DEBUG] Getting scan progress');
    try {
        const { scanId } = req.params;
        const token = req.query.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authentication token is missing. Please log in again.'
            });
        }

        // Set SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        console.log('On SSE connection');

        // Send initial progress
        const scan = await Scan.findById(scanId);
        if (scan) {
            res.write(`data: ${JSON.stringify({
                progress: scan.progress || 5,
                message: scan.message || 'Initializing scan...!'
            })}\n\n`);
        }

        // Listen for progress updates
        const progressHandler = (event) => {
            if (event.scanId === scanId) {
                res.write(`data: ${JSON.stringify({
                    progress: event.progress,
                    message: event.message
                })}\n\n`);
            }
        };

        sharedEmitter.on('scan-progress', progressHandler);

        // Clean up on client disconnect
        req.on('close', () => {
            console.log('Client disconnected, removing event listener');
            sharedEmitter.removeListener('scan-progress', progressHandler);
        });
    } catch (error) {
        console.error('Error in getScanProgress:', error);
        res.end();
    }
};

// @desc    Get current scan status
// @route   GET /api/scans/:scanId/status
// @access  Private
exports.getScanStatus = async(req, res) => {
    try {
        const { scanId } = req.params;
        const scan = await Scan.findById(scanId);

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                progress: scan.progress,
                message: scan.message,
                status: scan.status
            }
        });
    } catch (error) {
        console.error('Error getting scan status:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting scan status'
        });
    }
};