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
        const { projectId, branch, pullRequestNumber } = req.body;
        console.log(`[DEBUG] Starting scan for projectId: ${projectId}, branch: ${branch}, PR: ${pullRequestNumber}`);

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
        }).populate('repository');

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
            createdBy: req.user._id,
            status: 'pending',
            branch
        });

        // Update project's latest scan
        console.log('[DEBUG] Updating project with new scan...');
        project.latestScan = scan._id;
        if (!project.scanHistory) {
            project.scanHistory = [];
        }
        project.scanHistory.push(scan._id);
        await project.save();

        // Start the scan process in background
        console.log('[DEBUG] Starting background scan process...');
        processScan(scan._id, projectId, branch, req.user._id, pullRequestNumber).catch(error => {
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
const processScan = async(scanId, projectId, branch, userId, pullRequestNumber = null) => {
    try {
        // First get project details to get repository information
        const project = await Project.findById(projectId).populate('repository');
        if (!project || !project.repository) {
            throw new Error('Project or repository not found');
        }

        const provider = project.repository.provider || 'github';
        console.log(`[SCAN] Processing ${pullRequestNumber ? 'PR #' + pullRequestNumber : 'branch ' + branch} for ${provider}`);

        // Get user's credentials for the correct provider
        const credential = await SourceCredential.findOne({
            user: userId,
            provider,
            isActive: true
        });

        if (!credential) {
            throw new Error(`No active ${provider} credentials found`);
        }

        // Emit initial status
        try {
            sharedEmitter.emit('scan-progress', { scanId, progress: 0, message: 'Initializing scan...' });
        } catch (error) {
            console.error(`[ERROR] Failed to emit initial progress for scanId ${scanId}:`, error);
        }

        let files = [];

        // ----- If PR number provided, scan ONLY PR files -----
        if (pullRequestNumber) {
            console.log(`[SCAN] Fetching files from PR #${pullRequestNumber}...`);
            
            if (provider === 'github') {
                const token = credential.githubToken || credential.accessToken;
                if (!token) throw new Error('No valid GitHub token found');

                console.log(`[DEBUG] Calling GitHub API: /repos/${project.repository.name}/pulls/${pullRequestNumber}/files`);
                const prFilesResponse = await fetch(`https://api.github.com/repos/${project.repository.name}/pulls/${pullRequestNumber}/files`, {
                    headers: {
                        'Authorization': `token ${token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    },
                    timeout: 60000
                });

                if (!prFilesResponse.ok) {
                    throw new Error(`GitHub PR API error: ${prFilesResponse.statusText}`);
                }

                const prFiles = await prFilesResponse.json();
                console.log(`[DEBUG] GitHub API returned ${prFiles.length} files from PR #${pullRequestNumber}`);
                console.log(`[DEBUG] Files metadata:`, JSON.stringify(prFiles.map(f => ({
                    filename: f.filename,
                    status: f.status,
                    additions: f.additions,
                    deletions: f.deletions,
                    changes: f.changes
                })), null, 2));
                
                for (const file of prFiles) {
                    console.log(`[DEBUG] Processing file: ${file.filename}, status: ${file.status}`);
                    
                    if (file.status !== 'removed') {
                        try {
                            console.log(`[DEBUG] Fetching content for: ${file.filename} from ${file.raw_url}`);
                            const fileResponse = await fetch(file.raw_url, {
                                headers: {
                                    'Authorization': `token ${token}`,
                                    'Accept': 'application/vnd.github.v3.raw'
                                },
                                timeout: 60000
                            });
                            if (fileResponse.ok) {
                                const content = await fileResponse.text();
                                console.log(`[DEBUG] ✅ Successfully fetched ${file.filename} (${content.length} chars, patch: ${file.patch?.length || 0} chars)`);
                                files.push({ 
                                    path: file.filename, 
                                    content, 
                                    raw_url: file.raw_url,
                                    patch: file.patch,  // Diff of changes
                                    additions: file.additions,
                                    deletions: file.deletions,
                                    isPR: true  // Flag to indicate PR scanning
                                });
                            } else {
                                console.error(`[DEBUG] ❌ Failed to fetch ${file.filename}: HTTP ${fileResponse.status} ${fileResponse.statusText}`);
                            }
                        } catch (err) {
                            console.error(`[DEBUG] ❌ Error fetching file ${file.filename}:`, err.message);
                        }
                    } else {
                        console.log(`[DEBUG] ⏭️ Skipping removed file: ${file.filename}`);
                    }
                }
                
                console.log(`[DEBUG] 📊 GitHub PR file fetching complete:`);
                console.log(`[DEBUG]    - API returned: ${prFiles.length} files`);
                console.log(`[DEBUG]    - Successfully fetched: ${files.length} files`);
                console.log(`[DEBUG]    - Files collected:`, files.map(f => f.path));

            } else if (provider === 'azure') {
                const pat = credential.azurePat;
                if (!pat) throw new Error('No valid Azure DevOps PAT found');

                const [org, projName, repoName] = project.repository.name.split('/');
                const azureOrg = credential.azureOrganization || org;
                const authHeader = 'Basic ' + Buffer.from(`:${pat}`).toString('base64');

                console.log(`[DEBUG] Calling Azure API: /pullRequests/${pullRequestNumber}/iterations`);

                const iterationsRes = await fetch(
                    `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/pullRequests/${pullRequestNumber}/iterations?api-version=7.0&$top=100`,
                    { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
                );

                if (!iterationsRes.ok) throw new Error(`Azure PR API error: ${iterationsRes.statusText}`);

                const iterationsData = await iterationsRes.json();
                const iterations = iterationsData.value || [];
                console.log(`[DEBUG] Found ${iterations.length} iterations in Azure PR #${pullRequestNumber}`);

                if (iterations.length > 0) {
                    const latestIteration = iterations[iterations.length - 1];
                    console.log(`[DEBUG] Fetching changes from latest iteration: ${latestIteration.id}`);

                    const changesRes = await fetch(
                        `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/pullRequests/${pullRequestNumber}/iterations/${latestIteration.id}/changes?api-version=7.0&$top=1000`,
                        { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
                    );

                    if (!changesRes.ok) {
                        throw new Error(`Azure PR changes API error: ${changesRes.statusText}`);
                    }

                    const changesData = await changesRes.json();
                    const changeEntries = changesData.changeEntries || [];
                    console.log(`[DEBUG] Azure iteration changes returned ${changeEntries.length} total items`);

                    const prChangedFiles = changeEntries.filter(change =>
                        change.item && change.item.path && !change.item.isFolder &&
                        (change.changeType === 'edit' || change.changeType === 'add')
                    );

                    console.log(`[DEBUG] Filtered to ${prChangedFiles.length} changed files (blobs only, excluding removed)`);

                    for (const change of prChangedFiles) {
                        try {
                            console.log(`[DEBUG] Fetching content for: ${change.item.path}`);
                            const fileRes = await fetch(
                                `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/items?path=${encodeURIComponent(change.item.path)}&versionDescriptor.version=${branch}&api-version=7.0`,
                                { headers: { 'Authorization': authHeader, 'Accept': 'text/plain' } }
                            );
                            if (fileRes.ok) {
                                const content = await fileRes.text();
                                console.log(`[DEBUG] ✅ Successfully fetched ${change.item.path} (${content.length} chars)`);
                                files.push({
                                    path: change.item.path,
                                    content,
                                    raw_url: change.item.path,
                                    isPR: true
                                });
                            } else {
                                console.error(`[DEBUG] ❌ Failed to fetch ${change.item.path}: HTTP ${fileRes.status}`);
                            }
                        } catch (err) {
                            console.error(`[DEBUG] ❌ Error fetching Azure file ${change.item.path}:`, err.message);
                        }
                    }
                }

                console.log(`[DEBUG] 📊 Azure PR file fetching complete:`);
                console.log(`[DEBUG]    - Successfully fetched: ${files.length} files`);
                console.log(`[DEBUG]    - Files collected:`, files.map(f => f.path));

            } else if (provider === 'bitbucket') {
                const token = credential.accessToken || credential.bitbucketToken;
                const username = credential.bitbucketUsername;
                let authHeader;
                if (credential.accessToken) {
                    authHeader = `Bearer ${token}`;
                } else {
                    authHeader = 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64');
                }

                const diffStatRes = await fetch(
                    `https://api.bitbucket.org/2.0/repositories/${project.repository.name}/pullrequests/${pullRequestNumber}/diffstat`,
                    { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
                );

                if (!diffStatRes.ok) throw new Error(`Bitbucket PR API error: ${diffStatRes.statusText}`);

                const diffStatData = await diffStatRes.json();
                const prChangedFiles = (diffStatData.values || []).filter(f => f.status !== 'removed');

                for (const file of prChangedFiles) {
                    const filePath = file.new ? file.new.path : (file.old ? file.old.path : null);
                    if (!filePath) continue;
                    try {
                        const fileRes = await fetch(
                            `https://api.bitbucket.org/2.0/repositories/${project.repository.name}/src/${branch}/${encodeURIComponent(filePath)}`,
                            { headers: { 'Authorization': authHeader } }
                        );
                        if (fileRes.ok) {
                            const content = await fileRes.text();
                            files.push({ path: filePath, content, raw_url: filePath });
                        }
                    } catch (err) {
                        console.error(`Failed to fetch Bitbucket file ${filePath}:`, err.message);
                    }
                }
            }

            console.log(`[SCAN] Fetched ${files.length} files from PR #${pullRequestNumber}`);
        } else {
            // ----- No PR number: Fetch changed files based on branch comparison -----
            console.log(`[SCAN] Fetching files from branch comparison (main...${branch})...`);

        // ----- Fetch changed files based on provider -----
        if (provider === 'github') {
            const token = credential.githubToken || credential.accessToken;
            if (!token) throw new Error('No valid GitHub token found');

            const fetchResponse = await fetch(`https://api.github.com/repos/${project.repository.name}/compare/main...${branch}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${token}`
                },
                timeout: 60000
            });

            if (!fetchResponse.ok) {
                const errorData = await fetchResponse.json();
                throw new Error(`GitHub API error: ${errorData.message || fetchResponse.statusText}`);
            }

            const compareData = await fetchResponse.json();
            const changedFiles = (compareData.files || []).filter(file =>
                file.status === 'modified' || file.status === 'added'
            );

            // Fetch content for each changed file
            for (const file of changedFiles) {
                try {
                    const fileResponse = await fetch(file.raw_url, {
                        headers: {
                            'Accept': 'application/vnd.github.v3.raw',
                            'Authorization': `token ${token}`
                        },
                        timeout: 60000
                    });
                    if (fileResponse.ok) {
                        const content = await fileResponse.text();
                        files.push({ path: file.filename, content, raw_url: file.raw_url });
                    }
                } catch (err) {
                    console.error(`Failed to fetch file ${file.filename}:`, err.message);
                }
            }

        } else if (provider === 'azure') {
            const pat = credential.azurePat;
            if (!pat) throw new Error('No valid Azure DevOps PAT found');

            const [org, projName, repoName] = project.repository.name.split('/');
            const azureOrg = credential.azureOrganization || org;
            const authHeader = 'Basic ' + Buffer.from(`:${pat}`).toString('base64');

            // Get commits in the branch to find changes
            const commitsRes = await fetch(
                `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/commits?searchCriteria.itemVersion.version=${branch}&api-version=7.0&$top=1`,
                { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
            );

            if (!commitsRes.ok) throw new Error(`Azure DevOps API error: ${commitsRes.statusText}`);

            const commitsData = await commitsRes.json();
            if (commitsData.value && commitsData.value.length > 0) {
                const lastCommit = commitsData.value[0];
                const changesRes = await fetch(
                    `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/commits/${lastCommit.commitId}/changes?api-version=7.0`,
                    { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
                );

                if (changesRes.ok) {
                    const changesData = await changesRes.json();
                    const changedFiles = (changesData.changes || []).filter(c =>
                        c.item && c.item.gitObjectType === 'blob' && !c.item.isFolder &&
                        (c.changeType === 'edit' || c.changeType === 'add')
                    );

                    for (const change of changedFiles) {
                        try {
                            const fileRes = await fetch(
                                `https://dev.azure.com/${azureOrg}/${projName}/_apis/git/repositories/${repoName}/items?path=${encodeURIComponent(change.item.path)}&versionDescriptor.version=${branch}&api-version=7.0`,
                                { headers: { 'Authorization': authHeader, 'Accept': 'text/plain' } }
                            );
                            if (fileRes.ok) {
                                const content = await fileRes.text();
                                files.push({ path: change.item.path, content, raw_url: change.item.path });
                            }
                        } catch (err) {
                            console.error(`Failed to fetch Azure file ${change.item.path}:`, err.message);
                        }
                    }
                }
            }

        } else if (provider === 'bitbucket') {
            const token = credential.accessToken || credential.bitbucketToken;
            const username = credential.bitbucketUsername;
            let authHeader;
            if (credential.accessToken) {
                authHeader = `Bearer ${token}`;
            } else {
                authHeader = 'Basic ' + Buffer.from(`${username}:${token}`).toString('base64');
            }

            // Bitbucket: get diff stat for the branch
            const diffStatRes = await fetch(
                `https://api.bitbucket.org/2.0/repositories/${project.repository.name}/diffstat/${branch}`,
                { headers: { 'Authorization': authHeader, 'Accept': 'application/json' } }
            );

            if (!diffStatRes.ok) throw new Error(`Bitbucket API error: ${diffStatRes.statusText}`);

            const diffStatData = await diffStatRes.json();
            const changedFiles = (diffStatData.values || []).filter(f =>
                f.status !== 'removed'
            );

            for (const file of changedFiles) {
                const filePath = file.new ? file.new.path : (file.old ? file.old.path : null);
                if (!filePath) continue;
                try {
                    const fileRes = await fetch(
                        `https://api.bitbucket.org/2.0/repositories/${project.repository.name}/src/${branch}/${encodeURIComponent(filePath)}`,
                        { headers: { 'Authorization': authHeader } }
                    );
                    if (fileRes.ok) {
                        const content = await fileRes.text();
                        files.push({ path: filePath, content, raw_url: filePath });
                    }
                } catch (err) {
                    console.error(`Failed to fetch Bitbucket file ${filePath}:`, err.message);
                }
            }
        }
        } // End of else block (branch comparison for non-PR scans)

        console.log(`[DEBUG] Fetched ${files.length} files from ${provider} for scanning`);
        const totalFiles = files.length;

        // ⚠️ DEBUG FLAG: Set to true to skip AI scanning and verify file fetching only
        const SKIP_AI_SCAN = true;  // 🔴 TEMPORARILY ENABLED FOR DEBUGGING - Change to false after verification
        
        if (SKIP_AI_SCAN) {
            console.log(`[DEBUG] 🚫 SKIP_AI_SCAN is enabled - skipping AI analysis, returning file list only`);
            console.log(`[DEBUG] Files that would be scanned:`, files.map(f => ({
                path: f.path,
                contentSize: f.content?.length || 0,
                patchSize: f.patch?.length || 0,
                isPR: f.isPR || false
            })));
            
            // Complete scan immediately with file info
            await Scan.findByIdAndUpdate(scanId, {
                status: 'completed',
                progress: 100,
                message: 'Debug: File fetching verified',
                completedAt: Date.now(),
                totalFiles,
                scannedFiles: totalFiles,
                result: {
                    vulnerabilities: [],
                    summary: { total: 0, lowCount: 0, mediumCount: 0, highCount: 0, criticalCount: 0 },
                    debug: {
                        filesCollected: files.map(f => f.path),
                        totalFiles: files.length,
                        message: 'AI scanning skipped for debugging'
                    }
                }
            });
            
            sharedEmitter.emit('scan-progress', { scanId, progress: 100, message: 'Debug: File fetching verified' });
            console.log(`[DEBUG] ✅ Scan completed in debug mode - ${totalFiles} files collected`);
            return;
        }

        // Update scan with total files and emit progress (25%)
        await Scan.findByIdAndUpdate(scanId, {
            totalFiles,
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

        // **OPTIMIZED: Batch files intelligently and process in parallel**
        const batches = createSmartBatches(files, pullRequestNumber ? true : false);
        console.log(`[SCAN] Created ${batches.length} batches for ${files.length} files`);

        const CONCURRENT_BATCHES = 3; // Process 3 batches concurrently
        
        for (let i = 0; i < batches.length; i += CONCURRENT_BATCHES) {
            const currentBatches = batches.slice(i, i + CONCURRENT_BATCHES);
            
            // Process batches in parallel
            const batchResults = await Promise.all(
                currentBatches.map(batch => scanBatch(batch, pullRequestNumber ? true : false))
            );

            // Aggregate results
            for (const batchVulns of batchResults) {
                allVulnerabilities = allVulnerabilities.concat(batchVulns);
                scannedFiles += batchVulns.filesScanned || 1;
                
                const currentProgress = Math.min(25 + Math.floor((scannedFiles / totalFiles) * 50), 75);
                await Scan.findByIdAndUpdate(scanId, {
                    scannedFiles,
                    progress: currentProgress,
                    message: `Scanned ${scannedFiles} of ${totalFiles} files...`
                });
            }
        }

        // Calculate summary
        const summary = {
            total: allVulnerabilities.length,
            lowCount: allVulnerabilities.filter(v => v.severity === 'low').length,
            mediumCount: allVulnerabilities.filter(v => v.severity === 'medium').length,
            highCount: allVulnerabilities.filter(v => v.severity === 'high').length,
            criticalCount: allVulnerabilities.filter(v => v.severity === 'critical').length
        };

        // Prepare final result
        const finalResult = {
            progress: 100,
            message: 'Scan completed',
            status: 'completed',
            completedAt: Date.now(),
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
                summary
            }
        };

        // Update scan with results
        await Scan.findByIdAndUpdate(scanId, finalResult);

        // Emit completion
        try {
            sharedEmitter.emit('scan-progress', { scanId, progress: 100, message: 'Scan completed' });
        } catch (error) {
            console.error(`[ERROR] Failed to emit completion for scanId ${scanId}:`, error);
        }

        console.log(`[SCAN] Completed scan ${scanId}: ${summary.total} vulnerabilities found`);

    } catch (error) {
        console.error(`[ERROR] processScan failed for scanId ${scanId}:`, error.message);
        await Scan.findByIdAndUpdate(scanId, {
            status: 'failed',
            error: error.message,
            completedAt: Date.now()
        });
        try {
            sharedEmitter.emit('scan-progress', { scanId, progress: -1, message: `Scan failed: ${error.message}` });
        } catch (emitError) {
            // ignore
        }
    }
};

// **NEW: Smart batching - groups files intelligently**
function createSmartBatches(files, isPRScan) {
    const batches = [];
    const MAX_BATCH_SIZE = isPRScan ? 5 : 3; // PR scans: batch more (smaller diffs)
    const MAX_BATCH_CONTENT_SIZE = 8000; // Max ~8k characters per batch (for context window)
    
    let currentBatch = [];
    let currentBatchSize = 0;
    
    for (const file of files) {
        const contentSize = isPRScan && file.patch 
            ? file.patch.length  // Use patch size for PR (much smaller)
            : file.content.length;
        
        // If file alone is too large, create single-file batch
        if (contentSize > MAX_BATCH_CONTENT_SIZE) {
            if (currentBatch.length > 0) {
                batches.push(currentBatch);
                currentBatch = [];
                currentBatchSize = 0;
            }
            batches.push([file]);
            continue;
        }
        
        // If adding this file would exceed limits, start new batch
        if (currentBatch.length >= MAX_BATCH_SIZE || 
            currentBatchSize + contentSize > MAX_BATCH_CONTENT_SIZE) {
            batches.push(currentBatch);
            currentBatch = [];
            currentBatchSize = 0;
        }
        
        currentBatch.push(file);
        currentBatchSize += contentSize;
    }
    
    // Add remaining batch
    if (currentBatch.length > 0) {
        batches.push(currentBatch);
    }
    
    return batches;
}

// **NEW: Scan a batch of files with single AI call**
async function scanBatch(batch, isPRScan) {
    try {
        if (batch.length === 1) {
            // Single file - use existing logic
            const file = batch[0];
            const file_extension = file.path.split('.').pop();
            const contentToScan = isPRScan && file.patch ? file.patch : file.content;
            const vulns = await scanFile(contentToScan, file.path, file_extension, isPRScan);
            vulns.filesScanned = 1;
            return vulns;
        }
        
        // Multiple files - batch them
        const vulnerabilities = [];
        const language = 'multi-language';
        
        // Build combined prompt with all files
        let filesContent = '';
        for (const file of batch) {
            const ext = file.path.split('.').pop();
            const lang = getLanguageFromExtension('.' + ext);
            const contentToScan = isPRScan && file.patch 
                ? `DIFF/PATCH (analyze ONLY changed lines):\n${file.patch}` 
                : file.content;
            
            filesContent += `\n\n--- FILE: ${file.path} (${lang}) ---\n${contentToScan}\n`;
        }
        
        const prompt = `
        You are a security expert code reviewer. Analyze the following ${batch.length} files for security vulnerabilities.
        
        ${isPRScan ? '⚠️ PR SCAN MODE: Focus ONLY on changed lines (marked with +/- in diffs). Do not analyze unchanged code.' : ''}
        
        FILES TO ANALYZE:
        ${filesContent}
        
        Focus on: SQL injection, XSS, CSRF, insecure auth, input validation, cryptography, data exposure, dependencies, and code quality issues.
        
        For each issue found, return a JSON object with: type, severity (low/medium/high/critical), description, location (file path), lineNumber, file_extension, file_name, file_path, original_code, suggested_code, potential_impact, potential_risk, potential_solution, potential_mitigation, potential_prevention, potential_detection.
        
        If no issues are found, return an empty array. Only return the JSON array with no other text.
        `;

        // API call
        const response = await axios({
            method: 'post',
            url: 'https://api.aimlapi.com/v1/chat/completions',
            headers: {
                'Authorization': `Bearer ${process.env.AIMLAPI_KEY}`,
                'Content-Type': 'application/json'
            },
            data: {
                model: 'claude-3-7-sonnet-20250219',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.1,
                max_tokens: 4000
            },
            timeout: 90000  // 90s for batches
        });

        const content = response.data.choices[0].message.content.trim();
        const match = content.match(/\[[\s\S]*\]/);
        const jsonStr = match ? match[0] : content;
        const parsed = JSON.parse(jsonStr);
        
        vulnerabilities.push(...parsed.filter(v => 
            v && v.type && v.severity && ['low', 'medium', 'high', 'critical'].includes(v.severity)
        ));
        
        vulnerabilities.filesScanned = batch.length;
        console.log(`[SCAN] Batch of ${batch.length} files: ${vulnerabilities.length} vulnerabilities found`);
        return vulnerabilities;
        
    } catch (error) {
        console.error(`[ERROR] Error scanning batch:`, error.message);
        return { filesScanned: batch.length };
    }
}

//2nd call for file scanning in which we are calling LLM for analysis
const scanFile = async(content, fileName, file_extension, isPRScan = false) => {
    try {
        const vulnerabilities = [];
        const analysisResults = await analyzeCodeWithLLM(content, fileName, file_extension, isPRScan);
        vulnerabilities.push(...analysisResults);
        return vulnerabilities;
    } catch (error) {
        console.error(`[ERROR] Error scanning file: ${fileName}`, error.message);
        return [];
    }
};

// Analyze code with Claude 3.7 Sonnet via AIML API
async function analyzeCodeWithLLM(code, fileName, file_extension, isPRScan = false) {
    try {
        if (!process.env.AIMLAPI_KEY) {
            console.error('[ERROR] AIMLAPI_KEY environment variable is not set');
            if (process.env.NODE_ENV === 'development') {
                return [{
                    type: "Mock Vulnerability",
                    severity: "medium",
                    description: "This is a mock vulnerability for testing. AIMLAPI_KEY is not set.",
                    location: fileName,
                    lineNumber: 1,
                    file_path: fileName,
                    file_name: fileName.split('/').pop(),
                    file_extension: file_extension
                }];
            }
            return [];
        }

        const language = getLanguageFromExtension('.' + file_extension);
        const codeType = isPRScan ? 'DIFF/PATCH (changed lines only)' : 'full file code';

        const prompt = `
        You are a security expert code reviewer. Analyze the following ${language} ${codeType} for security vulnerabilities and quality issues.
        
        ${isPRScan ? '⚠️ PR SCAN MODE: This is a diff/patch showing ONLY changed lines. Focus your analysis on the changes (lines marked with + or -). Ignore context lines unless they directly relate to the vulnerability.' : ''}
        
        File: ${fileName}
        
        CODE:
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Focus on: SQL injection, XSS, CSRF, insecure auth, input validation, cryptography, data exposure, dependencies, and code quality issues.
        
        For each issue found, return a JSON object with: type, severity (low/medium/high/critical), description, location, lineNumber, file_extension, file_name, file_path, original_code, suggested_code, potential_impact, potential_risk, potential_solution, potential_mitigation, potential_prevention, potential_detection.
        
        If no issues are found, return an empty array. Only return the JSON array with no other text.
        `;

        // API call with retry
        let response = null;
        const maxRetries = 2;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                response = await axios({
                    method: 'post',
                    url: 'https://api.aimlapi.com/v1/chat/completions',
                    headers: {
                        'Authorization': `Bearer ${process.env.AIMLAPI_KEY}`,
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    data: {
                        model: 'claude-3-7-sonnet-20250219',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.1,
                        max_tokens: 4000,
                    },
                    timeout: 60000
                });
                break; // Success — exit retry loop
            } catch (apiError) {
                console.error(`[ERROR] API call failed (attempt ${attempt}/${maxRetries}) for ${fileName}:`, apiError.message);
                if (attempt >= maxRetries) throw apiError;
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }

        if (!response) {
            throw new Error('Failed to get response from API after retries');
        }

        // Extract and parse vulnerabilities from response
        const content = response.data.choices[0].message.content.trim();

        try {
            const match = content.match(/\[[\s\S]*\]/);
            const jsonStr = match ? match[0] : content;
            const vulnerabilities = JSON.parse(jsonStr);

            return vulnerabilities.filter(v =>
                v && v.type && v.severity && v.description && ['low', 'medium', 'high', 'critical'].includes(v.severity)
            );
        } catch (parseError) {
            console.error(`[ERROR] Failed to parse LLM response for ${fileName}:`, parseError.message);
            return [];
        }
    } catch (error) {
        console.error(`[ERROR] Error analyzing code with LLM for ${fileName}:`, error.message);
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

exports.processScan = processScan;