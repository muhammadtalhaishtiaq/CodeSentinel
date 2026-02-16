import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Brain, GitBranch, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const Platform = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">The CodeSentinel Platform</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              AI-native security platform built for modern development teams. Fast, affordable,
              and intelligent protection from code to cloud.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white bg-indigo-500/20 hover:bg-indigo-500">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Key Platform Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Developer Velocity</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Security that accelerates your workflow instead of slowing it down
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 p-4 rounded-xl w-fit mx-auto mb-4">
                  <Zap className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">5-Second Scans</h3>
                <p className="text-slate-600">
                  Complete security analysis in seconds, not minutes. Get feedback instantly.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 p-4 rounded-xl w-fit mx-auto mb-4">
                  <Brain className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">AI-Powered Fixes</h3>
                <p className="text-slate-600">
                  Context-aware code fixes with explanations. Learn security as you build.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 p-4 rounded-xl w-fit mx-auto mb-4">
                  <GitBranch className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">GitHub Native</h3>
                <p className="text-slate-600">
                  One-click integration. Import repos instantly. Auto-scan PRs (coming Q2).
                </p>
              </div>

              <div className="text-center">
                <div className="bg-amber-100 p-4 rounded-xl w-fit mx-auto mb-4">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Layer Security</h3>
                <p className="text-slate-600">
                  SAST, SCA, containers, IaC—comprehensive protection across your stack.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Available Now */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <Badge className="bg-green-500 text-white mb-4">Available Now</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What's Live Today</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Start securing your code immediately with these production-ready features
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-3" />
                <h3 className="text-xl font-bold mb-2">SAST Code Scanner</h3>
                <p className="text-slate-600">
                  14+ languages, OWASP Top 10, CWE/SANS coverage, AI-powered fixes
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-3" />
                <h3 className="text-xl font-bold mb-2">GitHub Integration</h3>
                <p className="text-slate-600">
                  One-click repo import, private repo support, manual scan triggers
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-3" />
                <h3 className="text-xl font-bold mb-2">Interactive AI Chat</h3>
                <p className="text-slate-600">
                  Ask security questions, get explanations, learn best practices
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-green-500 mb-3" />
                <h3 className="text-xl font-bold mb-2">Custom Security Rules</h3>
                <p className="text-slate-600">
                  Framework-specific rules, customize severity, configure LLM models
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Product Roadmap */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Product Roadmap</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Our commitment to building a comprehensive security platform
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {/* Q1 2026 */}
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-green-500 text-white">Shipped Q1 2026</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">SAST Code Security ✓</h3>
                    <p className="text-slate-700 mb-3">
                      Production-ready static analysis for 14+ languages with AI-powered fixes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">OWASP Top 10</Badge>
                      <Badge variant="outline">Multi-language</Badge>
                      <Badge variant="outline">AI Fixes</Badge>
                      <Badge variant="outline">GitHub Integration</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q2 2026 */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-amber-500 text-white">Shipping Q2 2026</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">SCA Dependency Scanner</h3>
                    <p className="text-slate-700 mb-3">
                      Scan dependencies in NPM, pip, Maven, Composer, Go modules for known vulnerabilities
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">NPM</Badge>
                      <Badge variant="outline">Python</Badge>
                      <Badge variant="outline">Maven/Gradle</Badge>
                      <Badge variant="outline">PHP</Badge>
                      <Badge variant="outline">Go</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q2 2026 */}
              <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Badge className="bg-amber-500 text-white">Shipping Q2 2026</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">CI/CD Automation</h3>
                    <p className="text-slate-700 mb-3">
                      Scheduled scans, GitHub PR webhooks, automated comment posting
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Scheduled Scans</Badge>
                      <Badge variant="outline">PR Webhooks</Badge>
                      <Badge variant="outline">Inline Comments</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q3 2026 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline">Q3 2026 Roadmap</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Container & IaC Security</h3>
                    <p className="text-slate-700 mb-3">
                      Docker image scanning, Terraform/K8s/CloudFormation analysis
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Docker</Badge>
                      <Badge variant="outline">Terraform</Badge>
                      <Badge variant="outline">Kubernetes</Badge>
                      <Badge variant="outline">CloudFormation</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q4 2026 */}
              <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <Badge variant="outline">Q4 2026 Roadmap</Badge>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">IDE Extensions & CSPM</h3>
                    <p className="text-slate-700 mb-3">
                      Real-time IDE scanning, cloud security posture management for AWS/Azure/GCP
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">VS Code</Badge>
                      <Badge variant="outline">IntelliJ</Badge>
                      <Badge variant="outline">AWS CSPM</Badge>
                      <Badge variant="outline">Azure CSPM</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start with What's Available Today</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              SAST code security is production-ready. Get 50 free scans per month.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Platform;
