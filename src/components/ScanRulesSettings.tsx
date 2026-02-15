import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authenticatedRequest } from '@/utils/authUtils';

interface ScanRule {
  _id: string;
  name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  languages: string[];
  checkFor: string[];
  ruleDetails: string;
  category: 'security' | 'performance' | 'code-quality' | 'best-practices' | 'architectural';
  active: boolean;
  isDefault: boolean;
  ruleType?: 'master' | 'custom';
  isMasterRule?: boolean;
  createdAt: string;
}

interface NewRule {
  name: string;
  description: string;
  languages: string[];
  ruleDetails: string;
}

const ScanRulesSettings = () => {
  const [rules, setRules] = useState<ScanRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<NewRule>({
    name: '',
    description: '',
    languages: [],
    ruleDetails: ''
  });

  const languages = [
    'javascript', 'typescript', 'python', 'php', 'java', 'csharp',
    'cpp', 'go', 'rust', 'ruby', 'sql', 'html', 'css', 'kotlin', 'swift'
  ];

  // Fetch rules
  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await authenticatedRequest('/api/scan-rules', { method: 'GET' });
      if (response.success) {
        setRules(response.data);
        setError(null);
      } else {
        setError('Failed to fetch scan rules');
      }
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('An error occurred while fetching scan rules');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);

      if (!formData.name || !formData.ruleDetails || formData.languages.length === 0) {
        setError('Please fill in all required fields (Name, Languages, Rule Details)');
        return;
      }

      const payload = {
        ...formData
      };

      if (editingId) {
        // Update existing rule
        const response = await authenticatedRequest(`/api/scan-rules/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        if (response.success) {
          setRules(rules.map(r => r._id === editingId ? response.data : r));
          setSuccess('Rule updated successfully');
          setEditingId(null);
        } else {
          setError('Failed to update rule');
        }
      } else {
        // Create new rule
        const response = await authenticatedRequest('/api/scan-rules', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        if (response.success) {
          setRules([response.data, ...rules]);
          setSuccess('Rule created successfully');
        } else {
          setError('Failed to create rule');
        }
      }

      resetForm();
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving rule:', err);
      setError('An error occurred while saving the rule');
    }
  };

  const handleDeleteRule = async () => {
    try {
      const response = await authenticatedRequest(`/api/scan-rules/${deleteId}`, {
        method: 'DELETE'
      });
      if (response.success) {
        setRules(rules.filter(r => r._id !== deleteId));
        setSuccess('Rule deleted successfully');
        setDeleteId(null);
      } else {
        setError('Failed to delete rule');
      }
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('An error occurred while deleting the rule');
    }
  };

  const handleToggleRule = async (rule: ScanRule) => {
    try {
      const response = await authenticatedRequest(`/api/scan-rules/${rule._id}/toggle`, {
        method: 'PATCH'
      });
      if (response.success) {
        setRules(rules.map(r => r._id === rule._id ? response.data : r));
        setSuccess(`Rule ${response.data.active ? 'activated' : 'deactivated'}`);
      }
    } catch (err) {
      console.error('Error toggling rule:', err);
      setError('Failed to toggle rule');
    }
  };

  const handleEditRule = (rule: ScanRule) => {
    setFormData({
      name: rule.name,
      description: rule.description,
      languages: rule.languages,
      ruleDetails: rule.ruleDetails
    });
    setEditingId(rule._id);
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      languages: [],
      ruleDetails: ''
    });
    setEditingId(null);
  };

  const handleLanguageChange = (lang: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const filteredRules = rules.filter(rule => {
    const matchSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       rule.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // Separate master rule and custom rules
  const masterRule = rules.find(r => r.isMasterRule);
  const customRules = filteredRules.filter(r => !r.isMasterRule);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading scan rules...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Scan Rules</h3>
          <p className="text-sm text-slate-600 mt-1">
            Define custom security rules to be applied during code scans
          </p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddForm(!showAddForm); }} className="gap-2">
          <Plus className="h-4 w-4" />
          {showAddForm ? 'Cancel' : 'Add Rule'}
        </Button>
      </div>

      {/* Master Rule Section */}
      {masterRule && (
        <Card className="border-purple-300 bg-purple-50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{masterRule.name}</CardTitle>
                  <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                    Master Rule (Auto-Created)
                  </span>
                </div>
                <CardDescription className="mt-2">
                  {masterRule.description}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleRule(masterRule)}
                  className="p-2 hover:bg-purple-100 rounded-lg transition"
                  title={masterRule.active ? 'Disable' : 'Enable'}
                >
                  {masterRule.active ? (
                    <ToggleRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Severity:</span>
                <div className={`inline-block ml-2 px-2 py-1 rounded text-xs font-medium ${getSeverityColor(masterRule.severity)}`}>
                  {masterRule.severity.charAt(0).toUpperCase() + masterRule.severity.slice(1)}
                </div>
              </div>
              <div>
                <span className="text-gray-600">Languages:</span>
                <span className="ml-2 font-medium">All 15</span>
              </div>
              <div>
                <span className="text-gray-600">Coverage:</span>
                <span className="ml-2 font-medium">22 Points</span>
              </div>
              <div>
                <span className="text-gray-600">Coverage:</span>
                <span className="ml-2 font-medium">9 Categories</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-white rounded border border-purple-200">
              <p className="text-xs font-semibold text-purple-900 mb-2">What This Covers:</p>
              <ul className="text-xs text-purple-900 space-y-1 grid grid-cols-2">
                <li>• Code Quality (3 pts)</li>
                <li>• Functionality (3 pts)</li>
                <li>• Security (3 pts)</li>
                <li>• Performance (3 pts)</li>
                <li>• Testing (2 pts)</li>
                <li>• Standards (2 pts)</li>
                <li>• Dependencies (2 pts)</li>
                <li>• Documentation (2 pts)</li>
                <li>• UI/UX (2 pts)</li>
              </ul>
            </div>
            <p className="text-xs text-purple-700 italic">NOTE: This master rule is created for all users and provides comprehensive code evaluation. You can toggle it on/off and customize it if needed.</p>
          </CardContent>
        </Card>
      )}

      {/* Custom Rules Section */}
      {showAddForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Scan Rule' : 'Create New Scan Rule'}</CardTitle>
            <CardDescription>
              {editingId ? 'Update your custom scanning rule' : 'Define a new custom rule for code scanning'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddRule} className="space-y-6">
              {/* Rule Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Rule Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., No Console Logs in Production"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief summary of what this rule checks"
                />
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Languages * <span className="text-gray-500 font-normal text-xs">(Select all that apply)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-white rounded-md border">
                  {languages.map(lang => (
                    <label key={lang} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={() => handleLanguageChange(lang)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm capitalize">{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rule Details */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Rule Details * 
                  <span className="text-gray-500 font-normal text-xs ml-2">
                    (Include what to check, patterns to look for, good/bad examples)
                  </span>
                </label>
                <textarea
                  value={formData.ruleDetails}
                  onChange={(e) => setFormData({...formData, ruleDetails: e.target.value})}
                  placeholder="Describe what the LLM should check for. Include:&#10;- What patterns or issues to detect&#10;- Severity/impact of violations&#10;- Examples of bad code practices&#10;- Examples of good code practices&#10;- Any specific keywords or patterns to watch for"
                  rows={8}
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  required
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowAddForm(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? 'Update Rule' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Input
          placeholder="Search rules by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {customRules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-slate-500">
                {searchQuery ? 'No rules match your search' : 'No custom rules yet. Create one to get started!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          customRules.map(rule => (
            <Card key={rule._id} className={rule.active ? '' : 'opacity-60'}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{rule.name}</h4>
                      {rule.isDefault && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                    </div>
                    {rule.description && (
                      <p className="text-sm text-slate-600 mb-3">{rule.description}</p>
                    )}
                    <div className="flex gap-3 flex-wrap">
                      <span className="text-xs text-slate-500">
                        Languages: {rule.languages.slice(0, 4).join(', ')}{rule.languages.length > 4 ? ` +${rule.languages.length - 4} more` : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!rule.isDefault && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleToggleRule(rule)}
                          title={rule.active ? 'Deactivate' : 'Activate'}
                        >
                          {rule.active ? (
                            <ToggleRight className="h-4 w-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditRule(rule)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(rule._id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Scan Rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The rule will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ScanRulesSettings;
