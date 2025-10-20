import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Github, Check, X, Loader, ExternalLink, Shield, AlertCircle, Cloud, Key } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface OAuthStatus {
  github: {
    connected: boolean;
    username?: string;
    email?: string;
    connectedAt?: string;
    isDefault?: boolean;
  } | null;
  azure: {
    connected: boolean;
    username?: string;
    email?: string;
    connectedAt?: string;
    isDefault?: boolean;
  } | null;
  bitbucket: {
    connected: boolean;
    username?: string;
    email?: string;
    connectedAt?: string;
    isDefault?: boolean;
  } | null;
}

const ApiIntegrations = () => {
  const [oauthStatus, setOAuthStatus] = useState<OAuthStatus>({
    github: null,
    azure: null,
    bitbucket: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  
  // Azure manual PAT state
  const [azureOrganization, setAzureOrganization] = useState('');
  const [azurePat, setAzurePat] = useState('');
  const [isTestingAzure, setIsTestingAzure] = useState(false);
  const [isSavingAzure, setIsSavingAzure] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle OAuth callback results from URL params (fallback)
  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success) {
      toast({
        title: 'Success!',
        description: `${success.charAt(0).toUpperCase() + success.slice(1)} connected successfully!`,
        variant: 'default',
      });
      // Clean URL
      navigate('/api-integrations', { replace: true });
      fetchOAuthStatus();
    }

    if (error) {
      toast({
        title: 'Connection Failed',
        description: `Failed to connect: ${error.replace(/_/g, ' ')}`,
        variant: 'destructive',
      });
      // Clean URL
      navigate('/api-integrations', { replace: true });
    }
  }, [searchParams]);

  // Listen for OAuth popup messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      const { type, provider, error } = event.data;

      if (type === 'oauth-success') {
        toast({
          title: 'Success!',
          description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected successfully!`,
        });
        fetchOAuthStatus();
      } else if (type === 'oauth-error') {
        toast({
          title: 'Connection Failed',
          description: `Failed to connect: ${error?.replace(/_/g, ' ') || 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    fetchOAuthStatus();
  }, []);

  const fetchOAuthStatus = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedRequest('/api/oauth/status');
      
      if (response.success) {
        setOAuthStatus(response.data);
      }
    } catch (error) {
      console.error('Error fetching OAuth status:', error);
      toast({
        title: 'Error',
        description: 'Failed to load integration status',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: 'github' | 'azure' | 'bitbucket') => {
    try {
      setConnectingProvider(provider);
      
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token missing. Please log in again.');
      }
      
      // Open OAuth popup with token in query string
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        `/api/oauth/${provider}/connect?token=${encodeURIComponent(token)}`,
        'OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    } catch (error: any) {
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to initiate OAuth connection',
        variant: 'destructive',
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleDisconnect = async (provider: 'github' | 'azure' | 'bitbucket') => {
    try {
      const response = await authenticatedRequest(`/api/oauth/${provider}/disconnect`, {
        method: 'DELETE',
      });

      if (response.success) {
        toast({
          title: 'Disconnected',
          description: `${provider.charAt(0).toUpperCase() + provider.slice(1)} has been disconnected`,
        });
        fetchOAuthStatus();
        // Clear Azure fields if disconnecting Azure
        if (provider === 'azure') {
          setAzureOrganization('');
          setAzurePat('');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to disconnect',
        variant: 'destructive',
      });
    }
  };

  // Azure PAT Functions
  const handleTestAzure = async () => {
    if (!azureOrganization || !azurePat) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both organization and Personal Access Token',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingAzure(true);
    try {
      const response = await authenticatedRequest('/api/integrations/test-connection', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'azure',
          azureOrganization,
          azurePat
        })
      });

      if (response.success && response.data.isValid) {
        toast({
          title: 'Connection Successful!',
          description: 'Azure DevOps credentials are valid',
        });
      } else {
        toast({
          title: 'Connection Failed',
          description: response.data?.errorMessage || 'Invalid credentials',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message || 'Failed to test connection',
        variant: 'destructive',
      });
    } finally {
      setIsTestingAzure(false);
    }
  };

  const handleSaveAzure = async () => {
    if (!azureOrganization || !azurePat) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both organization and Personal Access Token',
        variant: 'destructive',
      });
      return;
    }

    setIsSavingAzure(true);
    try {
      const response = await authenticatedRequest('/api/integrations/credentials', {
        method: 'POST',
        body: JSON.stringify({
          provider: 'azure',
          azureOrganization,
          azurePat
        })
      });

      if (response.success) {
        toast({
          title: 'Success!',
          description: 'Azure DevOps credentials saved successfully',
        });
        fetchOAuthStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to save credentials',
        variant: 'destructive',
      });
    } finally {
      setIsSavingAzure(false);
    }
  };

  const providers = [
    {
      id: 'github',
      name: 'GitHub',
      description: 'Connect your GitHub account to scan repositories and pull requests',
      icon: Github,
      color: 'from-gray-800 to-black',
      accentColor: 'border-gray-700',
      status: oauthStatus.github
    },
    {
      id: 'azure',
      name: 'Azure DevOps',
      description: 'Connect Azure DevOps to scan your organization repositories',
      icon: Cloud,
      color: 'from-blue-600 to-blue-800',
      accentColor: 'border-blue-500',
      status: oauthStatus.azure
    },
    {
      id: 'bitbucket',
      name: 'Bitbucket',
      description: 'Connect Bitbucket to analyze your team repositories',
      icon: () => (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M.778 1.213a.768.768 0 00-.768.892l3.263 19.81c.084.5.515.868 1.022.873H19.95a.772.772 0 00.77-.646l3.27-20.03a.768.768 0 00-.768-.891zM14.52 15.528H9.522L8.17 8.464h7.561z"/>
        </svg>
      ),
      color: 'from-blue-700 to-blue-900',
      accentColor: 'border-blue-600',
      status: oauthStatus.bitbucket
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="flex items-center justify-center h-96">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* <Header /> */}
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                API Integrations
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Connect your code repositories securely with OAuth. No manual tokens needed.
              </p>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Secure OAuth Authentication</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  We use industry-standard OAuth 2.0 to connect your accounts. We never see or store your passwords.
                </p>
              </div>
            </div>

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((provider) => {
                const isConnected = provider.status?.connected || false;
                const isConnecting = connectingProvider === provider.id;
                const Icon = provider.icon;

                return (
                  <Card 
                    key={provider.id}
                    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2 ${
                      isConnected ? provider.accentColor : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    {/* Status Badge */}
                    {isConnected && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Connected
                        </div>
                      </div>
                    )}

                    <CardHeader>
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${provider.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <CardTitle className="text-xl">{provider.name}</CardTitle>
                      <CardDescription className="min-h-[48px]">
                        {provider.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {isConnected && provider.status ? (
                        <div className="space-y-3">
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Username:</span>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {provider.status.username || 'N/A'}
                              </span>
                            </div>
                            {provider.status.email && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                <span className="font-medium text-gray-900 dark:text-gray-100 truncate ml-2">
                                  {provider.status.email}
                                </span>
                              </div>
                            )}
                          </div>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Disconnect
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Disconnect {provider.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove access to your {provider.name} repositories. You can reconnect anytime.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDisconnect(provider.id as any)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Disconnect
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnect(provider.id as any)}
                          disabled={isConnecting}
                          className={`w-full bg-gradient-to-r ${provider.color} hover:opacity-90 text-white shadow-lg`}
                        >
                          {isConnecting ? (
                            <>
                              <Loader className="w-4 h-4 mr-2 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Connect {provider.name}
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Help Section */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Why OAuth?</strong> OAuth is more secure than using personal access tokens. It gives you granular control over permissions.
                </p>
                <p>
                  <strong>What permissions do we request?</strong> We only request read access to your repositories and profile information.
                </p>
                <p>
                  <strong>Can I revoke access?</strong> Yes! You can disconnect anytime here, or revoke access from your provider's settings.
                </p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiIntegrations;
