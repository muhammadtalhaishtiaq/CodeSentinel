const Project = require('../models/Project');
const Scan = require('../models/Scan');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async(req, res) => {
    try {
        // Get all projects for the user
        const projects = await Project.find({ user: req.user._id })
            .populate('latestScan')
            .sort({ updatedAt: -1 });

        // Calculate stats
        const totalProjects = projects.length;
        const secureProjects = projects.filter(project =>
            !project.latestScan ? .result ? .vulnerabilities ? .length
        ).length;

        // Calculate total open issues
        const openIssues = projects.reduce((total, project) => {
            if (project.latestScan ? .result ? .vulnerabilities) {
                return total + project.latestScan.result.vulnerabilities.length;
            }
            return total;
        }, 0);

        // Get last scan timestamp
        const lastScan = projects.length > 0 && projects[0].latestScan ?
            projects[0].latestScan.completedAt :
            null;

        // Format projects for dashboard
        const formattedProjects = projects.map(project => ({
            id: project._id,
            name: project.name,
            description: project.description || '',
            lastScanned: project.latestScan ? .completedAt ?
                new Date(project.latestScan.completedAt).toISOString() :
                'Never',
            status: getProjectStatus(project),
            issuesCount: project.latestScan ? .result ? .vulnerabilities ? .length || 0
        }));

        // Get recent activity
        const recentActivity = await getRecentActivity(projects);

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalProjects,
                    secureProjects,
                    openIssues,
                    lastScan: lastScan ? new Date(lastScan).toISOString() : null
                },
                projects: formattedProjects,
                recentActivity
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
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

// Helper function to get recent activity
async function getRecentActivity(projects) {
    const activities = [];

    for (const project of projects) {
        if (project.latestScan) {
            // Add scan completion activity
            activities.push({
                type: 'scan',
                projectId: project._id,
                projectName: project.name,
                timestamp: project.latestScan.completedAt,
                details: 'Security scan completed'
            });

            // Add vulnerability detection activity if any
            if (project.latestScan.result ? .vulnerabilities ? .length > 0) {
                activities.push({
                    type: 'vulnerability',
                    projectId: project._id,
                    projectName: project.name,
                    timestamp: project.latestScan.completedAt,
                    details: `${project.latestScan.result.vulnerabilities.length} vulnerabilities detected`
                });
            }
        }
    }

    // Sort by timestamp and limit to 3 most recent
    return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
}