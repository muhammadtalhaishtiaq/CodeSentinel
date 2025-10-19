import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authenticatedRequest } from '../utils/authUtils';
import Sidebar from '../components/Sidebar';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { TreeView } from '@/components/ui/tree-view';
import { ChevronRight, ChevronDown, FileText, Folder, ClipboardIcon, Loader2, Filter, SortDesc, Download, RefreshCw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { SyntaxHighlighter, oneDark } from '@/components/ui/syntax-highlighter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { VulnerabilityCard } from '@/components/VulnerabilityCard';

interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  lineNumber: number;
  code?: string;
  solution?: string;
  id: string;
  riskScore: number;
  category: string;
  impactLevel: string;
  detectionMethod: string;
  detectedAt: string;
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
      lowCount: number;
      mediumCount: number;
      highCount: number;
      criticalCount: number;
      total: number;
    };
  };
}

interface FilterState {
  severity: string[];
  fileType: string[];
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileTree, setFileTree] = useState<any[]>([]);
  const [filters, setFilters] = useState<FilterState>({ severity: [], fileType: [] });
  const [sortBy, setSortBy] = useState<string>('severity');
  const [groupBy, setGroupBy] = useState<string>('severity');
  
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await authenticatedRequest(`/api/projects/${id}`);
        setProject(response.data);
        
        if (response.data.scanResults?.vulnerabilities) {
          const tree = buildFileTree(response.data.scanResults.vulnerabilities);
          setFileTree(tree);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProject();
  }, [id]);

  const buildFileTree = (vulnerabilities: Vulnerability[]) => {
    const tree: any = {};
    
    vulnerabilities.forEach(vuln => {
      const pathParts = vuln.location.split('/');
      let current = tree;
      
      pathParts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            name: part,
            type: index === pathParts.length - 1 ? 'file' : 'folder',
            vulnerabilities: []
          };
        }
        if (index === pathParts.length - 1) {
          current[part].vulnerabilities.push(vuln);
        }
        current = current[part];
      });
    });
    
    return Object.values(tree);
  };

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

  const renderFileTree = (nodes: any[], level = 0) => {
    return nodes.map((node, index) => (
      <div key={index} className="ml-4">
        <div 
          className="flex items-center py-1 hover:bg-gray-100 cursor-pointer"
          onClick={() => node.type === 'file' && setSelectedFile(node.name)}
        >
          {node.type === 'folder' ? (
            <ChevronRight className="w-4 h-4 mr-1" />
          ) : (
            <FileText className="w-4 h-4 mr-1" />
          )}
          <span>{node.name}</span>
          {node.vulnerabilities.length > 0 && (
            <Badge className="ml-2" variant={
              node.vulnerabilities.some((v: Vulnerability) => v.severity === 'critical') ? 'destructive' :
              node.vulnerabilities.some((v: Vulnerability) => v.severity === 'high') ? 'destructive' :
              node.vulnerabilities.some((v: Vulnerability) => v.severity === 'medium') ? 'default' : 'secondary'
            }>
              {node.vulnerabilities.length}
            </Badge>
          )}
        </div>
        {node.type === 'folder' && renderFileTree(Object.values(node), level + 1)}
      </div>
    ));
  };

  // Group vulnerabilities by severity
  const groupedVulnerabilities = useMemo(() => {
    if (!project?.scanResults?.vulnerabilities) return {};
    
    return project.scanResults.vulnerabilities.reduce((acc, vuln) => {
      const key = groupBy === 'severity' ? vuln.severity : 
                  groupBy === 'fileType' ? vuln.location.split('.').pop() || 'unknown' :
                  'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(vuln);
      return acc;
    }, {} as Record<string, Vulnerability[]>);
  }, [project, groupBy]);

  // Filter and sort vulnerabilities
  const filteredVulnerabilities = useMemo(() => {
    let filtered = project?.scanResults?.vulnerabilities || [];
    
    // Apply filters
    if (filters.severity.length > 0) {
      filtered = filtered.filter(v => filters.severity.includes(v.severity));
    }
    if (filters.fileType.length > 0) {
      filtered = filtered.filter(v => {
        const ext = v.location.split('.').pop() || '';
        return filters.fileType.includes(ext);
      });
    }

    // Apply sorting
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        case 'location':
          return a.location.localeCompare(b.location);
        default:
          return 0;
      }
    });
  }, [project, filters, sortBy]);

  const handleRescan = async () => {
    try {
      await authenticatedRequest(`/api/projects/${id}/scan`, { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Error initiating scan:', error);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const response = await authenticatedRequest(`/api/projects/${id}/report`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project?.name}-security-report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
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

  const totalVulnerabilities = 
    project.scanResults?.summary.criticalCount +
    project.scanResults?.summary.highCount +
    project.scanResults?.summary.mediumCount +
    project.scanResults?.summary.lowCount || 0;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <span>{project.repositoryName}</span>
                <span>•</span>
                <span>Last scan: {formatDate(project.createdAt)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadReport}>
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
              <Button onClick={handleRescan}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Rescan Project
              </Button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-between items-center mb-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="issues">Security Issues</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="p-2">
                      <h4 className="font-medium mb-2">Severity</h4>
                      {['critical', 'high', 'medium', 'low'].map(severity => (
                        <div key={severity} className="flex items-center space-x-2">
                          <Checkbox
                            checked={filters.severity.includes(severity)}
                            onCheckedChange={(checked) => {
                              setFilters(prev => ({
                                ...prev,
                                severity: checked 
                                  ? [...prev.severity, severity]
                                  : prev.severity.filter(s => s !== severity)
                              }));
                            }}
                          />
                          <label className="capitalize">{severity}</label>
                        </div>
                      ))}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SortDesc className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="severity">Sort by Severity</SelectItem>
                    <SelectItem value="location">Sort by Location</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="overview">
              {project.scanResults ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-4">Vulnerability Summary</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Critical</span>
                          <span className="font-bold text-red-500">{project.scanResults.summary.criticalCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((project.scanResults.summary.criticalCount / 10) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">High</span>
                          <span className="font-bold text-orange-500">{project.scanResults.summary.highCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((project.scanResults.summary.highCount / 10) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Medium</span>
                          <span className="font-bold text-yellow-500">{project.scanResults.summary.mediumCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((project.scanResults.summary.mediumCount / 10) * 100, 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">Low</span>
                          <span className="font-bold text-blue-500">{project.scanResults.summary.lowCount}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ 
                              width: `${Math.min((project.scanResults.summary.lowCount / 10) * 100, 100)}%` 
                            }}
                          />
                        </div>
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
                    <Button onClick={handleRescan}>Re-scan Project</Button>
                  )}
                </Card>
              )}
            </TabsContent>

            <TabsContent value="issues" className="space-y-4">
              {Object.entries(groupedVulnerabilities).map(([severity, vulns]) => (
                <div key={severity} className="space-y-4">
                  <h3 className="capitalize font-semibold text-lg flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(severity)}`} />
                    {severity} ({vulns.length})
                  </h3>
                  {vulns.map((vuln) => (
                    <VulnerabilityCard key={vuln.id} vulnerability={vuln} />
                  ))}
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetail;
