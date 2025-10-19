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
  provider: 'github' | 'bitbucket';
  repoId: string;
}

interface RepositoryOption {
  value: string;
  label: string;
}

interface BranchOption {
  value: string;
  label: string;
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
  const [branches, setBranches] = useState<string[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<BranchOption | null>(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
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

  // Fetch branches when repository is selected
  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedRepo?.value) {
        setBranches([]);
        setSelectedBranch(null);
        return;
      }

      setIsLoadingBranches(true);
      setBranches([]);
      setSelectedBranch(null);

      try {
        const repository = repositories.find(r => r._id === selectedRepo.value);
        if (!repository) {
          throw new Error('Repository not found');
        }

        const credentialsResponse = await authenticatedRequest('/api/integrations/credentials');
        if (!credentialsResponse?.success || !Array.isArray(credentialsResponse.data)) {
          throw new Error('Failed to fetch credentials');
        }

        const githubCred = credentialsResponse.data.find((c: any) => c.provider === 'github');
        if (!githubCred?.githubToken) {
          throw new Error('GitHub credentials not found');
        }

        const response = await fetch(`https://api.github.com/repos/${repository.name}/branches`, {
          headers: {
            Authorization: `token ${githubCred.githubToken}`,
            Accept: 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Invalid branches data');
        }

        setBranches(data.map((branch: any) => branch.name));
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load branches',
          variant: 'destructive'
        });
        setBranches([]);
      } finally {
        setIsLoadingBranches(false);
      }
    };

    fetchBranches();
  }, [selectedRepo, repositories]);

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
    if (!selectedRepo || !selectedBranch || !projectName) {
      toast({
        variant: 'destructive',
        description: 'Please select a repository, branch, and enter a project name'
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
        branch: selectedBranch.value
      });

      // Create project
      const response = await axios.post('/api/projects', {
        name: projectName,
        description: description,
        repositoryId: selectedRepo.value,
        branch: selectedBranch.value
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
        branch: selectedBranch.value
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
                      Select a repository and branch to start the security scan
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
                      <Label htmlFor="branch">Branch</Label>
                      <Select
                        id="branch"
                        value={selectedBranch}
                        onChange={(newValue) => setSelectedBranch(newValue as BranchOption)}
                        options={branches.map(branch => ({
                          value: branch,
                          label: branch
                        }))}
                        placeholder="Select branch..."
                        isDisabled={!selectedRepo || isLoadingBranches}
                        isLoading={isLoadingBranches}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    
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
                      disabled={!selectedRepo || !selectedBranch || !projectName.trim()}
                    >
                      Start Security Scan
                    </Button>
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
