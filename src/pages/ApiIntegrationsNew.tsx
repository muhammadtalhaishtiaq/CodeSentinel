import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Sidebar from '@/components/Sidebar';
import { Github, GitBranch, Loader, Check, X, RefreshCw, Shield, Database } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';
import { useToast } from '@/components/ui/use-toast';

interface SourceCredential {
  id: string;
  provider: 'github' | 'bitbucket' | 'azure';
  isDefault: boolean;
  isActive: boolean;
  authType?: 'manual' | 'oauth';
  providerUsername?: string;
  providerEmail?: string;
  isConnected?: boolean;
  createdAt: string;
  updatedAt: string;
}

const ApiIntegrationsNew = () => {
  const [credentials, setCredentials] = useState<SourceCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [defaultProvider, setDefaultProvider] = useState<'github' | 'bitbucket' | 'azure'>('github');
  const { toast } = useToast();

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedRequest('/api/integrations/credentials', {
        method: 'GET'
      });

      if (response.success) {
        const creds = response.data || [];
        setCredentials(creds);

        // Set default provider
        const defaultCred = creds.find((cred: SourceCredential) => cred.isDefault);
        if (defaultCred) {
          setDefaultProvider(defaultCred.provider);
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

  const handleOAuthLogin = (provider: 'github' | 'bitbucket' | 'azure') => {
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
      const allowedOrigins = [
        window.location.origin,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175'
      ];

      if (!allowedOrigins.includes(event.origin)) {
        console.warn('[OAuth] Rejected message from invalid origin:', event.origin);
        return;
      }

      const { type, provider: eventProvider, username, email, error, message } = event.data;

      if (type === 'oauth-success' && eventProvider === provider) {
        toast({
          title: "Connected!",
          description: `Successfully connected to ${provider}${username ? ` as @${username}` : ''}`,
        });

        // Refresh credentials
        setTimeout(() => fetchCredentials(), 500);

        if (popup && !popup.closed) {
          popup.close();
        }

        window.removeEventListener('message', messageHandler);

      } else if (type === 'oauth-error' && eventProvider === provider) {
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

        if (popup && !popup.closed) {
          popup.close();
        }

        window.removeEventListener('message', messageHandler);
      }
    };

    window.addEventListener('message', messageHandler);

    const checkPopup = setInterval(() => {
      if (popup.closed) {
        window.removeEventListener('message', messageHandler);
        clearInterval(checkPopup);
      }
    }, 1000);
  };

  const handleDisconnect = async (provider: 'github' | 'bitbucket' | 'azure') => {
    try {
      const response = await authenticatedRequest(`/api/oauth/${provider}/disconnect`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast({
          title: "Disconnected",
          description: `${provider} account has been disconnected`,
        });

        fetchCredentials();
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

  const handleSyncRepositories = async (provider: string) => {
    setIsSyncing(true);

    try {
      const response = await authenticatedRequest('/api/integrations/sync-repositories', {
        method: 'POST',
        body: JSON.stringify({ provider })
      });

      if (response.success) {
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

  const handleSetDefaultProvider = async (provider: 'github' | 'bitbucket' | 'azure') => {
    try {
      const response = await authenticatedRequest('/api/integrations/credentials/set-default', {
        method: 'PUT',
        body: JSON.stringify({ provider })
      });

      if (response.success) {
        setDefaultProvider(provider);
        toast({
          title: "Success",
          description: `${provider} set as default provider`
        });
        fetchCredentials();
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to set default provider",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to set default provider:', error);
    }
  };

  const getProviderCredential = (provider: string) => {
    return credentials.find(c => c.provider === provider && c.authType === 'oauth');
  };

  const renderProviderCard = (
    provider: 'github' | 'bitbucket' | 'azure',
    icon: React.ReactNode,
    name: string,
    description: string,
    color: string
  ) => {
    const credential = getProviderCredential(provider);
    const isConnected = credential?.isConnected;

    return (
      <Card className={`border-2 ${
        isConnected 
          ? provider === 'github' 
            ? 'border-indigo-200 bg-indigo-50'
            : provider === 'bitbucket'
            ? 'border-blue-200 bg-blue-50'
            : 'border-cyan-200 bg-cyan-50'
          : 'border-gray-200'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`h-12 w-12 rounded-full ${
                isConnected 
                  ? provider === 'github'
                    ? 'bg-indigo-600'
                    : provider === 'bitbucket'
                    ? 'bg-blue-600'
                    : 'bg-cyan-600'
                  : 'bg-gray-400'
              } flex items-center justify-center`}>
                {icon}
              </div>
              <div>
                <CardTitle className="text-xl">{name}</CardTitle>
                <CardDescription className="text-sm">{description}</CardDescription>
              </div>
            </div>
            {credential?.isDefault && (
              <Badge variant="default" className="bg-indigo-600">
                <Shield className="h-3 w-3 mr-1" />
                Default
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg ${
                provider === 'github'
                  ? 'bg-indigo-100 border border-indigo-200'
                  : provider === 'bitbucket'
                  ? 'bg-blue-100 border border-blue-200'
                  : 'bg-cyan-100 border border-cyan-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-gray-900">Connected</span>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">
                    <Database className="h-3 w-3 mr-1" />
                    OAuth
                  </Badge>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Username:</strong> @{credential.providerUsername}</p>
                  {credential.providerEmail && (
                    <p><strong>Email:</strong> {credential.providerEmail}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Connected on {new Date(credential.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleSyncRepositories(provider)}
                  disabled={isSyncing}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                  Sync Repos
                </Button>
                {!credential?.isDefault && (
                  <Button
                    onClick={() => handleSetDefaultProvider(provider)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Set Default
                  </Button>
                )}
              </div>

              <Button
                onClick={() => handleDisconnect(provider)}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gray-100 border border-gray-200">
                <p className="text-sm text-gray-600 text-center">
                  No connection established yet
                </p>
              </div>
              <Button
                onClick={() => handleOAuthLogin(provider)}
                className={`w-full ${
                  provider === 'github' 
                    ? 'bg-indigo-600 hover:bg-indigo-700' 
                    : provider === 'bitbucket'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-cyan-600 hover:bg-cyan-700'
                }`}
              >
                {icon}
                <span className="ml-2">Connect with {name}</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <Loader className="h-8 w-8 animate-spin text-indigo-600" />
              <span className="ml-3 text-lg text-gray-600">Loading integrations...</span>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">API & Integrations</h1>
              <p className="text-gray-600 mt-2">
                Connect your source code providers to enable automatic repository scanning
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderProviderCard(
                'github',
                <Github className="h-6 w-6 text-white" />,
                'GitHub',
                'Connect your GitHub repositories',
                'indigo'
              )}

              {renderProviderCard(
                'bitbucket',
                <GitBranch className="h-6 w-6 text-white" />,
                'Bitbucket',
                'Connect your Bitbucket repositories',
                'blue'
              )}

              {renderProviderCard(
                'azure',
                <Database className="h-6 w-6 text-white" />,
                'Azure DevOps',
                'Connect your Azure DevOps repositories',
                'cyan'
              )}
            </div>

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>🔐 How OAuth Works</CardTitle>
                <CardDescription>
                  Secure connection without sharing your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">1️⃣</span>
                    </div>
                    <h3 className="font-semibold mb-2">Click Connect</h3>
                    <p className="text-sm text-gray-600">
                      A secure popup opens to the provider's website
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">2️⃣</span>
                    </div>
                    <h3 className="font-semibold mb-2">Authorize Access</h3>
                    <p className="text-sm text-gray-600">
                      Grant permissions to CodeSentinel
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">3️⃣</span>
                    </div>
                    <h3 className="font-semibold mb-2">Done!</h3>
                    <p className="text-sm text-gray-600">
                      Your account is securely connected
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ApiIntegrationsNew;


