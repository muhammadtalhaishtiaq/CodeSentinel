const Project = require('../models/Project');
const Scan = require('../models/Scan');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardData = async (req, res) => {
    try {
        // Get all active projects for the user
        const projects = await Project.find({
            user: req.user._id,
            status: { $ne: 'deleted' }
        })
            .populate('repository', 'name provider')
            .populate({
                path: 'latestScan',
                select: 'status createdAt completedAt result progress'
            })
            .sort({ updatedAt: -1 });

        // Calculate stats
        const totalProjects = projects.length;
        let totalIssues = 0;
        let secureProjects = 0;
        let lastScanDate = null;

        const formattedProjects = projects.map(project => {
            const p = project.toObject();
            let issuesCount = 0;
            let status = 'healthy';

            if (p.latestScan && p.latestScan.result && p.latestScan.result.summary) {
                const summary = p.latestScan.result.summary;
                issuesCount = summary.total || 0;

                if (summary.criticalCount > 0 || summary.highCount > 0) {
                    status = 'critical';
                } else if (summary.mediumCount > 0) {
                    status = 'warning';
                }
            }

            if (issuesCount === 0) secureProjects++;
            totalIssues += issuesCount;

            // Track most recent scan
            const scanDate = p.latestScan && (p.latestScan.completedAt || p.latestScan.createdAt);
            if (scanDate && (!lastScanDate || new Date(scanDate) > new Date(lastScanDate))) {
                lastScanDate = scanDate;
            }

            return {
                id: p._id,
                name: p.name,
                description: p.description || '',
                repository: p.repository,
                status,
                issuesCount,
                lastScanned: p.latestScan ? (p.latestScan.completedAt || p.latestScan.createdAt) : null,
                scanStatus: p.latestScan ? p.latestScan.status : 'none'
            };
        });

        // Format "last scan" as relative time string
        let lastScanText = 'Never';
        if (lastScanDate) {
            const diffMs = Date.now() - new Date(lastScanDate).getTime();
            const diffMins = Math.floor(diffMs / 60000);
            if (diffMins < 1) lastScanText = 'Just now';
            else if (diffMins < 60) lastScanText = `${diffMins} min ago`;
            else {
                const diffHours = Math.floor(diffMins / 60);
                if (diffHours < 24) lastScanText = `${diffHours}h ago`;
                else {
                    const diffDays = Math.floor(diffHours / 24);
                    lastScanText = `${diffDays}d ago`;
                }
            }
        }

        // Get recent activity (latest scans)
        const recentScans = await Scan.find({ createdBy: req.user._id })
            .populate('project', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .select('status createdAt completedAt result.summary project');

        const recentActivity = recentScans.map(scan => {
            const s = scan.toObject();
            let type = 'scan';
            let details = 'Scan started';

            if (s.status === 'completed') {
                const total = s.result && s.result.summary ? s.result.summary.total : 0;
                if (total > 0) {
                    type = 'vulnerability';
                    details = `${total} vulnerabilities detected`;
                } else {
                    details = 'Security scan completed — no issues';
                }
            } else if (s.status === 'failed') {
                type = 'error';
                details = 'Scan failed';
            } else if (s.status === 'in-progress') {
                details = 'Scan in progress';
            }

            return {
                id: s._id,
                type,
                projectId: s.project ? s.project._id : null,
                projectName: s.project ? s.project.name : 'Unknown Project',
                timestamp: s.completedAt || s.createdAt,
                details
            };
        });

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalProjects,
                    secureProjects,
                    openIssues: totalIssues,
                    lastScan: lastScanText
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