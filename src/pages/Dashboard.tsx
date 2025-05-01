import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart2, ShieldCheck, Search, Clock, Plus } from 'lucide-react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatsCard from '@/components/StatsCard';
import ProjectCard from '@/components/ProjectCard';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from '@/components/ui/resizable';
import { SidebarProvider } from '@/components/ui/sidebar';
import { authenticatedRequest } from '@/utils/authUtils';

interface Project {
  id: string;
  name: string;
  description: string;
  lastScanned: string;
  status: 'healthy' | 'warning' | 'critical';
  issuesCount: number;
}

// Mock project data
const mockProjects = [
  {
    id: '1',
    name: 'E-commerce Platform',
    description: 'Main backend API for the e-commerce platform',
    lastScanned: '2 hours ago',
    status: 'healthy' as const,
    issuesCount: 0
  },
  {
    id: '2',
    name: 'User Authentication Service',
    description: 'OAuth provider and user management',
    lastScanned: '1 day ago',
    status: 'warning' as const,
    issuesCount: 3
  },
  {
    id: '3',
    name: 'Payment Processing API',
    description: 'Integration with payment providers',
    lastScanned: '3 days ago',
    status: 'critical' as const,
    issuesCount: 5
  }
];

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await authenticatedRequest('/api/projects/recent');
        if (response.success) {
          const transformedProjects = response.data.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description,
            lastScanned: project.lastScanned,
            status: project.status,
            issuesCount: project.vulnerabilityCounts.total
          }));
          setProjects(transformedProjects);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        // Keep mock data if API fails
        setProjects(mockProjects);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        {/* <ResizablePanelGroup direction="horizontal"> */}
          {/* <ResizablePanel defaultSize={20} minSize={15} maxSize={30}> */}
            <Sidebar />
          {/* </ResizablePanel> */}
          {/* <ResizableHandle withHandle /> */}
          {/* <ResizablePanel defaultSize={80}> */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* <Header /> */}
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
                  
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatsCard
                      title="Total Projects"
                      value="3"
                      description="Active security monitoring"
                      icon={<BarChart2 className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Secure Projects"
                      value="1"
                      description="No issues detected"
                      icon={<ShieldCheck className="h-5 w-5" />}
                    />
                    <StatsCard
                      title="Open Issues"
                      value="8"
                      description="Across all projects"
                      icon={<Search className="h-5 w-5" />}
                      trend={{ value: 2, isPositive: false }}
                    />
                    <StatsCard
                      title="Last Scan"
                      value="2 hours ago"
                      description="Automated security audit"
                      icon={<Clock className="h-5 w-5" />}
                    />
                  </div>
                  
                  {/* Projects Section */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
                    {loading ? (
                      <div className="text-center py-8">Loading projects...</div>
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
                      <div className="space-y-4">
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                            <ShieldCheck className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">Security scan completed</p>
                            <p className="text-slate-600 text-sm">E-commerce Platform - 2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            <Search className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">New vulnerability detected</p>
                            <p className="text-slate-600 text-sm">User Authentication Service - 1 day ago</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <ShieldCheck className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800 font-medium">Issue resolved</p>
                            <p className="text-slate-600 text-sm">Payment Processing API - 3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          {/* </ResizablePanel> */}
        {/* </ResizablePanelGroup> */}
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
