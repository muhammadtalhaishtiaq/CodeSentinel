import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Code, Lock, Github, Zap, DollarSign, Container, Cloud, Boxes, Plug2, CheckCircle2, Clock, Users, Shield } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeatureCard from '@/components/FeatureCard';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="w-full lg:w-1/2 text-center lg:text-left">
                <div className="mb-6">
                  <Badge className="bg-green-500 text-white mb-4 text-sm px-4 py-1">
                    Lightning Fast • Enterprise-Grade • Affordable
                  </Badge>
                </div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
                  AI-Native Security<br />for Modern Teams
                </h2>
                <p className="text-xl text-indigo-100 mb-8">
                  CodeSentinel delivers enterprise-grade security scanning at a fraction of the cost.
                  From code to containers to cloud, protect your entire stack with AI-powered intelligence.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-white text-white bg-indigo-500/20 hover:bg-indigo-500">
                      View Pricing
                    </Button>
                  </Link>
                </div>
                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-indigo-100">
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    <span>5-second scans</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    <span>From $5/month</span>
                  </div>
                  <div className="flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    <span>14+ languages</span>
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end animate-scale-in">
                <img src="/images/11.png" alt="CodeSentinel Logo" className="h-100" /> 
              </div>
            </div>
          </div>
        </section>

        {/* Product Suite Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Security Platform</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                From code to cloud, secure your entire development lifecycle with our comprehensive suite
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* SAST - Available */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Code className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-500 text-white">Available Now</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">SAST Code Scanner</h3>
                <p className="text-slate-600 mb-4">
                  AI-powered static analysis for 14+ languages. Find SQL injection, XSS, authentication flaws, and more.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> JavaScript, Python, Java, PHP</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> AI-powered fix suggestions</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Custom security rules</li>
                </ul>
                <Link to="/register">
                  <Button className="w-full mt-4">Try Now</Button>
                </Link>
              </div>

              {/* GitHub Integration - Available */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Github className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-500 text-white">Available Now</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">GitHub Integration</h3>
                <p className="text-slate-600 mb-4">
                  Connect your repos for instant security scans. Automatic PR scanning coming soon.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> One-click repository import</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Private repo support</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-amber-500" /> Auto-scan PRs (Q2 2026)</li>
                </ul>
                <Link to="/register">
                  <Button className="w-full mt-4">Connect GitHub</Button>
                </Link>
              </div>

              {/* SCA - Coming Soon */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-amber-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Boxes className="h-6 w-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-500 text-white">Q2 2026</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">SCA Dependency Scanner</h3>
                <p className="text-slate-600 mb-4">
                  Detect vulnerable dependencies in npm, pip, Maven, and more. 80% of vulnerabilities live here.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-amber-500" /> NPM, Python, PHP, Go, Java</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-amber-500" /> License compliance</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-amber-500" /> Dependency tree analysis</li>
                </ul>
                <Button variant="outline" className="w-full mt-4" disabled>Coming Soon</Button>
              </div>

              {/* Container Security - Coming Soon */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Container className="h-6 w-6 text-slate-600" />
                  </div>
                  <Badge variant="outline">Roadmap</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">Container Security</h3>
                <p className="text-slate-600 mb-4">
                  Scan Docker images for vulnerabilities, misconfigurations, and security best practices.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Docker & OCI image scanning</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Registry integration</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Dockerfile best practices</li>
                </ul>
                <Link to="/products/container-security">
                  <Button variant="outline" className="w-full mt-4">Learn More</Button>
                </Link>
              </div>

              {/* IaC Security - Coming Soon */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Cloud className="h-6 w-6 text-slate-600" />
                  </div>
                  <Badge variant="outline">Roadmap</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">IaC Security</h3>
                <p className="text-slate-600 mb-4">
                  Secure your infrastructure as code: Terraform, CloudFormation, Kubernetes, Helm, and more.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Terraform & CloudFormation</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Kubernetes manifests</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Policy-as-code enforcement</li>
                </ul>
                <Link to="/products/iac-security">
                  <Button variant="outline" className="w-full mt-4">Learn More</Button>
                </Link>
              </div>

              {/* IDE Extension - Coming Soon */}
              <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-slate-200 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-slate-100 p-3 rounded-lg">
                    <Plug2 className="h-6 w-6 text-slate-600" />
                  </div>
                  <Badge variant="outline">Roadmap</Badge>
                </div>
                <h3 className="text-xl font-bold mb-2">IDE Extensions</h3>
                <p className="text-slate-600 mb-4">
                  Real-time security feedback as you code. VS Code, IntelliJ, and more.
                </p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> VS Code extension</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> IntelliJ plugin</li>
                  <li className="flex items-center"><Clock className="h-4 w-4 mr-2 text-slate-400" /> Real-time vulnerability detection</li>
                </ul>
                <Link to="/developers">
                  <Button variant="outline" className="w-full mt-4">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose CodeSentinel Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Developers Choose CodeSentinel</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Modern security scanning that doesn't slow you down or drain your budget
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Lightning Fast Scans"
                description="Complete security scans in 5 seconds, not minutes. AI-optimized algorithms analyze code 10x faster than traditional scanners."
              />
              <FeatureCard
                icon={<DollarSign className="h-6 w-6" />}
                title="Radically Affordable"
                description="From $5/month flat rate. 80-95% cheaper than traditional enterprise security tools. No per-developer pricing."
              />
              <FeatureCard
                icon={<Code className="h-6 w-6" />}
                title="AI-Powered Fixes"
                description="Get instant, context-aware code fixes powered by advanced AI. Learn security best practices as you develop."
              />
              <FeatureCard
                icon={<Github className="h-6 w-6" />}
                title="GitHub Native"
                description="One-click integration with GitHub. Import repos instantly, scan on demand, auto-scan PRs (coming Q2)."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6" />}
                title="Private & Secure"
                description="Your code never leaves your control. Encrypted processing, ephemeral storage, or fully on-premises deployment available."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Multi-Language Support"
                description="Scan JavaScript, Python, Java, PHP, C#, Go, Ruby, TypeScript, and more. Custom rules for any framework."
              />
            </div>
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className="bg-indigo-50 py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">The CodeSentinel Advantage</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Enterprise-grade security without enterprise pricing
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-3">5s</div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast Scans</h3>
                <p className="text-slate-600">
                  Complete security analysis in 5 seconds. Traditional tools take 2-10 minutes.
                  Get instant feedback without slowing down your workflow.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-5xl font-bold text-green-600 mb-3">$5</div>
                <h3 className="text-xl font-bold mb-3">Radically Affordable</h3>
                <p className="text-slate-600">
                  Starting at $5/month flat rate. No per-developer pricing.
                  80-95% cheaper than traditional enterprise security tools.
                </p>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="text-5xl font-bold text-purple-600 mb-3">AI</div>
                <h3 className="text-xl font-bold mb-3">AI-Native Intelligence</h3>
                <p className="text-slate-600">
                  Built from the ground up with AI. Instant code fixes, interactive chat,
                  and learning explanations that teach security best practices.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Stats/Social Proof */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Modern Development Teams</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Join developers securing their code with AI-native tooling
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">14+</div>
                <div className="text-slate-600">Languages Supported</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">AI</div>
                <div className="text-slate-600">Fix Guidance</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">GitHub</div>
                <div className="text-slate-600">Integration</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">Encrypted</div>
                <div className="text-slate-600">Credentials</div>
              </div>
            </div>

            <div className="mt-16 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-8 text-white max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-indigo-600" />
                  </div>
                </div>
                <div className="flex-grow text-center md:text-left">
                  <p className="text-lg mb-2">
                    "We replaced our expensive enterprise security tool and cut costs by 85% while getting 10x faster scans. The AI-powered fix suggestions saved us hours of research."
                  </p>
                  <p className="text-indigo-200 text-sm">— Tech Lead at Fast-Growing Startup</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Security & Trust Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security Built In</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Professional authentication and access controls from day one
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Secure Authentication</h3>
                <p className="text-slate-600 text-sm">
                  JWT-based authentication with bcrypt password hashing. Secure password reset tokens. Your account is protected.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <Plug2 className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">API Key Management</h3>
                <p className="text-slate-600 text-sm">
                  Manage GitHub, Bitbucket, and other credentials securely. Integrations are encrypted at rest.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-purple-100 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Project Access Control</h3>
                <p className="text-slate-600 text-sm">
                  Control who has access to each project. Only you and authorized team members can see your code.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-amber-100 p-3 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Encrypted Credentials</h3>
                <p className="text-slate-600 text-sm">
                  All credentials stored encrypted. Integration tokens never exposed in logs or UI.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Code className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Flexible LLM Config</h3>
                <p className="text-slate-600 text-sm">
                  Use our shared API or bring your own keys. OpenAI, Claude, Gemini, Azure, and more supported.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-red-100 p-3 rounded-lg w-fit mb-4">
                  <CheckCircle2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold mb-2">Activity Tracking</h3>
                <p className="text-slate-600 text-sm">
                  See who accessed what and when. Built-in audit capabilities for compliance.
                </p>
              </div>
            </div>

            <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 border border-green-200 max-w-3xl mx-auto">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-2">Your Code Stays Private</h3>
                  <p className="text-slate-700 mb-2">
                    CodeSentinel is built with privacy first. Your source code is analyzed locally and never stored on our servers. Ephemeral processing means we don't keep temporary files.
                  </p>
                  <p className="text-slate-600 text-sm">
                    On-premises deployment available for Enterprise customers who need complete control.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-br from-indigo-600 to-indigo-700">
          <div className="container mx-auto px-6">
            <div className="text-center text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Start Securing Your Code in 2 Minutes
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                No credit card required. Free tier includes 50 scans per month.
                Upgrade anytime to unlock scheduled scans, webhooks, and priority support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <Link to="/register">
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-500">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <p className="text-indigo-200 text-sm">
                Join the growing community of developers choosing CodeSentinel • No vendor lock-in • Cancel anytime
              </p>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
