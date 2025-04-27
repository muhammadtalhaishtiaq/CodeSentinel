
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Upload, Github } from 'lucide-react';

const NewProject = () => {
  const [projectName, setProjectName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle upload logic here
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      // Redirect to scan status page or similar
    }, 2000);
  };
  
  const handleRepoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle repo connection logic here
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle file drop logic
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      console.log('Files dropped:', files);
      // Process files
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
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
                        Upload a ZIP, TAR, or RAR file containing your source code for security analysis
                      </p>
                      <div className="flex flex-col space-y-4 w-full max-w-md">
                        <Button variant="outline" className="relative" type="button">
                          Browse Files
                          <Input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept=".zip,.tar,.rar,.gz"
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
                        
                        <Button 
                          type="submit" 
                          disabled={!projectName || isUploading} 
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
