import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Github, GitBranch, Check, X, Trash, Key, RefreshCw, AlertCircle, Loader } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';
import { useToast } from '@/components/ui/use-toast';

interface Repository {
  _id: string;
  name: string;
  provider: 'github' | 'bitbucket';
  connectedAt: string;
  lastScanDate: string | null;
  isEnabled: boolean;
}

interface SourceCredential {
  id: string;
  provider: 'github' | 'bitbucket';
  isDefault: boolean;
  isActive: boolean;
  authType?: 'manual' | 'oauth';
  providerUsername?: string;
  providerEmail?: string;
  isConnected?: boolean;
  githubToken?: string;
  bitbucketUsername?: string;
  bitbucketToken?: string;
  createdAt: string;
  updatedAt: string;
}

const ApiIntegrations = () => {
  const [githubToken, setGithubToken] = useState('');
  const [bitbucketUsername, setBitbucketUsername] = useState('');
  const [bitbucketToken, setBitbucketToken] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionSuccess, setConnectionSuccess] = useState<boolean | null>(null);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [credentials, setCredentials] = useState<SourceCredential[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<'github' | 'bitbucket'>('github');
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('github');
  const { toast } = useToast();
  
  const reposPerPage = 10;
  
  useEffect(() => {
    // Fetch user's source credentials
    const fetchCredentials = async () => {
      setIsLoading(true);
      try {
        const response = await authenticatedRequest('/api/integrations/credentials', {
          method: 'GET'
        });
        
        if (response.success) {
          const creds = response.data || [];
          setCredentials(creds);
          
          // Set default provider from credentials if available
          const defaultCred = creds.find((cred: SourceCredential) => cred.isDefault);
          if (defaultCred) {
            setDefaultProvider(defaultCred.provider);
          }
          
          // Pre-load existing credentials
          const githubCred = creds.find((cred: SourceCredential) => cred.provider === 'github');
          const bitbucketCred = creds.find((cred: SourceCredential) => cred.provider === 'bitbucket');
          
          if (githubCred && githubCred.githubToken) {
            setGithubToken(githubCred.githubToken);
            setConnectionSuccess(true);
          }
          
          if (bitbucketCred) {
            if (bitbucketCred.bitbucketUsername) {
              setBitbucketUsername(bitbucketCred.bitbucketUsername);
            }
            if (bitbucketCred.bitbucketToken) {
              setBitbucketToken(bitbucketCred.bitbucketToken);
            }
            if (bitbucketCred.bitbucketUsername && bitbucketCred.bitbucketToken) {
              setConnectionSuccess(true);
            }
          }
          
          // Set active tab based on existing credentials
          if (defaultCred) {
            setActiveTab(defaultCred.provider);
          } else if (githubCred) {
            setActiveTab('github');
          } else if (bitbucketCred) {
            setActiveTab('bitbucket');
          }
        }
      } catch (error) {
        console.error('Failed to fetch credentials:', error);
        toast({
          title: "Error",
          description: "Failed to load your credentials",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Fetch user's repositories
    const fetchRepositories = async () => {
      try {
        const response = await authenticatedRequest('/api/integrations/repositories', {
          method: 'GET'
        });
        
        if (response.success) {
          // Sort repositories by connectedAt date (newest first)
          const sortedRepos = (response.data || []).sort((a, b) => 
            new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
          );
          setRepositories(sortedRepos);
        }
      } catch (error) {
        console.error('Failed to fetch repositories:', error);
        toast({
          title: "Error",
          description: "Failed to load your repositories",
          variant: "destructive"
        });
      }
    };
    
    fetchCredentials();
    fetchRepositories();
  }, [toast]);
  
  const handleTestConnection = async (provider: 'github' | 'bitbucket') => {
    if ((provider === 'github' && !githubToken) || 
        (provider === 'bitbucket' && (!bitbucketUsername || !bitbucketToken))) {
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionSuccess(null);
    
    try {
      const response = await authenticatedRequest('/api/integrations/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          githubToken: provider === 'github' ? githubToken : undefined,
          bitbucketUsername: provider === 'bitbucket' ? bitbucketUsername : undefined,
          bitbucketToken: provider === 'bitbucket' ? bitbucketToken : undefined
        })
      });
      
      if (response.success) {
        setConnectionSuccess(response.data.isValid);
        
        if (response.data.isValid) {
          toast({
            title: "Connection Successful",
            description: "Successfully connected to " + (provider === 'github' ? 'GitHub' : 'Bitbucket')
          });
        } else {
          toast({
            title: "Connection Failed",
            description: response.data.errorMessage || "Unable to connect to the service",
            variant: "destructive"
          });
        }
      } else {
        setConnectionSuccess(false);
        toast({
          title: "Connection Failed",
          description: response.message || "Unable to connect to the service",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Failed to test ${provider} connection:`, error);
      setConnectionSuccess(false);
      toast({
        title: "Connection Error",
        description: "An error occurred while testing the connection",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };
  
  const handleSaveCredentials = async (provider: 'github' | 'bitbucket') => {
    if ((provider === 'github' && !githubToken) || 
        (provider === 'bitbucket' && (!bitbucketUsername || !bitbucketToken))) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await authenticatedRequest('/api/integrations/credentials', {
        method: 'POST',
        body: JSON.stringify({
          provider,
          githubToken: provider === 'github' ? githubToken : undefined,
          bitbucketUsername: provider === 'bitbucket' ? bitbucketUsername : undefined,
          bitbucketToken: provider === 'bitbucket' ? bitbucketToken : undefined,
          isDefault: provider === defaultProvider
        })
      });
      
      if (response.success) {
        toast({
          title: "Success",
          description: response.message || "Credentials saved successfully",
        });
        
        // Update credentials in state
        const newCredentials = [...credentials];
        const existingIndex = newCredentials.findIndex(c => c.provider === provider);
        
        if (existingIndex >= 0) {
          newCredentials[existingIndex] = response.data;
        } else {
          newCredentials.push(response.data);
        }
        
        setCredentials(newCredentials);
        setConnectionSuccess(true);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to save credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error(`Failed to save ${provider} credentials:`, error);
      toast({
        title: "Error",
        description: "An error occurred while saving the credentials",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSetDefaultProvider = async (provider: 'github' | 'bitbucket') => {
    // Check if we have credentials for this provider
    const hasCredentials = credentials.some(c => c.provider === provider);
    
    if (!hasCredentials) {
      toast({
        title: "Warning",
        description: `Please add ${provider === 'github' ? 'GitHub' : 'Bitbucket'} credentials first`,
        variant: "destructive"
      });
      return;
    }
    
    setDefaultProvider(provider);
    
    // Update default provider in database using the dedicated endpoint
    try {
      const response = await authenticatedRequest('/api/integrations/default-provider', {
        method: 'PATCH',
        body: JSON.stringify({ provider })
      });
      
      if (response.success) {
        // Update credentials in state
        const updatedCredentials = credentials.map(c => ({
          ...c,
          isDefault: c.provider === provider
        }));
        
        setCredentials(updatedCredentials);
        
        toast({
          title: "Success",
          description: `${provider === 'github' ? 'GitHub' : 'Bitbucket'} set as default provider`
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update default provider",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to update default provider:', error);
      toast({
        title: "Error",
        description: "Failed to update default provider",
        variant: "destructive"
      });
    }
  };
  
  const handleToggleRepository = async (id: string, currentStatus: boolean) => {
    try {
      const response = await authenticatedRequest(`/api/integrations/repositories/${id}/toggle`, {
        method: 'PATCH'
      });
      
      if (response.success) {
        // Update repository in state
        const updatedRepositories = repositories.map(repo => 
          repo._id === id ? { ...repo, isEnabled: !currentStatus } : repo
        );
        
        setRepositories(updatedRepositories);
        
        toast({
          title: "Success",
          description: response.message || "Repository status updated"
        });
      }
    } catch (error) {
      console.error('Failed to toggle repository status:', error);
      toast({
        title: "Error",
        description: "Failed to update repository status",
        variant: "destructive"
      });
    }
  };
  
  const handleRemoveRepository = async (id: string) => {
    try {
      const response = await authenticatedRequest(`/api/integrations/repositories/${id}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        // Remove repository from state
        setRepositories(repositories.filter(repo => repo._id !== id));
        setCurrentPage(1); // Reset to first page after deletion
        
        toast({
          title: "Success",
          description: response.message || "Repository removed successfully"
        });
      }
    } catch (error) {
      console.error('Failed to remove repository:', error);
      toast({
        title: "Error",
        description: "Failed to remove repository",
        variant: "destructive"
      });
    }
  };
  
  const handleSyncRepositories = async (provider: 'github' | 'bitbucket') => {
    setIsSyncing(true);
    
    try {
      const response = await authenticatedRequest('/api/integrations/sync-repositories', {
        method: 'POST',
        body: JSON.stringify({ provider })
      });
      
      if (response.success) {
        // Refresh repositories list
        const repoResponse = await authenticatedRequest('/api/integrations/repositories', {
          method: 'GET'
        });
        
        if (repoResponse.success) {
          // Sort repositories by connectedAt date (newest first)
          const sortedRepos = (repoResponse.data || []).sort((a, b) => 
            new Date(b.connectedAt).getTime() - new Date(a.connectedAt).getTime()
          );
          setRepositories(sortedRepos);
        }
        
        toast({
          title: "Success",
          description: response.message || "Repositories synced successfully"
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to sync repositories",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to sync repositories:', error);
      toast({
        title: "Error",
        description: "An error occurred while syncing repositories",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // OAuth Login Handler
  const handleOAuthLogin = (provider: 'github') => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in again",
        variant: "destructive"
      });
      return;
    }
    
    // Open popup window for OAuth
    const width = 600;
    const height = 700;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    // Include token in URL query parameter
    const popup = window.open(
      `/api/oauth/${provider}?token=${encodeURIComponent(token)}`,
      `OAuth Login - ${provider}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (!popup) {
      toast({
        title: "Popup Blocked",
        description: "Please allow popups for this site to connect via OAuth",
        variant: "destructive"
      });
      return;
    }
    
    // Listen for OAuth success/error messages
    const messageHandler = (event: MessageEvent) => {
      // Validate origin for security (allow both possible dev ports)
      const allowedOrigins = [
        window.location.origin,
        'http://localhost:5173',
        'http://localhost:5174'
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('[OAuth] Rejected message from invalid origin:', event.origin);
        return;
      }
      
      const { type, provider: eventProvider, username, email, error, message } = event.data;
      
      if (type === 'oauth-success' && eventProvider === provider) {
        // Success! Refresh credentials
        toast({
          title: "Connected!",
          description: `Successfully connected to ${provider}${username ? ` as @${username}` : ''}`,
        });
        
        // Refresh credentials list
        setTimeout(async () => {
          try {
            const response = await authenticatedRequest('/api/integrations/credentials', {
              method: 'GET'
            });
            
            if (response.success) {
              const creds = response.data || [];
              setCredentials(creds);
            }
          } catch (error) {
            console.error('Failed to refresh credentials:', error);
          }
        }, 500);
        
        // Close popup if still open
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // Remove listener
        window.removeEventListener('message', messageHandler);
        
      } else if (type === 'oauth-error' && eventProvider === provider) {
        // Error occurred
        let errorMessage = message || 'Authentication failed';
        
        if (error === 'access_denied') {
          errorMessage = 'You denied access. Please try again and approve the permissions.';
        } else if (error === 'invalid_state') {
          errorMessage = 'Security validation failed. Please try again.';
        }
        
        toast({
          title: "Connection Failed",
          description: errorMessage,
          variant: "destructive"
        });
        
        // Close popup if still open
        if (popup && !popup.closed) {
          popup.close();
        }
        
        // Remove listener
        window.removeEventListener('message', messageHandler);
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    // Clean up listener if popup is closed manually
    const checkPopup = setInterval(() => {
      if (popup.closed) {
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
      }
    }, 1000);
  };
  
  // Disconnect OAuth Account
  const handleDisconnectOAuth = async (provider: 'github') => {
    try {
      const response = await authenticatedRequest(`/api/oauth/${provider}/disconnect`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        toast({
          title: "Disconnected",
          description: `${provider} account has been disconnected`,
        });
        
        // Refresh credentials
        const credsResponse = await authenticatedRequest('/api/integrations/credentials', {
          method: 'GET'
        });
        
        if (credsResponse.success) {
          const creds = credsResponse.data || [];
          setCredentials(creds);
        }
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to disconnect account",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to disconnect OAuth:', error);
      toast({
        title: "Error",
        description: "An error occurred while disconnecting",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header /> */}
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-2xl md:text-3xl font-bold mb-8 text-slate-800">API & Integrations</h1>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader className="w-8 h-8 animate-spin text-primary mb-2" />
                <p className="text-muted-foreground">Loading your credentials...</p>
              </div>
            ) : (
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
                        onClick={() => handleSetDefaultProvider('github')}
                        className="flex items-center space-x-2"
                      >
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </Button>
                      <Button
                        variant={defaultProvider === 'bitbucket' ? 'default' : 'outline'}
                        onClick={() => handleSetDefaultProvider('bitbucket')}
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
                    <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
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
                        {(() => {
                          const githubCred = credentials.find(c => c.provider === 'github');
                          const isOAuthConnected = githubCred?.authType === 'oauth' && githubCred?.isConnected;
                          
                          return (
                            <div>
                              <h3 className="font-semibold mb-4">Connect GitHub Account</h3>
                              <div className="space-y-6">
                                {/* OAuth Connection (Recommended) */}
                                {!isOAuthConnected ? (
                                  <div className="p-6 border-2 border-indigo-200 bg-indigo-50 rounded-lg">
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
                                          <Github className="h-6 w-6 text-white" />
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-indigo-900 mb-1">
                                          Recommended: OAuth Connection
                                        </h4>
                                        <p className="text-sm text-indigo-700 mb-4">
                                          One-click secure authentication with GitHub. No manual token needed!
                                        </p>
                                        <Button
                                          onClick={() => handleOAuthLogin('github')}
                                          className="bg-indigo-600 hover:bg-indigo-700"
                                        >
                                          <Github className="h-4 w-4 mr-2" />
                                          Connect with GitHub
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-6 border-2 border-green-200 bg-green-50 rounded-lg">
                                    <div className="flex items-start justify-between">
                                      <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                          <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
                                            <Check className="h-6 w-6 text-white" />
                                          </div>
                                        </div>
                                        <div>
                                          <h4 className="text-lg font-semibold text-green-900 mb-1">
                                            Connected via OAuth
                                          </h4>
                                          <p className="text-sm text-green-700">
                                            Connected as <strong>@{githubCred.providerUsername}</strong>
                                            {githubCred.providerEmail && ` (${githubCred.providerEmail})`}
                                          </p>
                                          <p className="text-xs text-green-600 mt-1">
                                            Last updated: {new Date(githubCred.updatedAt).toLocaleDateString()}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDisconnectOAuth('github')}
                                        className="text-red-600 border-red-300 hover:bg-red-50"
                                      >
                                        Disconnect
                                      </Button>
                                    </div>
                                  </div>
                                )}
                                
                                {/* Manual Token (Fallback) */}
                                {!isOAuthConnected && (
                                  <div className="space-y-4">
                                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                                      <div className="flex-1 border-t"></div>
                                      <span>OR use Personal Access Token</span>
                                      <div className="flex-1 border-t"></div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="github-token">Personal Access Token (Manual)</Label>
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
                                          onClick={() => handleTestConnection('github')}
                                          disabled={!githubToken || isTestingConnection}
                                          className="rounded-l-none rounded-r-none border-l-0 border-r-0"
                                        >
                                          {isTestingConnection ? (
                                            "Testing..."
                                          ) : connectionSuccess === true && activeTab === 'github' ? (
                                            <>
                                              <Check className="h-4 w-4 mr-2" />
                                              Connected
                                            </>
                                          ) : (
                                            "Test"
                                          )}
                                        </Button>
                                        <Button 
                                          onClick={() => handleSaveCredentials('github')}
                                          disabled={!githubToken || isSaving || (connectionSuccess === false && activeTab === 'github')}
                                          className="rounded-l-none"
                                        >
                                          {isSaving ? "Saving..." : "Save"}
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
                                )}
                                
                                {/* Sync Repositories Button */}
                                {(isOAuthConnected || credentials.some(c => c.provider === 'github')) && (
                                  <div className="flex justify-end pt-4 border-t">
                                    <Button 
                                      variant="outline"
                                      onClick={() => handleSyncRepositories('github')}
                                      disabled={isSyncing}
                                      className="flex items-center space-x-2"
                                    >
                                      <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                      <span>Sync Repositories</span>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()}
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
                                  onClick={() => handleTestConnection('bitbucket')}
                                  disabled={!bitbucketUsername || !bitbucketToken || isTestingConnection}
                                  className="rounded-l-none rounded-r-none border-l-0 border-r-0"
                                >
                                  {isTestingConnection ? (
                                    "Testing..."
                                  ) : connectionSuccess === true && activeTab === 'bitbucket' ? (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Connected
                                    </>
                                  ) : connectionSuccess === false && activeTab === 'bitbucket' ? (
                                    <>
                                      <X className="h-4 w-4 mr-2" />
                                      Failed
                                    </>
                                  ) : (
                                    "Test"
                                  )}
                                </Button>
                                <Button 
                                  onClick={() => handleSaveCredentials('bitbucket')}
                                  disabled={!bitbucketUsername || !bitbucketToken || isSaving || (connectionSuccess === false && activeTab === 'bitbucket')}
                                  className="rounded-l-none"
                                >
                                  {isSaving ? "Saving..." : "Save"}
                                </Button>
                              </div>
                              <p className="text-sm text-slate-500">
                                The app password requires <code>repositories:read</code> permissions.
                              </p>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => handleSyncRepositories('bitbucket')}
                                disabled={isSyncing || !credentials.some(c => c.provider === 'bitbucket')}
                                className="flex items-center space-x-2"
                              >
                                <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                <span>Sync Repositories</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
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
                        {/* Apply pagination to repositories */}
                        {repositories
                          .slice((currentPage - 1) * reposPerPage, currentPage * reposPerPage)
                          .map(repo => (
                          <div key={repo._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              {repo.provider === 'github' ? (
                                <Github className="h-5 w-5 mr-3 text-slate-700" />
                              ) : (
                                <GitBranch className="h-5 w-5 mr-3 text-slate-700" />
                              )}
                              <div>
                                <p className="font-medium">{repo.name}</p>
                                <p className="text-sm text-slate-500">
                                  Connected: {new Date(repo.connectedAt).toLocaleDateString()}
                                  {repo.lastScanDate && ` | Last scanned: ${new Date(repo.lastScanDate).toLocaleDateString()}`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <Switch 
                                  id={`repo-${repo._id}`}
                                  checked={repo.isEnabled}
                                  onCheckedChange={() => handleToggleRepository(repo._id, repo.isEnabled)}
                                />
                                <Label htmlFor={`repo-${repo._id}`} className="cursor-pointer">
                                  {repo.isEnabled ? 'Enabled' : 'Disabled'}
                                </Label>
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
                                    <AlertDialogAction onClick={() => handleRemoveRepository(repo._id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                        
                        {/* Pagination controls */}
                        {repositories.length > reposPerPage && (
                          <div className="flex justify-center mt-4 space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              disabled={currentPage === 1}
                            >
                              Previous
                            </Button>
                            <div className="flex items-center px-4">
                              <span className="text-sm">
                                Page {currentPage} of {Math.ceil(repositories.length / reposPerPage)}
                              </span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setCurrentPage(p => Math.min(Math.ceil(repositories.length / reposPerPage), p + 1))}
                              disabled={currentPage >= Math.ceil(repositories.length / reposPerPage)}
                            >
                              Next
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiIntegrations;
