const Project = require('../models/Project');
const Scan = require('../models/Scan');
const Repository = require('../models/Repository');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async(req, res, next) => {
    try {
        const projects = await Project.find({ user: req.user._id })
            .populate('repository', 'name provider')
            .populate('latestScan', 'status createdAt completedAt')
            .sort({ updatedAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
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
            .populate('repository', 'name provider repoId')
            .populate('latestScan')
            .populate({
                path: 'scanHistory',
                options: { sort: { createdAt: -1 } }
            });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        next(error);
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async(req, res, next) => {
    try {
        const { name, description, repositoryId } = req.body;

        // Validate repository exists and belongs to user
        if (repositoryId) {
            const repository = await Repository.findOne({
                _id: repositoryId,
                user: req.user._id
            });

            if (!repository) {
                return res.status(404).json({
                    success: false,
                    message: 'Repository not found'
                });
            }
        }

        const projectData = {
            name,
            description,
            repository: repositoryId || null,
            user: req.user._id
        };

        const project = await Project.create(projectData);

        res.status(201).json({
            success: true,
            data: project,
            message: 'Project created successfully'
        });
    } catch (error) {
        console.error('Error creating project:', error);
        next(error);
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