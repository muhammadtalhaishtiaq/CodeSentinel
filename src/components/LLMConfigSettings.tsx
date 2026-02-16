import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, RefreshCw, Trash2, Eye, EyeOff, Plus, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authenticatedRequest } from '@/utils/authUtils';

interface LLMConfig {
    _id: string;
    provider: string;
    model?: string;
    displayName: string;
    isDefault: boolean;
    isActive: boolean;
    lastTestStatus?: 'success' | 'error' | 'pending';
    lastTestedAt?: string;
    lastTestError?: string;
    totalRequests: number;
    estimatedCost: number;
    currentMonthRequests: number;
}

interface ProviderInfo {
    name: string;
    description: string;
    models: string[];
    needsApiKey: boolean;
    needsEndpoint: boolean;
    pricing: string;
    docsUrl?: string;
}

export default function LLMConfigSettings() {
    const [configs, setConfigs] = useState<LLMConfig[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<string>('aiml');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [model, setModel] = useState('');
    const [endpoint, setEndpoint] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [testingConnection, setTestingConnection] = useState<string | null>(null);
    const [providers, setProviders] = useState<Record<string, ProviderInfo>>({});
    const [fetchingData, setFetchingData] = useState(true);

    // Fetch configs and provider info on mount
    useEffect(() => {
        const loadData = async () => {
            setFetchingData(true);
            await Promise.all([fetchConfigs(), fetchProviderInfo()]);
            setFetchingData(false);
        };
        loadData();
    }, []);

    const fetchConfigs = async () => {
        try {
            const data = await authenticatedRequest('/api/llm-config');
            setConfigs(data.data || []);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error fetching configs');
        }
    };

    const fetchProviderInfo = async () => {
        try {
            const data = await authenticatedRequest('/api/llm-config/providers/info');
            setProviders(data.data || {});
        } catch (err) {
            console.error('Error fetching provider info:', err);
        }
    };

    const handleAddConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setLoading(true);

        try {
            const data = await authenticatedRequest('/api/llm-config', {
                method: 'POST',
                body: JSON.stringify({
                    provider: selectedProvider,
                    apiKey: selectedProvider === 'aiml' ? null : apiKey,
                    model: model || null,
                    endpoint: endpoint || null,
                    displayName: displayName || `${selectedProvider} Config`
                })
            });

            setConfigs([...configs, data.data]);
            setSuccess(`✅ ${selectedProvider} configuration added${data.connectionValid ? ' and validated!' : ''}`);

            // Reset form
            setApiKey('');
            setModel('');
            setEndpoint('');
            setDisplayName('');
            setSelectedProvider('aiml');
            setShowAddForm(false);

            // Clear message after 3 seconds
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error creating config');
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async (configId: string) => {
        setTestingConnection(configId);
        try {
            const data = await authenticatedRequest(`/api/llm-config/${configId}/test`, {
                method: 'POST'
            });

            setSuccess(`✅ Connection ${data.data.isValid ? 'successful' : 'failed'}`);
            fetchConfigs();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection test failed');
        } finally {
            setTestingConnection(null);
        }
    };

    const handleSetDefault = async (configId: string) => {
        try {
            await authenticatedRequest(`/api/llm-config/${configId}/set-default`, {
                method: 'POST'
            });

            setSuccess('✅ Default LLM provider updated');
            fetchConfigs();

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error setting default');
        }
    };

    const handleDeleteConfig = async (configId: string) => {
        if (!confirm('Are you sure? This cannot be undone.')) return;

        try {
            await authenticatedRequest(`/api/llm-config/${configId}`, {
                method: 'DELETE'
            });

            setConfigs(configs.filter(c => c._id !== configId));
            setSuccess('✅ Configuration deleted');

            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error deleting config');
        }
    };

    const providerInfo = providers[selectedProvider];

    if (fetchingData) {
        return (
            <div className="text-center py-12">
                <div className="inline-block">
                    <div className="animate-spin">
                        <RefreshCw className="h-8 w-8 text-blue-600" />
                    </div>
                </div>
                <p className="text-slate-600 mt-4">Loading LLM configurations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* <div>
                <h3 className="text-lg font-semibold">🤖 LLM Configuration</h3>
                <p className="text-sm text-slate-600 mt-1">Manage your AI/ML provider settings. Choose your preferred LLM service or use our shared free tier.</p>
            </div> */}

            {/* Alerts */}
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="border-green-200 bg-green-50">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
            )}

            {/* Current Configurations */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-semibold">Active Configurations</h4>
                    {!showAddForm && (
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add Provider
                        </Button>
                    )}
                </div>

                {configs.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <p className="text-slate-600">No LLM configurations yet. Add one to get started!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {configs.map((config) => (
                            <Card
                                key={config._id}
                                className="hover:shadow-md transition-all"
                            >
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Provider Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <h4 className="text-base font-semibold">{config.displayName}</h4>
                                                {config.isDefault && (
                                                    <Badge className="bg-purple-100 text-purple-800 text-xs">Default</Badge>
                                                )}
                                                {config.lastTestStatus === 'success' ? (
                                                    <Badge className="bg-green-100 text-green-800 text-xs gap-1">
                                                        <Check className="h-3 w-3" />
                                                        Connected
                                                    </Badge>
                                                ) : config.lastTestStatus === 'error' ? (
                                                    <Badge className="bg-red-100 text-red-800 text-xs gap-1">
                                                        <X className="h-3 w-3" />
                                                        Error
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-800 text-xs">Not tested</Badge>
                                                )}
                                            </div>

                                            <div className="space-y-1 text-sm">
                                                <p className="text-slate-700">
                                                    <span className="text-slate-600">Provider:</span> <span className="font-medium">{providers[config.provider]?.name || config.provider}</span>
                                                </p>
                                                {config.model && (
                                                    <p className="text-slate-700">
                                                        <span className="text-slate-600">Model:</span> <span className="font-medium">{config.model}</span>
                                                    </p>
                                                )}
                                                <p className="text-slate-700">
                                                    <span className="text-slate-600">Requests this month:</span> <span className="font-medium text-blue-600">{config.currentMonthRequests}</span>
                                                </p>
                                                {config.estimatedCost > 0 && (
                                                    <p className="text-slate-700">
                                                        <span className="text-slate-600">Est. cost:</span> <span className="font-medium">${config.estimatedCost.toFixed(2)}</span>
                                                    </p>
                                                )}
                                                {config.lastTestedAt && (
                                                    <p className="text-slate-500 text-xs">
                                                        Last tested: {new Date(config.lastTestedAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-wrap justify-end">
                                            {!config.isDefault && (
                                                <Button
                                                    onClick={() => handleSetDefault(config._id)}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Set Default
                                                </Button>
                                            )}

                                            <Button
                                                onClick={() => handleTestConnection(config._id)}
                                                disabled={testingConnection === config._id}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>

                                            {!config.isDefault && (
                                                <Button
                                                    onClick={() => handleDeleteConfig(config._id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Configuration Form */}
            {showAddForm && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardHeader>
                        <CardTitle>Add New LLM Provider</CardTitle>
                        <CardDescription>Configure a new AI/ML provider for security scanning and analysis</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleAddConfig} className="space-y-6">
                            {/* Provider Selection */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">Provider</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(providers).map(([key, provider]) => (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                setSelectedProvider(key);
                                                setModel(provider.models?.[0] || '');
                                            }}
                                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                                                selectedProvider === key
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-200 hover:border-blue-300 bg-white'
                                            }`}
                                        >
                                            <p className="font-semibold text-gray-900 text-sm">{provider.name}</p>
                                            <p className="text-xs text-gray-600">{provider.pricing}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Provider Description & Docs */}
                            {providerInfo && (
                                <div className="bg-white border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-slate-700 mb-2">{providerInfo.description}</p>
                                    {providerInfo.docsUrl && (
                                        <a
                                            href={providerInfo.docsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-700 text-sm inline-flex items-center gap-1"
                                        >
                                            Get API Key <ExternalLink className="h-3 w-3" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* Only show fields for non-AIML providers */}
                            {selectedProvider !== 'aiml' && (
                                <>
                                    {/* API Key */}
                                    {providerInfo?.needsApiKey && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">API Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showApiKey ? 'text' : 'password'}
                                                    value={apiKey}
                                                    onChange={(e) => setApiKey(e.target.value)}
                                                    required={selectedProvider !== 'aiml'}
                                                    placeholder="Enter your API key"
                                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                                                >
                                                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-600">🔒 Encrypted before storage. Never shared.</p>
                                        </div>
                                    )}

                                    {/* Model Selection */}
                                    {providerInfo?.models && providerInfo.models.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Model</label>
                                            <select
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                            >
                                                {providerInfo.models.map((m) => (
                                                    <option key={m} value={m} className="bg-white">
                                                        {m}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Endpoint (Azure only) */}
                                    {providerInfo?.needsEndpoint && (
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium">Azure Endpoint</label>
                                            <input
                                                type="url"
                                                value={endpoint}
                                                onChange={(e) => setEndpoint(e.target.value)}
                                                placeholder="https://your-resource.openai.azure.com/"
                                                required
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                            />
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Display Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium">Display Name (Optional)</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder={`My ${providers[selectedProvider]?.name || selectedProvider}`}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100"
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                                >
                                    {loading ? 'Adding...' : `Add ${providers[selectedProvider]?.name || selectedProvider}`}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setShowAddForm(false)}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Usage Information */}
            <Card>
                <CardHeader>
                    <CardTitle>Pricing & Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                            <p className="text-xs text-blue-600 uppercase font-medium">Free Tier</p>
                            <p className="text-lg font-bold text-blue-900">50 scans/month</p>
                            <p className="text-xs text-blue-700">Shared AIML key</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-3">
                            <p className="text-xs text-purple-600 uppercase font-medium">Hobby Tier</p>
                            <p className="text-lg font-bold text-purple-900">Unlimited</p>
                            <p className="text-xs text-purple-700">Your own API key</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-3">
                            <p className="text-xs text-green-600 uppercase font-medium">Cost Tracking</p>
                            <p className="text-sm text-green-900">By provider</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-3">
                            <p className="text-xs text-amber-600 uppercase font-medium">Security</p>
                            <p className="text-sm text-amber-900">AES-256 encryption</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
