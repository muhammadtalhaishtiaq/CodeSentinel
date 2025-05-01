import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedRequest } from '@/utils/authUtils';

interface Project {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  repository?: {
    _id: string;
    name: string;
    provider: string;
  };
  status: string;
  summary: {
    totalScans: number;
    lastScanDate?: string;
    vulnerabilityCounts: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    }
  };
  latestScan?: {
    status: string;
    createdAt: string;
    completedAt?: string;
    result?: {
      summary?: {
        total?: number;
        criticalCount?: number;
        highCount?: number;
        mediumCount?: number;
        lowCount?: number;
      };
    };
  };
  createdAt: string;
  updatedAt: string;
}

const MyProjects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await authenticatedRequest('/api/projects', { method: 'GET' });
        if (response.data && response.data) {
          const projectsData = response.data.map((project: any) => ({
            _id: project._id,
            id: project._id,
            name: project.name,
            description: project.description,
            repository: project.repository,
            status: project.status || 'none',
            summary: {
              totalScans: project.summary?.totalScans || 0,
              lastScanDate: project.summary?.lastScanDate,
              vulnerabilityCounts: {
                low: project.summary?.vulnerabilityCounts?.low || 0,
                medium: project.summary?.vulnerabilityCounts?.medium || 0,
                high: project.summary?.vulnerabilityCounts?.high || 0,
                critical: project.summary?.vulnerabilityCounts?.critical || 0
              }
            },
            latestScan: project.latestScan || null,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
          }));
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects
    .filter(project => {
      // Apply search term filter
      const matchesSearch = 
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.repository?.name && project.repository.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Apply status filter
      const matchesStatus = 
        statusFilter === 'all' || 
        (project.latestScan && project.latestScan.status === statusFilter);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'vulnerabilities':
          const aTotal = a.summary.vulnerabilityCounts.critical + a.summary.vulnerabilityCounts.high + 
                        a.summary.vulnerabilityCounts.medium + a.summary.vulnerabilityCounts.low;
          const bTotal = b.summary.vulnerabilityCounts.critical + b.summary.vulnerabilityCounts.high + 
                        b.summary.vulnerabilityCounts.medium + b.summary.vulnerabilityCounts.low;
          return bTotal - aTotal;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/10 text-blue-500';
      case 'in-progress': return 'bg-blue-500/10 text-blue-500';
      case 'completed': return 'bg-green-500/10 text-green-500';
      case 'failed': return 'bg-red-500/10 text-red-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getVulnerabilityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-700/10 text-red-700';
      case 'high': return 'bg-red-500/10 text-red-500';
      case 'medium': return 'bg-orange-500/10 text-orange-500';
      case 'low': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">
              View and manage your security scans and analysis results
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="w-full md:w-1/3">
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name_asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name_desc">Name (Z-A)</SelectItem>
                  <SelectItem value="vulnerabilities">Most Vulnerabilities</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
              <h3 className="text-xl font-medium">No projects found</h3>
              <p className="text-muted-foreground">
                {projects.length === 0 
                  ? "Get started by creating your first project" 
                  : "Try adjusting your filters or search term"}
              </p>
              {projects.length === 0 && (
                <Button onClick={() => navigate('/new-project')}>
                  Create New Project
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <Card key={project._id} className="overflow-hidden transition-all hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <Badge className={getStatusColor(project.latestScan?.status || 'none')}>
                        {project.latestScan ? (project.latestScan.status.charAt(0).toUpperCase() + project.latestScan.status.slice(1)) : 'No Scan'}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="line-clamp-1 text-xl">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      Repository: {project.repository?.name || 'No Repository'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Vulnerabilities</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-gray-500/10 text-gray-500">
                          Total: {project.latestScan?.result?.summary?.total || 0}
                        </Badge>
                        <Badge className={getVulnerabilityColor('critical')}>
                          Critical: {project.latestScan?.result?.summary?.criticalCount || 0}
                        </Badge>
                        <Badge className={getVulnerabilityColor('high')}>
                          High: {project.latestScan?.result?.summary?.highCount || 0}
                        </Badge>
                        <Badge className={getVulnerabilityColor('medium')}>
                          Medium: {project.latestScan?.result?.summary?.mediumCount || 0}
                        </Badge>
                        <Badge className={getVulnerabilityColor('low')}>
                          Low: {project.latestScan?.result?.summary?.lowCount || 0}
                        </Badge>
                      </div>
                    </div>
                    {project.summary.lastScanDate && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        Last scan: {new Date(project.summary.lastScanDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyProjects; 