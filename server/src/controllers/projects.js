// @desc    Get last 3 projects with issue summaries
// @route   GET /api/projects/recent
// @access  Private
exports.getRecentProjects = async(req, res) => {
    try {
        // Get last 3 projects for the user
        const projects = await Project.find({ user: req.user._id })
            .populate('latestScan')
            .sort({ updatedAt: -1 })
            .limit(3);

        // Transform projects to include issue summaries
        const transformedProjects = projects.map(project => {
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
            if (projectObj.latestScan ? .result ? .vulnerabilities) {
                projectObj.vulnerabilityCounts = {
                    total: projectObj.latestScan.result.vulnerabilities.length,
                    critical: projectObj.latestScan.result.vulnerabilities.filter(v => v.severity === 'critical').length,
                    high: projectObj.latestScan.result.vulnerabilities.filter(v => v.severity === 'high').length,
                    medium: projectObj.latestScan.result.vulnerabilities.filter(v => v.severity === 'medium').length,
                    low: projectObj.latestScan.result.vulnerabilities.filter(v => v.severity === 'low').length
                };
            }

            return {
                id: projectObj._id,
                name: projectObj.name,
                description: projectObj.description || '',
                lastScanned: projectObj.latestScan ? .completedAt ?
                    new Date(projectObj.latestScan.completedAt).toISOString() :
                    'Never',
                status: getProjectStatus(projectObj),
                vulnerabilityCounts: projectObj.vulnerabilityCounts
            };
        });

        res.status(200).json({
            success: true,
            data: transformedProjects
        });
    } catch (error) {
        console.error('Error fetching recent projects:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent projects'
        });
    }
};

// Helper function to determine project status
function getProjectStatus(project) {
    if (!project.latestScan) return 'healthy';

    const vulnerabilities = project.latestScan.result ? .vulnerabilities || [];
    const hasCritical = vulnerabilities.some(v => v.severity === 'critical');
    const hasHigh = vulnerabilities.some(v => v.severity === 'high');

    if (hasCritical) return 'critical';
    if (hasHigh) return 'warning';
    return 'healthy';
}