import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Terminal, Book, Plug2, Github, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const Developers = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Built by Developers, for Developers</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Powerful APIs, comprehensive SDKs, and extensive documentation to integrate security
              scanning into your development workflow.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Get API Key <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Integrate CodeSentinel into your workflow with our simple REST API
              </p>
            </div>

            <div className="bg-slate-900 rounded-xl p-8 max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-4 text-slate-400 text-sm">Quick Start Example</span>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto"><code>{`# Scan a GitHub repository
curl -X POST https://api.codesentinel.io/v1/scans \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "repository_url": "https://github.com/user/repo",
    "branch": "main"
  }'

# Response
{
  "scan_id": "scan_abc123",
  "status": "processing",
  "estimated_time": "5s"
}`}</code></pre>
            </div>
          </div>
        </section>

        {/* Developer Resources */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Developer Resources</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Book className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">API Documentation</h3>
                <p className="text-slate-600 mb-4">
                  Complete REST API reference with examples in multiple languages
                </p>
                <Badge className="bg-green-500 text-white mb-2">Available</Badge>
                <br />
                <Link to="/docs">
                  <Button variant="link" className="p-0">View Docs →</Button>
                </Link>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                  <Code className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">SDKs & Libraries</h3>
                <p className="text-slate-600 mb-4">
                  Official SDKs for Python, Node.js, Go, Ruby, and more
                </p>
                <Badge variant="outline">Coming Q2</Badge>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                  <Github className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">GitHub Actions</h3>
                <p className="text-slate-600 mb-4">
                  Official GitHub Action for CI/CD pipeline integration
                </p>
                <Badge variant="outline">Coming Q2</Badge>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-amber-100 p-3 rounded-lg w-fit mb-4">
                  <Plug2 className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">IDE Extensions</h3>
                <p className="text-slate-600 mb-4">
                  VS Code and IntelliJ plugins for real-time security feedback
                </p>
                <Badge variant="outline">Q4 2026</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Examples */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Integrate Anywhere</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Works with your existing tools and workflows
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                <h3 className="font-bold mb-2">GitHub</h3>
                <p className="text-sm text-slate-600">One-click integration, manual triggers, PR scanning (Q2)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">GitLab</h3>
                <p className="text-sm text-slate-600">CI/CD integration via API (Q3 2026)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Bitbucket</h3>
                <p className="text-sm text-slate-600">API integration support (Q3 2026)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Jenkins</h3>
                <p className="text-sm text-slate-600">Plugin for CI/CD pipelines (Q3 2026)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">CircleCI</h3>
                <p className="text-sm text-slate-600">Orb for easy integration (Q3 2026)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                <h3 className="font-bold mb-2">Slack/Teams</h3>
                <p className="text-sm text-slate-600">Notifications and alerts (Q2 2026)</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <Terminal className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Start Building Today</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Get your API key and start scanning repositories in minutes
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Get API Access <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Developers;
