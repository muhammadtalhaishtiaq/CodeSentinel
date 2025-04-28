import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import Sidebar from '@/components/Sidebar';
import { Upload, Github, AlertCircle } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

const NewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
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
          // Don't set Content-Type here, it will be set automatically with boundary for FormData
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
  
  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be implemented separately for GitHub/Bitbucket integration
    toast({
      title: 'Coming soon',
      description: 'Repository integration will be available soon',
    });
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">New Security Scan</h1>
            
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="upload" className="text-lg py-3">
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Code
                </TabsTrigger>
                <TabsTrigger value="repository" className="text-lg py-3">
                  <Github className="mr-2 h-5 w-5" />
                  Connect Repository
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <Card className="border-2 border-dashed border-gray-300 p-10">
                  <form onSubmit={handleUploadSubmit}>
                    <div 
                      className="flex flex-col items-center justify-center text-center cursor-pointer py-8"
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-12 w-12 text-slate-400 mb-4" />
                      <h3 className="text-xl font-medium mb-2">Drag and drop your code archive</h3>
                      <p className="text-slate-500 mb-6 max-w-md">
                        Upload a ZIP file containing your source code for security analysis (Max 20MB)
                      </p>
                      
                      {fileError && (
                        <div className="flex items-center gap-2 text-red-500 mb-4 p-2 bg-red-50 rounded w-full max-w-md">
                          <AlertCircle className="h-5 w-5" />
                          <span>{fileError}</span>
                        </div>
                      )}
                      
                      {selectedFile && (
                        <div className="flex items-center gap-2 text-green-600 mb-4 p-2 bg-green-50 rounded w-full max-w-md">
                          <span className="font-medium">Selected: {selectedFile.name}</span>
                          <span className="text-xs">({(selectedFile.size / (1024 * 1024)).toFixed(2)}MB)</span>
                        </div>
                      )}
                      
                      <div className="flex flex-col space-y-4 w-full max-w-md">
                        <Button variant="outline" className="relative" type="button">
                          Browse Files
                          <Input 
                            ref={fileInputRef}
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept=".zip"
                            onChange={handleFileChange}
                          />
                        </Button>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-name">Project Name</Label>
                          <Input 
                            id="project-name" 
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="Enter a name for your project"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="project-description">Description (optional)</Label>
                          <Input 
                            id="project-description" 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a description for your project"
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          disabled={!projectName || !selectedFile || isUploading} 
                          className="w-full"
                        >
                          {isUploading ? "Uploading..." : "Start Security Scan"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Card>
              </TabsContent>
              
              <TabsContent value="repository">
                <Card className="p-10">
                  <form onSubmit={handleRepoSubmit}>
                    <div className="text-center mb-8">
                      <h3 className="text-xl font-medium mb-2">Connect a Git Repository</h3>
                      <p className="text-slate-500 max-w-md mx-auto">
                        To scan a repository, first connect your GitHub or Bitbucket account in API & Integrations
                      </p>
                    </div>
                    
                    <div className="space-y-6 max-w-md mx-auto">
                      <div className="space-y-2">
                        <Label htmlFor="repository">Select Repository</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a repository" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="repo1">user/repository-1</SelectItem>
                            <SelectItem value="repo2">user/repository-2</SelectItem>
                            <SelectItem value="repo3">organization/repository-3</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a branch" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="main">main</SelectItem>
                            <SelectItem value="develop">develop</SelectItem>
                            <SelectItem value="feature">feature/new-feature</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="repo-project-name">Project Name</Label>
                        <Input 
                          id="repo-project-name" 
                          placeholder="Enter a name for your project"
                          required
                        />
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Start Security Scan
                      </Button>
                    </div>
                  </form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewProject;
