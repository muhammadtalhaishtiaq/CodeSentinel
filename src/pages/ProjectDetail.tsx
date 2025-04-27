
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { AlertTriangle, CheckCircle, FileCode, Folder, ChevronRight, Send, ShieldAlert, Info } from 'lucide-react';

// Mock project data
const projectData = {
  id: '2',
  name: 'User Authentication Service',
  description: 'OAuth provider and user management',
  lastScanned: '1 day ago',
  status: 'warning',
  issuesCount: 3,
  issues: [
    {
      id: '1',
      severity: 'critical',
      title: 'Insecure password hashing',
      description: 'Using MD5 for password hashing is insecure due to collision vulnerabilities',
      file: 'auth/passwordUtils.js',
      line: 24,
      code: `function hashPassword(password) {
  // INSECURE: MD5 is not suitable for password hashing
  const md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
}`,
      recommendation: `function hashPassword(password) {
  // SECURE: Use bcrypt with appropriate rounds
  return bcrypt.hashSync(password, 12);
}`
    },
    {
      id: '2',
      severity: 'warning',
      title: 'SQL Injection vulnerability',
      description: 'Direct user input in SQL queries can lead to SQL injection attacks',
      file: 'db/userQueries.js',
      line: 45,
      code: `function getUserByUsername(username) {
  // VULNERABLE: Direct string concatenation in queries
  return db.query('SELECT * FROM users WHERE username = "' + username + '"');
}`,
      recommendation: `function getUserByUsername(username) {
  // SECURE: Use parameterized queries
  return db.query('SELECT * FROM users WHERE username = ?', [username]);
}`
    },
    {
      id: '3',
      severity: 'warning',
      title: 'Insufficient session security',
      description: 'Session configuration lacks secure and httpOnly flags',
      file: 'auth/sessionConfig.js',
      line: 12,
      code: `const sessionConfig = {
  secret: 'session-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {}
};`,
      recommendation: `const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 3600000 // 1 hour
  }
};`
    }
  ]
};

// Mock file structure
const fileStructure = [
  {
    name: 'auth',
    type: 'folder',
    children: [
      { name: 'passwordUtils.js', type: 'file', issues: 1 },
      { name: 'sessionConfig.js', type: 'file', issues: 1 },
      { name: 'userAuth.js', type: 'file', issues: 0 }
    ]
  },
  {
    name: 'db',
    type: 'folder',
    children: [
      { name: 'connection.js', type: 'file', issues: 0 },
      { name: 'userQueries.js', type: 'file', issues: 1 }
    ]
  },
  {
    name: 'routes',
    type: 'folder',
    children: [
      { name: 'auth.js', type: 'file', issues: 0 },
      { name: 'users.js', type: 'file', issues: 0 }
    ]
  },
  { name: 'index.js', type: 'file', issues: 0 }
];

