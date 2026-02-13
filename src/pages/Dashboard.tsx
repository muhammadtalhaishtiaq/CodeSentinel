import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart2, ShieldCheck, Search, Clock, Plus, AlertTriangle, Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import ProjectCard from '@/components/ProjectCard';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authenticatedRequest } from '@/utils/authUtils';

interface DashboardProject {
  id: string;
  name: string;
  description: string;
  lastScanned: string | null;
  status: 'healthy' | 'warning' | 'critical';
  issuesCount: number;
  scanStatus: string;
}

interface DashboardStats {
  totalProjects: number;
  secureProjects: number;
  openIssues: number;
  lastScan: string;
}

interface ActivityItem {
  id: string;
  type: string;
  projectName: string;
  projectId: string | null;
  timestamp: string;
  details: string;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    secureProjects: 0,
    openIssues: 0,
    lastScan: 'Never'
  });
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authenticatedRequest('/api/dashboard');
        if (response.success && response.data) {
          const { stats: s, projects: p, recentActivity: r } = response.data;
          setStats(s);
          setRecentActivity(r || []);

          const transformedProjects: DashboardProject[] = (p || []).map((proj: any) => ({
            id: proj.id,
            name: proj.name,
            description: proj.description || '',
            lastScanned: proj.lastScanned ? formatRelativeTime(proj.lastScanned) : 'Never',
            status: proj.status,
            issuesCount: proj.issuesCount,
            scanStatus: proj.scanStatus
          }));
          setProjects(transformedProjects);
        }
      } catch (err: any) {
        console.error('Error fetching dashboard:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6">
            <div className="container mx-auto">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
                <Link to="/new-project">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mr-3" />
                  <span className="text-slate-600">Loading dashboard...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-700">{error}</p>
                  <Button variant="outline" className="mt-3" onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              ) : (
                <>
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title="Total Projects"
                      value={stats.totalProjects}
                      description="Active security monitoring"
                      icon={<BarChart2 className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Secure Projects"
                      value={stats.secureProjects}
                      description="No issues detected"
                      icon={<ShieldCheck className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Open Issues"
                      value={stats.openIssues}
                      description="Across all projects"
                      icon={<Search className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Last Scan"
                      value={stats.lastScan}
                      description="Most recent security audit"
                      icon={<Clock className="h-5 w-5" />}
                    />
                  </div>

                  {/* Projects Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
                    {projects.length === 0 ? (
                      <div className="bg-white rounded-lg shadow p-8 text-center">
                        <ShieldCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 mb-4">No projects yet. Create your first project to start scanning.</p>
                        <Link to="/new-project">
                          <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Project
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map(project => (
                          <ProjectCard key={project.id} {...project} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Activity */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="bg-white rounded-lg shadow p-6">
                      {recentActivity.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">No recent activity. Run a scan to see results here.</p>
                      ) : (
                        <div className="space-y-4">
                          {recentActivity.map(activity => (
                            <div key={activity.id} className="flex items-start">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${
                                activity.type === 'vulnerability'
                                  ? 'bg-yellow-100'
                                  : activity.type === 'error'
                                  ? 'bg-red-100'
                                  : 'bg-indigo-100'
                              }`}>
                                {activity.type === 'vulnerability' ? (
                                  <Search className="h-5 w-5 text-yellow-600" />
                                ) : activity.type === 'error' ? (
                                  <AlertTriangle className="h-5 w-5 text-red-600" />
                                ) : (
                                  <ShieldCheck className="h-5 w-5 text-indigo-600" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-slate-800 font-medium">{activity.details}</p>
                                <p className="text-slate-600 text-sm">
                                  {activity.projectName}
                                  {activity.timestamp ? ` — ${formatRelativeTime(activity.timestamp)}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

/** Format an ISO date string as a relative time like "2 hours ago" */
function formatRelativeTime(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default Dashboard;
