const Project = require('../models/Project');
const Scan = require('../models/Scan');
const Repository = require('../models/Repository');
const scanController = require('./scan');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async(req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user._id })
            .populate('repository', 'name provider')
            .populate({
                path: 'latestScan',
                select: 'status createdAt completedAt result'
            })
            .sort({ updatedAt: -1 });

        // Transform projects to include vulnerability counts
        const transformedProjects = projects.map(project => {
            const projectObj = project.toObject();

            // Initialize vulnerability counts with default values
            projectObj.vulnerabilityCounts = {
                total: 0,
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            };

            // Add vulnerability counts if scan results exist
            if (projectObj.latestScan && projectObj.latestScan.result && projectObj.latestScan.result.summary) {
                const summary = projectObj.latestScan.result.summary;
                projectObj.vulnerabilityCounts = {
                    total: summary.total || 0,
                    critical: summary.critical || 0,
                    high: summary.high || 0,
                    medium: summary.medium || 0,
                    low: summary.low || 0
                };
            }

            return projectObj;
        });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: transformedProjects
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        next(error);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async(req, res, next) => {
    try {
        const project = await Project.findOne({
                _id: req.params.id,
                user: req.user._id
            })
            .populate({
                path: 'latestScan',
                select: 'status createdAt completedAt result'
            })
            .populate({
                path: 'scanHistory',
                select: 'status createdAt completedAt result',
                options: { sort: { createdAt: -1 } }
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Transform the data to match frontend expectations
        const transformedProject = {
            ...project.toObject(),
            scanResults: project.latestScan && project.latestScan.result || null,
            status: project.latestScan && project.latestScan.status || 'none',
            createdAt: project.latestScan && project.latestScan.createdAt || project.createdAt
        };

        // console.log(transformedProject);

        res.status(200).json({
            success: true,
            data: transformedProject
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        next(error);
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async(req, res) => {
    try {
        const { name, repositoryId, branch } = req.body;
        console.log('[DEBUG] Creating project with:', { name, repositoryId, branch });

        if (!name || !repositoryId || !branch) {
            return res.status(400).json({
                success: false,
                message: 'Name, repository, and branch are required'
            });
        }

        // Find the repository
        const repository = await Repository.findById(repositoryId);
        if (!repository) {
            return res.status(404).json({
                success: false,
                message: 'Repository not found'
            });
        }

        // Create the project
        const project = new Project({
            name,
            repository: repository._id,
            branch,
            user: req.user._id
        });

        await project.save();
        console.log('[DEBUG] Project created:', project);

        // Populate repository details
        await project.populate('repository');

        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('[DEBUG] Error creating project:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async(req, res, next) => {
    try {
        const { name, description, status } = req.body;

        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // Update fields
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status && ['active', 'archived', 'deleted'].includes(status)) {
            project.status = status;
        }

        await project.save();

        res.status(200).json({
            success: true,
            data: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        console.error('Error updating project:', error);
        next(error);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async(req, res, next) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        // For safety, just mark as deleted rather than actually deleting
        project.status = 'deleted';
        await project.save();

        res.status(200).json({
            success: true,
            message: 'Project removed successfully'
        });
    } catch (error) {
        console.error('Error deleting project:', error);
        next(error);
    }
};

// @desc    Add a new scan to project
// @route   POST /api/projects/:id/scans
// @access  Private
exports.addScanToProject = async(req, res, next) => {
    try {
        const { scanId } = req.body;

        if (!scanId) {
            return res.status(400).json({
                success: false,
                message: 'Scan ID is required'
            });
        }

        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        const scan = await Scan.findOne({
            _id: scanId,
            createdBy: req.user._id
        });

        if (!scan) {
            return res.status(404).json({
                success: false,
                message: 'Scan not found'
            });
        }

        // Update project with scan
        await project.updateSummary(scan);

        res.status(200).json({
            success: true,
            data: project,
            message: 'Scan added to project successfully'
        });
    } catch (error) {
        console.error('Error adding scan to project:', error);
        next(error);
    }
};

// @desc    Get latest scan results for project
// @route   GET /api/projects/:id/latest-scan
// @access  Private
exports.getLatestScan = async(req, res, next) => {
    try {
        const project = await Project.findOne({
            _id: req.params.id,
            user: req.user._id
        }).populate('latestScan');

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.latestScan) {
            return res.status(404).json({
                success: false,
                message: 'No scans found for this project'
            });
        }

        res.status(200).json({
            success: true,
            data: project.latestScan
        });
    } catch (error) {
        console.error('Error fetching latest scan:', error);
        next(error);
    }
};

// @desc    Start a new scan for a project
// @route   POST /api/projects/:id/start-scan
// @access  Private
exports.startScan = async(req, res) => {
    try {
        const projectId = req.params.id;
        const { branch } = req.body;

        console.log('[DEBUG] Starting scan for project:', { projectId, branch });

        if (!projectId || !branch) {
            return res.status(400).json({
                success: false,
                message: 'Project ID and branch are required'
            });
        }

        // Find the project with repository populated
        const project = await Project.findById(projectId).populate('repository');
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        if (!project.repository) {
            return res.status(400).json({
                success: false,
                message: 'Project has no repository configured'
            });
        }

        console.log('[DEBUG] Found project:', project);

        // Create a new scan record
        const scan = new Scan({
            project: projectId,
            branch,
            status: 'in-progress',
            createdBy: req.user._id,
            repositoryUrl: project.repository.repoId
        });

        await scan.save();
        console.log('[DEBUG] Scan record created:', scan);

        // Update project's latest scan
        project.latestScan = scan._id;
        await project.save();

        // Start the scan process in the background
        scanController.processScan(scan._id, projectId, branch, req.user._id)
            .catch(error => {
                console.error('[DEBUG] Error in background scan process:', error);
                // Update scan status to failed
                Scan.findByIdAndUpdate(scan._id, {
                    status: 'failed',
                    error: error.message
                }).catch(updateError => {
                    console.error('[DEBUG] Error updating scan status:', updateError);
                });
            });

        res.status(200).json({
            success: true,
            data: {
                _id: scan._id,
                status: scan.status
            }
        });
    } catch (error) {
        console.error('[DEBUG] Error starting scan:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};