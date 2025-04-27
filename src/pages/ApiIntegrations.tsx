import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Github, GitBranch, Check, X, Trash, Key } from 'lucide-react';

const mockRepositories = [
  {
    id: 1,
    name: 'user/repo-one',
    provider: 'github',
    connectedAt: '2023-12-15T12:30:00Z',
    lastScanDate: '2023-12-20T14:45:00Z'
  },
  {
    id: 2,
    name: 'organization/repo-two',
    provider: 'github',
    connectedAt: '2023-12-10T09:15:00Z',
    lastScanDate: '2023-12-18T11:20:00Z'
  }
];

const ApiIntegrations = () => {
  const [githubToken, setGithubToken] = useState('');
  const [bitbucketUsername, setBitbucketUsername] = useState('');
  const [bitbucketToken, setBitbucketToken] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const [repositories, setRepositories] = useState(mockRepositories);
  const [defaultProvider, setDefaultProvider] = useState<'github' | 'bitbucket'>('github');
  
  const handleTestGithubConnection = () => {
    if (!githubToken) return;
    
    setIsTestingConnection(true);
    // Simulate API call
    setTimeout(() => {
      setConnectionSuccess(true);
      setIsTestingConnection(false);
    }, 1500);
  };
  
  const handleTestBitbucketConnection = () => {
    if (!bitbucketUsername || !bitbucketToken) return;
    
    setIsTestingConnection(true);
    // Simulate API call
    setTimeout(() => {
      setConnectionSuccess(false);
      setIsTestingConnection(false);
    }, 1500);
  };
  
  const handleRemoveRepository = (id: number) => {
    setRepositories(repositories.filter(repo => repo.id !== id));
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800">API & Integrations</h1>
            
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Default Repository Provider</CardTitle>
                  <CardDescription>
                    Select your preferred repository provider for new projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant={defaultProvider === 'github' ? 'default' : 'outline'}
                      onClick={() => setDefaultProvider('github')}
                      className="flex items-center space-x-2"
                    >
                      <Github className="h-4 w-4" />
                      <span>GitHub</span>
                    </Button>
                    <Button
                      variant={defaultProvider === 'bitbucket' ? 'default' : 'outline'}
                      onClick={() => setDefaultProvider('bitbucket')}
                      className="flex items-center space-x-2"
                    >
                      <GitBranch className="h-4 w-4" />
                      <span>Bitbucket</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Repository Access</CardTitle>
                  <CardDescription>
                    Connect your Git repositories to enable automatic code scanning
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="github">
                    <TabsList className="mb-6">
                      <TabsTrigger value="github" className="flex items-center">
                        <Github className="h-4 w-4 mr-2" />
                        GitHub
                      </TabsTrigger>
                      <TabsTrigger value="bitbucket" className="flex items-center">
                        <GitBranch className="h-4 w-4 mr-2" />
                        Bitbucket
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="github" className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4">Connect GitHub Account</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="github-token">Personal Access Token</Label>
                            <div className="flex">
                              <Input 
                                id="github-token" 
                                type="password" 
                                value={githubToken}
                                onChange={(e) => setGithubToken(e.target.value)}
                                placeholder="GitHub Personal Access Token"
                                className="flex-1 rounded-r-none"
                              />
                              <Button 
                                onClick={handleTestGithubConnection}
                                disabled={!githubToken || isTestingConnection}
                                className="rounded-l-none"
                              >
                                {isTestingConnection ? (
                                  "Testing..."
                                ) : connectionSuccess === true ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Connected
                                  </>
                                ) : (
                                  "Test Connection"
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-slate-500">
                              The token requires <code>repo</code> and <code>read:user</code> permissions.
                              <a href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token" 
                                className="text-indigo-600 hover:text-indigo-500 ml-1"
                                target="_blank" rel="noopener noreferrer"
                              >
                                Learn how to generate a token
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="bitbucket" className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-4">Connect Bitbucket Account</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="bitbucket-username">Username</Label>
                            <Input 
                              id="bitbucket-username" 
                              value={bitbucketUsername}
                              onChange={(e) => setBitbucketUsername(e.target.value)}
                              placeholder="Bitbucket Username"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bitbucket-token">App Password</Label>
                            <div className="flex">
                              <Input 
                                id="bitbucket-token" 
                                type="password" 
                                value={bitbucketToken}
                                onChange={(e) => setBitbucketToken(e.target.value)}
                                placeholder="Bitbucket App Password"
                                className="flex-1 rounded-r-none"
                              />
                              <Button 
                                onClick={handleTestBitbucketConnection}
                                disabled={!bitbucketUsername || !bitbucketToken || isTestingConnection}
                                className="rounded-l-none"
                              >
                                {isTestingConnection ? (
                                  "Testing..."
                                ) : connectionSuccess === false ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Failed
                                  </>
                                ) : (
                                  "Test Connection"
                                )}
                              </Button>
                            </div>
                            <p className="text-sm text-slate-500">
                              The app password requires <code>repositories:read</code> permissions.
                            </p>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Generate API keys to use CodeSentinel with your CI/CD pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold mb-1">Default API Key</h3>
                        <p className="text-sm text-slate-500">For use in CI/CD pipelines and integrations</p>
                      </div>
                      <Button variant="outline" className="flex items-center">
                        <Key className="h-4 w-4 mr-2" />
                        Generate New Key
                      </Button>
                    </div>
                    
                    <div className="bg-gray-50 border rounded-md p-4">
                      <p className="text-center text-slate-500">No API keys have been generated yet</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {repositories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Connected Repositories</CardTitle>
                    <CardDescription>
                      Manage repositories that are connected to CodeSentinel
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {repositories.map(repo => (
                        <div key={repo.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                          <div className="flex items-center">
                            {repo.provider === 'github' ? (
                              <Github className="h-5 w-5 mr-3 text-slate-700" />
                            ) : (
                              <GitBranch className="h-5 w-5 mr-3 text-slate-700" />
                            )}
                            <div>
                              <p className="font-medium">{repo.name}</p>
                              <p className="text-sm text-slate-500">
                                Last scanned: {new Date(repo.lastScanDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash className="h-4 w-4 text-slate-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Repository</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {repo.name}? This will delete all scan history and findings for this repository.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleRemoveRepository(repo.id)}>
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiIntegrations;
