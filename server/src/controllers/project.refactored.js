/**
 * Project Controller (Refactored)
 * Thin controllers - only handle HTTP request/response
 * Business logic delegated to services
 */

const ProjectService = require('../services/ProjectService');
const ScanService = require('../services/ScanService');
const { AppError } = require('../utils/errors');

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res, next) => {
    try {
        const projects = await ProjectService.getUserProjects(req.user._id);
        
        res.status(200).json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res, next) => {
    try {
        const project = await ProjectService.getProjectById(
            req.params.id,
            req.user._id
        );
        
        res.status(200).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
    try {
        const project = await ProjectService.createProject(
            req.body,
            req.user._id
        );
        
        res.status(201).json({
            success: true,
            data: project
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
    try {
        const project = await ProjectService.updateProject(
            req.params.id,
            req.user._id,
            req.body
        );
        
        res.status(200).json({
            success: true,
            data: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const result = await ProjectService.deleteProject(
            req.params.id,
            req.user._id
        );
        
        res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Start a new scan for a project
// @route   POST /api/projects/:id/start-scan
// @access  Private
exports.startScan = async (req, res, next) => {
    try {
        const scan = await ScanService.startProjectScan(
            req.params.id,
            req.body.branch,
            req.user._id
        );
        
        res.status(200).json({
            success: true,
            data: scan
        });
    } catch (error) {
        next(error);
    }
};


