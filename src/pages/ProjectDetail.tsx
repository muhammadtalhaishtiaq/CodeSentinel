import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { AlertTriangle, CheckCircle, FileCode, Send, ShieldAlert, Info, ChevronDown, ChevronRight, Copy, Check, Folder } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';
import ProjectChat from '@/components/ProjectChat';

interface Vulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  location: string;
  lineNumber: number;
  file_path: string;
  file_name: string;
  file_extension: string;
  original_code: string;
  suggested_code: string;
  potential_impact: string;
  potential_solution: string;
  potential_risk: string;
  potential_mitigation: string;
  potential_prevention: string;
  potential_detection: string;
}

interface ScanResult {
  summary: {
    total: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  vulnerabilities: Vulnerability[];
}

interface LatestScan {
  status: string;
  createdAt: string;
  completedAt?: string;
  result?: ScanResult;
}

interface ProjectDetail {
  _id: string;
  name: string;
  description: string;
  repository?: {
    _id: string;
    name: string;
    provider: string;
  };
  status: string;
  latestScan?: LatestScan;
  scanHistory: LatestScan[];
  createdAt: string;
  updatedAt: string;
}

interface FileWithVulnerabilities {
  path: string;
  name: string;
  vulnerabilityCount: number;
  vulnerabilities: Vulnerability[];
}

// Get badge color based on severity
const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return (
        <span className="security-badge-critical flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" /> Critical
        </span>
      );
    case 'high':
      return (
        <span className="security-badge-warning flex items-center">
          <ShieldAlert className="h-3 w-3 mr-1" /> High
        </span>
      );
    case 'medium':
      return (
        <span className="security-badge-warning flex items-center">
          <ShieldAlert className="h-3 w-3 mr-1" /> Medium
        </span>
      );
    default:
      return (
        <span className="security-badge-success flex items-center">
          <Info className="h-3 w-3 mr-1" /> Low
        </span>
      );
  }
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [projectData, setProjectData] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [openPanels, setOpenPanels] = useState<{
    [key: string]: boolean;
  }>({});
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [selectedImpact, setSelectedImpact] = useState<Vulnerability | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  // Organize vulnerabilities by file
  const filesWithVulnerabilities: FileWithVulnerabilities[] = React.useMemo(() => {
    if (!projectData?.latestScan?.result?.vulnerabilities) return [];
    
    const fileMap = new Map<string, FileWithVulnerabilities>();
    
    projectData.latestScan.result.vulnerabilities.forEach(vuln => {
      const existing = fileMap.get(vuln.file_path);
      if (existing) {
        existing.vulnerabilityCount++;
        existing.vulnerabilities.push(vuln);
      } else {
        fileMap.set(vuln.file_path, {
          path: vuln.file_path,
          name: vuln.file_name,
          vulnerabilityCount: 1,
          vulnerabilities: [vuln]
        });
      }
    });
    
    return Array.from(fileMap.values()).sort((a, b) => b.vulnerabilityCount - a.vulnerabilityCount);
  }, [projectData?.latestScan?.result?.vulnerabilities]);

  // Get vulnerability counts by severity
  const vulnerabilityCounts = React.useMemo(() => {
    if (!projectData?.latestScan?.result?.vulnerabilities) return {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    return projectData.latestScan.result.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.severity]++;
      return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 });
  }, [projectData?.latestScan?.result?.vulnerabilities]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        setLoading(true);
        const response = await authenticatedRequest(`/api/projects/${id}`, { method: 'GET' });
        
        if (response.success) {
          setProjectData(response.data);
          // Set the first file with vulnerabilities as selected if available
          if (response.data.latestScan?.result?.vulnerabilities?.length > 0) {
            const firstFile = response.data.latestScan.result.vulnerabilities[0].file_path;
            setSelectedFilePath(firstFile);
            
            // Expand all parent folders of the first file
            const pathParts = firstFile.split('/');
            const expandedPaths = new Set<string>();
            let currentPath = '';
            for (let i = 0; i < pathParts.length - 1; i++) {
              currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
              expandedPaths.add(currentPath);
            }
            setExpandedFolders(expandedPaths);
          }
        } else {
          setError('Failed to fetch project details');
        }
      } catch (error) {
        console.error('Error fetching project details:', error);
        setError('An error occurred while fetching project details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = { text: chatInput, isUser: true };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        text: `I've analyzed the security issue. This could lead to unauthorized access. Please review the suggested fix.`,
        isUser: false
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  // Get vulnerabilities for the selected file
  const selectedFileVulnerabilities = filesWithVulnerabilities.find(
    f => f.path === selectedFilePath
  )?.vulnerabilities || [];
  
  // Add toggle panel function
  const togglePanel = (panelId: string) => {
    setOpenPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  // Add copy to clipboard function
  const copyToClipboard = async (text: string, panelId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(panelId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Add function to build file tree
  const buildFileTree = (files: FileWithVulnerabilities[]) => {
    const tree: any = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = file;
    });
    
    return tree;
  };

  // Add function to render file tree
  const renderFileTree = (tree: any, path: string = '') => {
    return Object.entries(tree).map(([name, value]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFolder = typeof value === 'object' && !('vulnerabilityCount' in value);
      const isExpanded = expandedFolders.has(currentPath);

      if (isFolder) {
        return (
          <div key={currentPath}>
            <div 
              className="flex items-center py-1 px-2 cursor-pointer hover:bg-slate-50 rounded"
              onClick={() => {
                const newExpanded = new Set(expandedFolders);
                if (isExpanded) {
                  newExpanded.delete(currentPath);
                } else {
                  newExpanded.add(currentPath);
                }
                setExpandedFolders(newExpanded);
              }}
            >
              {isExpanded ? <ChevronDown className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
              <Folder className="h-4 w-4 mr-2 text-slate-500" />
              <span className="flex-1 truncate">{name}</span>
            </div>
            {isExpanded && (
              <div className="ml-4">
                {renderFileTree(value, currentPath)}
              </div>
            )}
          </div>
        );
      }

      const file = value as FileWithVulnerabilities;
      return (
        <div
          key={file.path}
          className={`flex items-center py-1 px-2 cursor-pointer hover:bg-slate-50 rounded ${
            selectedFilePath === file.path ? 'bg-slate-100' : ''
          }`}
          onClick={() => setSelectedFilePath(file.path)}
        >
          <FileCode className="h-4 w-4 mr-2 text-slate-500" />
          <span className="flex-1 truncate">{name}</span>
          <span className="ml-2 text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
            {file.vulnerabilityCount}
          </span>
        </div>
      );
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!projectData) return <div>No project data found</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">{projectData.name}</h1>
                <p className="text-slate-600">{projectData.description}</p>
              </div>
              <div className="flex space-x-4 mt-4 lg:mt-0">
                {/* <Button variant="outline">
                  Download Report
                </Button> */}
                <Button>
                  Rescan Project
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* File List Sidebar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Files with Issues</h3>
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    {renderFileTree(buildFileTree(filesWithVulnerabilities))}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <Tabs defaultValue="issues">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="issues">Security Issues ({selectedFileVulnerabilities.length})</TabsTrigger>
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="chat">AI Assistant</TabsTrigger>
                        {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
                      </TabsList>
                      
                      <TabsContent value="issues" className="space-y-6">
                        {selectedFileVulnerabilities.map((vuln, index) => (
                          <div key={index} className="mb-6">
                            {/* Vulnerability Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getSeverityBadge(vuln.severity)}
                                <span className="font-medium">{vuln.type}</span>
                              </div>
                              <button 
                                className="px-3 py-1 bg-cyan-500 text-white rounded hover:bg-cyan-600"
                                style={{ backgroundColor: 'hsl(var(--accent))' }}
                                onClick={() => {
                                  setSelectedImpact(vuln);
                                  setShowImpactModal(true);
                                }}
                              >
                                Future Impact
                              </button>
                            </div>

                            {/* Vulnerability Description */}
                            <div className="mb-3 text-sm text-slate-600">
                              {vuln.description}
                            </div>

                            {/* Current Code Panel */}
                            <div className="border rounded-lg mb-2">
                              <div 
                                className="flex items-center p-3 cursor-pointer hover:bg-slate-50"
                                onClick={() => togglePanel(`current-${index}`)}
                              >
                                <span className="flex-1 font-medium">Current Code</span>
                                {openPanels[`current-${index}`] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                              {openPanels[`current-${index}`] && (
                                <div className="p-4 border-t">
                                  <div className="relative">
                                    <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                                      {vuln.original_code}
                                    </pre>
                                    <button
                                      className="absolute top-2 right-2 p-1 bg-white rounded hover:bg-slate-200"
                                      onClick={() => copyToClipboard(vuln.original_code, `current-${index}`)}
                                    >
                                      {copiedCode === `current-${index}` ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-slate-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Suggested Fix Panel */}
                            <div className="border rounded-lg">
                              <div 
                                className="flex items-center p-3 cursor-pointer hover:bg-slate-50"
                                onClick={() => togglePanel(`suggested-${index}`)}
                              >
                                <span className="flex-1 font-medium">Suggested Fix</span>
                                {openPanels[`suggested-${index}`] ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </div>
                              {openPanels[`suggested-${index}`] && (
                                <div className="p-4 border-t">
                                  <div className="relative">
                                    <pre className="bg-slate-100 p-3 rounded text-sm overflow-x-auto">
                                      {vuln.suggested_code}
                                    </pre>
                                    <button
                                      className="absolute top-2 right-2 p-1 bg-white rounded hover:bg-slate-200"
                                      onClick={() => copyToClipboard(vuln.suggested_code, `suggested-${index}`)}
                                    >
                                      {copiedCode === `suggested-${index}` ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4 text-slate-500" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="summary">
                        <div className="space-y-6">
                          {/* Severity Panels */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(vulnerabilityCounts).map(([severity, count]) => (
                              <div 
                                key={severity}
                                className={`p-4 rounded-lg ${
                                  severity === 'critical' ? 'bg-red-50' :
                                  severity === 'high' ? 'bg-orange-50' :
                                  severity === 'medium' ? 'bg-yellow-50' :
                                  'bg-green-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold capitalize">{severity} Issues</h4>
                                    <p className="text-2xl font-bold mt-1">{count}</p>
                                  </div>
                                  {severity === 'critical' ? <AlertTriangle className="h-6 w-6 text-red-500" /> :
                                   severity === 'high' ? <ShieldAlert className="h-6 w-6 text-orange-500" /> :
                                   severity === 'medium' ? <AlertTriangle className="h-6 w-6 text-yellow-500" /> :
                                   <CheckCircle className="h-6 w-6 text-green-500" />}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Why Code Evaluation is Necessary */}
                          <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold mb-4">Why Code Evaluation is Necessary</h3>
                            <div className="space-y-4">
                              <p className="text-gray-600">
                                Regular code evaluation is crucial for maintaining secure and reliable software. It helps identify potential security vulnerabilities, performance bottlenecks, and maintainability issues before they become critical problems.
                              </p>
                              <ul className="list-disc list-inside space-y-2 text-gray-600">
                                <li>Prevents security breaches and data leaks</li>
                                <li>Reduces technical debt and maintenance costs</li>
                                <li>Improves code quality and reliability</li>
                                <li>Ensures compliance with security standards</li>
                                <li>Protects against common attack vectors</li>
                              </ul>
                            </div>
                          </div>

                          {/* Future Issue Prevention */}
                          <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold mb-4">Preventing Future Issues</h3>
                            <div className="space-y-4">
                              <p className="text-gray-600">
                                Small code issues can lead to significant security problems if left unaddressed. Here's how you can prevent future issues:
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">Best Practices</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    <li>Regular code reviews</li>
                                    <li>Automated testing</li>
                                    <li>Security scanning</li>
                                    <li>Dependency updates</li>
                                  </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">Proactive Measures</h4>
                                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                    <li>Input validation</li>
                                    <li>Error handling</li>
                                    <li>Secure coding patterns</li>
                                    <li>Regular audits</li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="chat">
                        <div className="space-y-4">
                          <div className="bg-white p-6 rounded-lg border">
                            <h3 className="text-xl font-semibold mb-4">AI Security Assistant</h3>
                            <p className="text-gray-600 mb-4">
                              Ask questions about your project's security issues, get explanations, and receive guidance on fixes.
                            </p>
                            {projectData?.latestScan?.result && (
                              <ProjectChat 
                                projectId={id!}
                              />
                            )}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="settings">
                        {/* Settings content */}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Impact Modal */}
      {selectedImpact && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showImpactModal ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Future Impact Analysis</h3>
              <button 
                onClick={() => setShowImpactModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2"><b>Potential Impact:</b></h4>
                <p>{selectedImpact.potential_impact}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2"><b>Severity:</b></h4>
                <div className="flex items-center gap-2">
                  {selectedImpact.severity === 'critical' ? (
                    <span className="security-badge-critical flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-1" /> Critical
                    </span>
                  ) : selectedImpact.severity === 'high' ? (
                    <span className="security-badge-warning flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-1" /> High
                    </span>
                  ) : selectedImpact.severity === 'medium' ? (
                    <span className="security-badge-warning flex items-center">
                      <ShieldAlert className="h-4 w-4 mr-1" /> Medium
                    </span>
                  ) : (
                    <span className="security-badge-success flex items-center">
                      <Info className="h-4 w-4 mr-1" /> Low
                    </span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2"><b>Potential Solution:</b></h4>
                <p>{selectedImpact.potential_solution}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2"><b>Potential Risk:</b></h4>
                <p>{selectedImpact.potential_risk}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2"><b>Potential Mitigation:</b></h4>
                <p>{selectedImpact.potential_mitigation}</p>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;