// Get badge color based on severity
const getSeverityBadge = (severity: string) => {
  switch (severity) {
    case 'critical':
      return (
        <span className="security-badge-critical flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" /> Critical
        </span>
      );
    case 'warning':
      return (
        <span className="security-badge-warning flex items-center">
          <ShieldAlert className="h-3 w-3 mr-1" /> Warning
        </span>
      );
    default:
      return (
        <span className="security-badge-success flex items-center">
          <Info className="h-3 w-3 mr-1" /> Info
        </span>
      );
  }
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedIssue, setSelectedIssue] = useState(projectData.issues[0]);
  const [chatMessages, setChatMessages] = useState<Array<{text: string, isUser: boolean}>>([]);
  const [chatInput, setChatInput] = useState('');
  
  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    // Add user message
    const userMessage = { text: chatInput, isUser: true };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse = {
        text: `I've analyzed the issue with ${selectedIssue.title}. This is a ${selectedIssue.severity} security concern because it could lead to unauthorized access. The recommended approach is to use more secure methods as shown in the suggested fix.`,
        isUser: false
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold">{projectData.name}</h1>
                <p className="text-slate-600">{projectData.description}</p>
              </div>
              <div className="flex space-x-4 mt-4 lg:mt-0">
                <Button variant="outline">
                  Download Report
                </Button>
                <Button>
                  Rescan Project
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* File Structure Sidebar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-4">Project Files</h3>
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="space-y-2">
                      {fileStructure.map((item, idx) => (
                        <div key={idx}>
                          {item.type === 'folder' ? (
                            <div className="mb-2">
                              <div className="flex items-center py-1">
                                <Folder className="h-4 w-4 mr-2 text-slate-500" />
                                <span className="font-medium">{item.name}</span>
                                <ChevronRight className="h-4 w-4 ml-auto" />
                              </div>
                              <div className="pl-6 border-l border-slate-200 ml-2">
                                {item.children && item.children.map((child, childIdx) => (
                                  <div key={childIdx} className="flex items-center py-1">
                                    <FileCode className="h-4 w-4 mr-2 text-slate-500" />
                                    <span>{child.name}</span>
                                    {child.issues > 0 && (
                                      <span className="ml-auto text-xs px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">
                                        {child.issues}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center py-1">
                              <FileCode className="h-4 w-4 mr-2 text-slate-500" />
                              <span>{item.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
              
              {/* Main Content */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="p-6">
                    <Tabs defaultValue="issues">
                      <TabsList className="mb-6">
                        <TabsTrigger value="issues">
                          Security Issues ({projectData.issues.length})
                        </TabsTrigger>
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="issues" className="space-y-6">
                        {projectData.issues.map((issue) => (
                          <Card 
                            key={issue.id} 
                            className={`hover:bg-slate-50 cursor-pointer transition-colors ${selectedIssue.id === issue.id ? 'ring-2 ring-indigo-500' : ''}`}
                            onClick={() => setSelectedIssue(issue)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center space-x-2 mb-2">
                                    {getSeverityBadge(issue.severity)}
                                    <span className="text-sm text-slate-500">{issue.file}:{issue.line}</span>
                                  </div>
                                  <h3 className="font-semibold">{issue.title}</h3>
                                  <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-400" />
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                      
                      <TabsContent value="summary">
                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-4">
                            <div className="bg-red-50 p-4 rounded-lg text-center">
                              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                              <p className="text-lg font-semibold">1</p>
                              <p className="text-sm text-slate-600">Critical Issues</p>
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg text-center">
                              <ShieldAlert className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                              <p className="text-lg font-semibold">2</p>
                              <p className="text-sm text-slate-600">Warnings</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg text-center">
                              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                              <p className="text-lg font-semibold">0</p>
                              <p className="text-sm text-slate-600">Passed Checks</p>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Security Score</h3>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                              <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                            <p className="text-right text-sm">65/100</p>
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-lg mb-2">Summary</h3>
                            <p className="text-slate-600">
                              This project has 3 security issues that need attention. The most critical issue is related
                              to insecure password hashing. Addressing these vulnerabilities will significantly improve
                              your security posture.
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
                
                {/* Issue Detail Section */}
                {selectedIssue && (
                  <Card className="mt-6">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold mb-4">{selectedIssue.title}</h3>
                      <p className="mb-6">{selectedIssue.description}</p>
                      
                      <div className="mb-6">
                        <h4 className="font-medium text-slate-700 mb-2">Vulnerable Code</h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                          <code>{selectedIssue.code}</code>
                        </pre>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Recommended Fix</h4>
                        <pre className="bg-gray-900 text-green-100 p-4 rounded text-sm overflow-x-auto">
                          <code>{selectedIssue.recommendation}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* AI Chat Section */}
                <Card className="mt-6">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Ask AI Assistant</h3>
                    
                    <ScrollArea className="h-64 mb-4 border rounded-md p-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-slate-500 my-8">
                          <p>Ask questions about this security issue to get detailed explanations</p>
                          <div className="flex flex-wrap justify-center gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => setChatInput("Why is this a security issue?")}>
                              Why is this a security issue?
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setChatInput("How can I fix this?")}>
                              How can I fix this?
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setChatInput("Explain the recommended solution")}>
                              Explain the solution
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatMessages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-lg px-4 py-2 ${
                                  msg.isUser
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {msg.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                    
                    <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
                      <Input
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        placeholder="Ask a question about this security issue..."
                        className="flex-1"
                      />
                      <Button type="submit" size="icon">
                        <Send className="h-5 w-5" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProjectDetail;
