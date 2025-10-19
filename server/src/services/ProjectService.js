/**
 * Project Service
 * Handles all business logic for projects
 * Following Single Responsibility Principle
 */

const Project = require('../models/Project');
const Scan = require('../models/Scan');
const Repository = require('../models/Repository');

class ProjectService {
    /**
     * Get all projects for a user with vulnerability counts
     */
    async getUserProjects(userId) {
        const projects = await Project.find({ user: userId })
            .populate('repository', 'name provider')
            .populate({
                path: 'latestScan',
                select: 'status createdAt completedAt result'
            })
            .sort({ updatedAt: -1 });

        return this.transformProjects(projects);
    }

    /**
     * Get single project by ID
     */
    async getProjectById(projectId, userId) {
        const project = await Project.findOne({
            _id: projectId,
            user: userId
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
            throw new Error('Project not found');
        }

        return this.transformProject(project);
    }

    /**
     * Create a new project
     */
    async createProject(data, userId) {
        const { name, description, repositoryId, branch } = data;

        // Validate repository exists
        const repository = await Repository.findById(repositoryId);
        if (!repository) {
            throw new Error('Repository not found');
        }

        // Create project
        const project = new Project({
            name,
            description,
            repository: repository._id,
            branch,
            user: userId
        });

        await project.save();
        await project.populate('repository');

        return project;
    }

    /**
     * Update project
     */
    async updateProject(projectId, userId, updates) {
        const project = await Project.findOne({
            _id: projectId,
            user: userId
        });

        if (!project) {
            throw new Error('Project not found');
        }

        // Update allowed fields
        const { name, description, status } = updates;
        if (name) project.name = name;
        if (description !== undefined) project.description = description;
        if (status && ['active', 'archived', 'deleted'].includes(status)) {
            project.status = status;
        }

        await project.save();
        return project;
    }

    /**
     * Delete project (soft delete)
     */
    async deleteProject(projectId, userId) {
        const project = await Project.findOne({
            _id: projectId,
            user: userId
        });

        if (!project) {
            throw new Error('Project not found');
        }

        project.status = 'deleted';
        await project.save();

        return { message: 'Project removed successfully' };
    }

    /**
     * Transform projects array with vulnerability counts
     */
    transformProjects(projects) {
        return projects.map(project => this.transformProject(project));
    }

    /**
     * Transform single project with vulnerability counts
     */
    transformProject(project) {
        const projectObj = project.toObject();

        // Initialize vulnerability counts
        projectObj.vulnerabilityCounts = {
            total: 0,
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };

        // Add vulnerability counts if scan results exist
        if (projectObj.latestScan?.result?.summary) {
            const summary = projectObj.latestScan.result.summary;
            projectObj.vulnerabilityCounts = {
                total: summary.total || 0,
                critical: summary.criticalCount || 0,
                high: summary.highCount || 0,
                medium: summary.mediumCount || 0,
                low: summary.lowCount || 0
            };
        }

        return projectObj;
    }
}

module.exports = new ProjectService();


