import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import { Upload, Github } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';
import Select from 'react-select';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

interface Repository {
  _id: string;
  name: string;
  provider: 'github' | 'bitbucket' | 'azure';
  repoId: string;
}

interface RepositoryOption {
  value: string;
  label: string;
}

interface PullRequest {
  id: number;
  title: string;
  number: number;
  branch: string;
  author: string;
  createdAt: string;
  url: string;
}

interface PullRequestOption {
  value: number;
  label: string;
  branch: string;
}

interface PRFileChange {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch?: string;
}

interface PRFilesData {
  files: PRFileChange[];
  totalFiles: number;
  totalAdditions: number;
  totalDeletions: number;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const NewProject = () => {
  const { toast } = useToast();
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<RepositoryOption | null>(null);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [selectedPR, setSelectedPR] = useState<PullRequestOption | null>(null);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [prFilesData, setPrFilesData] = useState<PRFilesData | null>(null);
  const [isLoadingPRFiles, setIsLoadingPRFiles] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  // Fetch repositories on component mount
  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const response = await authenticatedRequest('/api/integrations/repositories');
        if (response?.success && Array.isArray(response.data)) {
          setRepositories(response.data);
        } else {
          setRepositories([]);
          console.error('Invalid repositories data:', response);
        }
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setRepositories([]);
        toast({
          title: 'Error',
          description: 'Failed to load repositories',
          variant: 'destructive'
        });
      }
    };

    fetchRepositories();
  }, []);

  // Fetch pull requests when repository is selected
  useEffect(() => {
    const fetchPullRequests = async () => {
      if (!selectedRepo?.value) {
        setPullRequests([]);
        setSelectedPR(null);
        return;
      }

      setIsLoadingPRs(true);
      setPullRequests([]);
      setSelectedPR(null);

      try {
        const repository = repositories.find(r => r._id === selectedRepo.value);
        if (!repository) {
          throw new Error('Repository not found');
        }

        console.log('[DEBUG] Fetching PRs for repository:', repository.name);

        const response = await authenticatedRequest('/api/integrations/pull-requests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            repositoryId: repository._id
          })
        });

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch pull requests');
        }

        if (!Array.isArray(response.data)) {
          throw new Error('Invalid pull requests data');
        }

        console.log('[DEBUG] Fetched PRs:', response.data);
        setPullRequests(response.data);

        if (response.data.length === 0) {
          toast({
            title: 'No Pull Requests',
            description: 'This repository has no open pull requests',
          });
        }
      } catch (error) {
        console.error('Error fetching pull requests:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load pull requests',
          variant: 'destructive'
        });
        setPullRequests([]);
      } finally {
        setIsLoadingPRs(false);
      }
    };

    fetchPullRequests();
  }, [selectedRepo, repositories]);

  // Fetch PR file changes when PR is selected
  useEffect(() => {
    const fetchPRFiles = async () => {
      if (!selectedPR?.value || !selectedRepo?.value) {
        setPrFilesData(null);
        return;
      }

      setIsLoadingPRFiles(true);
      setPrFilesData(null);

      try {
        const repository = repositories.find(r => r._id === selectedRepo.value);
        if (!repository) {
          throw new Error('Repository not found');
        }

        console.log('[DEBUG] Fetching file changes for PR:', selectedPR.value);

        const response = await authenticatedRequest('/api/integrations/pull-request-files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            repositoryId: repository._id,
            pullRequestNumber: selectedPR.value
          })
        });

        if (!response?.success) {
          throw new Error(response?.message || 'Failed to fetch PR file changes');
        }

        console.log('[DEBUG] Fetched PR files:', response.data);
        setPrFilesData(response.data);

        toast({
          title: 'Files Loaded',
          description: `Found ${response.data.totalFiles} changed files (+${response.data.totalAdditions} -${response.data.totalDeletions})`,
        });
      } catch (error) {
        console.error('Error fetching PR files:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load PR file changes',
          variant: 'destructive'
        });
        setPrFilesData(null);
      } finally {
        setIsLoadingPRFiles(false);
      }
    };

    fetchPRFiles();
  }, [selectedPR, selectedRepo, repositories]);

  const validateFile = (file: File): boolean => {
    setFileError(null);
    
    // Check if file is zip
    if (!file.name.toLowerCase().endsWith('.zip') && file.type !== 'application/zip') {
      setFileError('Please upload a ZIP file');
      return false;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File size must be less than 20MB (current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
      return false;
    }
    
    return true;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      } else {
        // Reset file input if validation fails
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedFile(null);
      }
    }
  };
  
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!projectName.trim()) {
      toast({
        title: 'Missing project name',
        description: 'Please enter a name for your project',
        variant: 'destructive'
      });
      return;
    }
    
    if (!selectedFile) {
      setFileError('Please select a file to upload');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('codeFile', selectedFile);
      formData.append('projectName', projectName);
      formData.append('description', description);
      
      // Upload file and start scan
      const response = await authenticatedRequest('/api/scans/upload', {
        method: 'POST',
        headers: {
          // No Content-Type here, it will be set automatically with boundary for FormData
        },
        body: formData,
        isFormData: true
      });
      
      if (response.success) {
        toast({
          title: 'Upload successful',
          description: 'Your code has been uploaded and security scan started',
        });
        
        // Redirect to scan progress page
        navigate(`/project-scan/${response.data.scanId}`, { 
          state: { 
            projectId: response.data.projectId,
            scanId: response.data.scanId
          } 
        });
      } else {
        throw new Error(response.message || 'Error starting scan');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };
  
  const handleRepoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo || !selectedPR || !projectName) {
      toast({
        variant: 'destructive',
        description: 'Please select a repository, pull request, and enter a project name'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          variant: 'destructive',
          description: 'Authentication token is missing. Please log in again.'
        });
        navigate('/login');
        return;
      }

      console.log('[DEBUG] Creating project with:', {
        name: projectName,
        description: description,
        repositoryId: selectedRepo.value,
        pullRequestNumber: selectedPR.value,
        branch: selectedPR.branch,
        prFilesData: prFilesData
      });

      // Create project with PR files data
      const response = await axios.post('/api/projects', {
        name: projectName,
        description: description,
        repositoryId: selectedRepo.value,
        branch: selectedPR.branch,
        pullRequestNumber: selectedPR.value,
        prFilesData: prFilesData // Include the file changes for AI context
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DEBUG] Project creation response:', response.data);
      console.log('id ', response.data.data._id);

      if (!response.data || !response.data.data._id) {
        throw new Error('Invalid response from server: Project ID is missing');
      }

      // Start scan
      console.log('[DEBUG] Starting scan for project:', response.data.data._id);
      const scanResponse = await axios.post(`/api/projects/${response.data.data._id}/start-scan`, {
        branch: selectedPR.branch,
        pullRequestNumber: selectedPR.value
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DEBUG] Scan start response:', scanResponse.data);

      if (!scanResponse.data || !scanResponse.data.data._id) {
        throw new Error('Invalid response from server: Scan ID is missing');
      }

      toast({
        description: 'Project created and scan started successfully'
      });

      // // Navigate to scan progress page
      navigate(`/project/${response.data.data._id}/scan/${scanResponse.data.data._id}`);
    } catch (error) {
      console.error('[DEBUG] Error in handleRepoSubmit:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast({
            variant: 'destructive',
            description: 'Authentication token is missing or invalid. Please log in again.'
          });
          navigate('/login');
        } else {
          const errorMessage = error.response?.data?.message || 
                             (error.response?.data ? JSON.stringify(error.response.data) : 'Failed to create project');
          console.error('[DEBUG] Server error response:', error.response?.data);
          toast({
            variant: 'destructive',
            description: errorMessage
          });
        }
      } else {
        toast({
          variant: 'destructive',
          description: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">New Security Scan</h1>
            
            <Tabs defaultValue="repository">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="repository" className="text-lg py-3">
                  <Github className="mr-2 h-5 w-5" />
                  Connect Repository
                </TabsTrigger>
              </TabsList>
              
              <Card className="p-10">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleRepoSubmit(e);
                }}>
                  <div className="text-center mb-8">
                    <h3 className="text-xl font-medium mb-2">Connect a Git Repository</h3>
                    <p className="text-slate-500 max-w-md mx-auto">
                      Select a repository and pull request to start the security scan
                    </p>
                  </div>
                  
                  <div className="space-y-6 max-w-md mx-auto">
                    <div className="space-y-2">
                      <Label htmlFor="repository">Select Repository</Label>
                      <Select
                        id="repository"
                        value={selectedRepo}
                        onChange={(newValue) => setSelectedRepo(newValue as RepositoryOption)}
                        options={repositories.map(repo => ({
                          value: repo._id,
                          label: repo.name
                        }))}
                        placeholder="Select repository..."
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="pullRequest">Pull Request</Label>
                      <Select
                        id="pullRequest"
                        value={selectedPR}
                        onChange={(newValue) => setSelectedPR(newValue as PullRequestOption)}
                        options={pullRequests.map(pr => ({
                          value: pr.number,
                          label: `#${pr.number} - ${pr.title}`,
                          branch: pr.branch
                        }))}
                        placeholder="Select pull request..."
                        isDisabled={!selectedRepo || isLoadingPRs}
                        isLoading={isLoadingPRs}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                      {selectedPR && (
                        <p className="text-sm text-slate-500">Branch: {selectedPR.branch}</p>
                      )}
                    </div>
                    
                    {isLoadingPRFiles && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                        <p className="text-sm text-blue-700">Loading file changes...</p>
                      </div>
                    )}
                    
                    {prFilesData && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                          PR Changes Ready for Scan
                        </h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p><strong>{prFilesData.totalFiles}</strong> files changed</p>
                          <p className="text-xs">
                            <span className="text-green-600">+{prFilesData.totalAdditions} additions</span>
                            {' / '}
                            <span className="text-red-600">-{prFilesData.totalDeletions} deletions</span>
                          </p>
                          {prFilesData.files.length > 0 && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-green-600 hover:text-green-800">
                                View changed files ({prFilesData.files.length})
                              </summary>
                              <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 text-xs">
                                {prFilesData.files.slice(0, 20).map((file, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span className={`inline-block px-1 rounded text-xs ${
                                      file.status === 'added' ? 'bg-green-100 text-green-800' :
                                      file.status === 'removed' ? 'bg-red-100 text-red-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {file.status.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="truncate">{file.filename}</span>
                                  </li>
                                ))}
                                {prFilesData.files.length > 20 && (
                                  <li className="text-slate-500 italic">
                                    ... and {prFilesData.files.length - 20} more files
                                  </li>
                                )}
                              </ul>
                            </details>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="repo-project-name">Project Name</Label>
                      <Input 
                        id="repo-project-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        placeholder="Enter a name for your project"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repo-project-description">Description (optional)</Label>
                      <Input 
                        id="repo-project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a description for your project"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={!selectedRepo || !selectedPR || !projectName.trim() || isLoadingPRFiles || !prFilesData}
                    >
                      Start Security Scan
                    </Button>
                    
                    {selectedPR && !prFilesData && !isLoadingPRFiles && (
                      <p className="text-xs text-amber-600 text-center">
                        Waiting for PR file changes to load...
                      </p>
                    )}
                  </div>
                </form>
              </Card>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewProject;
