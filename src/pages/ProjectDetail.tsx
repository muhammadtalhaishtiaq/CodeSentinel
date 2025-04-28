import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authenticatedRequest } from '../utils/authUtils';
import Sidebar from '../components/Sidebar';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  filePath: string;
  lineNumber: number;
  code: string;
  solution?: string;
}

interface Project {
  id: string;
  name: string;
  repositoryName: string;
  createdAt: string;
  status: 'completed' | 'in-progress' | 'failed';
  scanResults?: {
    vulnerabilities: Vulnerability[];
    summary: {
      critical: number;
      high: number;
      medium: number;
      low: number;
      total: number;
    };
  };
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await authenticatedRequest(`/api/projects/${id}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="h-24 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Project not found</h2>
            <Link to="/my-projects">
              <Button className="mt-4">Back to Projects</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <span>{project.repositoryName}</span>
                <span>•</span>
                <span>Scanned on {formatDate(project.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant={project.status === 'completed' ? 'success' : project.status === 'in-progress' ? 'warning' : 'destructive'}>
                {project.status === 'completed' ? 'Scan Complete' : project.status === 'in-progress' ? 'Scanning...' : 'Scan Failed'}
              </Badge>
              <Button variant="outline">Download Report</Button>
              <Button>Re-scan</Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
              <TabsTrigger value="code">Code</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              {project.scanResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Vulnerability Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Critical</span>
                          <span className="font-bold text-red-500">{project.scanResults.summary.critical}</span>
                        </div>
                        <Progress value={(project.scanResults.summary.critical / project.scanResults.summary.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-red-500" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">High</span>
                          <span className="font-bold text-orange-500">{project.scanResults.summary.high}</span>
                        </div>
                        <Progress value={(project.scanResults.summary.high / project.scanResults.summary.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-orange-500" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Medium</span>
                          <span className="font-bold text-yellow-500">{project.scanResults.summary.medium}</span>
                        </div>
                        <Progress value={(project.scanResults.summary.medium / project.scanResults.summary.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-yellow-500" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Low</span>
                          <span className="font-bold text-blue-500">{project.scanResults.summary.low}</span>
                        </div>
                        <Progress value={(project.scanResults.summary.low / project.scanResults.summary.total) * 100} className="h-2 bg-gray-200" indicatorClassName="bg-blue-500" />
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="font-semibold">Total Vulnerabilities</span>
                        <span className="font-bold">{project.scanResults.summary.total}</span>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Project Information</h3>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2">
                        <span className="text-gray-600">Repository</span>
                        <span className="font-medium">{project.repositoryName}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-gray-600">Scan Date</span>
                        <span className="font-medium">{formatDate(project.createdAt)}</span>
                      </div>
                      <div className="grid grid-cols-2">
                        <span className="text-gray-600">Status</span>
                        <span className="font-medium capitalize">{project.status}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">No scan results available</h3>
                  <p className="text-gray-600 mb-4">
                    {project.status === 'in-progress' 
                      ? 'Scan is still in progress. Please check back later.'
                      : project.status === 'failed'
                      ? 'Scan failed to complete. Please try scanning again.'
                      : 'No vulnerability data was found for this project.'}
                  </p>
                  {project.status !== 'in-progress' && (
                    <Button>Re-scan Project</Button>
                  )}
                </Card>
              )}
            </TabsContent>

            <TabsContent value="vulnerabilities">
              {project.scanResults && project.scanResults.vulnerabilities.length > 0 ? (
                <div className="space-y-4">
                  {project.scanResults.vulnerabilities.map((vuln) => (
                    <Card key={vuln.id} className="p-4">
                      <div className="flex justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${getSeverityColor(vuln.severity)}`}></div>
                          <h3 className="font-semibold text-lg">{vuln.title}</h3>
                          <Badge className="ml-3" variant={
                            vuln.severity === 'critical' ? 'destructive' : 
                            vuln.severity === 'high' ? 'destructive' : 
                            vuln.severity === 'medium' ? 'warning' : 'secondary'
                          }>
                            {vuln.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </div>
                      <p className="mt-2 text-gray-600">{vuln.description}</p>
                      <div className="mt-3 bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                        <div className="text-gray-500 text-xs mb-1">{vuln.filePath}:{vuln.lineNumber}</div>
                        <pre className="whitespace-pre-wrap">{vuln.code}</pre>
                      </div>
                      {vuln.solution && (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm text-gray-700">Recommended Fix:</h4>
                          <p className="text-sm text-gray-600 mt-1">{vuln.solution}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">No vulnerabilities found</h3>
                  <p className="text-gray-600">
                    {project.status === 'completed' 
                      ? 'Great job! No security vulnerabilities were detected in this project.'
                      : project.status === 'in-progress'
                      ? 'Scan is still in progress. Please check back later.'
                      : 'Scan failed to complete. Please try scanning again.'}
                  </p>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="code">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Project Files</h3>
                <p className="text-gray-600">This feature is coming soon. You will be able to browse the codebase and see highlighted vulnerabilities in context.</p>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
