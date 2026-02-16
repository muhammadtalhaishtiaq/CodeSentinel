import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Users, Shield, Headphones, CheckCircle2, Clock, Mail, ArrowRight, Building2, Key, Brain, Activity } from 'lucide-react';

const Enterprise = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <Building2 className="h-16 w-16 mx-auto mb-6 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Enterprise Security at Startup Pricing</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
              Get enterprise-grade security features starting at $49/month. No per-developer pricing.
              Scale your security program without breaking the bank.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/pricing">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  View Enterprise Pricing <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white bg-indigo-500/20 hover:bg-indigo-500">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise Features</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Everything your organization needs for comprehensive security
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {/* Available Now */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-500 text-white">Available Now</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-3">Advanced Security Scanning</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>SAST for 14+ languages with custom rules</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited private repository scanning</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>AI-powered vulnerability fixes</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Custom security policy configuration</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-green-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <Badge className="bg-green-500 text-white">Available Now</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-3">Team Management</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Project-level access controls</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>API key management</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Activity logs and audit trails</span>
                  </li>
                </ul>
              </div>

              {/* Coming Soon */}
              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-amber-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Lock className="h-6 w-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-500 text-white">Q2 2026</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-3">SSO & Advanced Auth</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>SAML 2.0 single sign-on (Okta, Azure AD)</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>SCIM user provisioning</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Role-based access control (RBAC)</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Multi-factor authentication (MFA)</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-amber-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-amber-100 p-3 rounded-lg">
                    <Headphones className="h-6 w-6 text-amber-600" />
                  </div>
                  <Badge className="bg-amber-500 text-white">Q2 2026</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-3">Priority Support & SLA</h3>
                <ul className="space-y-3 text-slate-600">
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>99.9% uptime SLA</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Priority support (4-hour response)</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Dedicated customer success manager</span>
                  </li>
                  <li className="flex items-start">
                    <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>Custom onboarding and training</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why CodeSentinel for Enterprise</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">85%</div>
                <h3 className="font-bold mb-2">Cost Savings</h3>
                <p className="text-slate-600 text-sm">vs traditional enterprise per-dev pricing</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">10x</div>
                <h3 className="font-bold mb-2">Faster Scans</h3>
                <p className="text-slate-600 text-sm">5-second scans vs 2-10 minute traditional tools</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">$49</div>
                <h3 className="font-bold mb-2">Flat Monthly Fee</h3>
                <p className="text-slate-600 text-sm">No per-developer pricing gouging</p>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise-Grade Security Built In */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security Built In</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Professional authentication, encryption, and access controls from day one
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
              {/* JWT Authentication */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Lock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">JWT Authentication</h3>
                <p className="text-slate-600">
                  Secure token-based authentication with bcrypt password hashing. Industry-standard security for enterprise users.
                </p>
              </div>

              {/* API Key Management */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-emerald-100 p-3 rounded-lg w-fit mb-4">
                  <Key className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">API Key Management</h3>
                <p className="text-slate-600">
                  Encrypted storage for GitHub, Bitbucket, and other integration credentials. Keys never exposed in logs.
                </p>
              </div>

              {/* Project-Level Access Control */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-blue-100 p-3 rounded-lg w-fit mb-4">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Project Access Control</h3>
                <p className="text-slate-600">
                  Granular user permissions at the project level. Complete visibility into who accesses what and when.
                </p>
              </div>

              {/* Encrypted Credential Storage */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-rose-100 p-3 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-rose-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Encrypted Credentials</h3>
                <p className="text-slate-600">
                  All sensitive data encrypted at rest. Credentials protected with industry-standard encryption algorithms.
                </p>
              </div>

              {/* Flexible LLM Configuration */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-violet-100 p-3 rounded-lg w-fit mb-4">
                  <Brain className="h-6 w-6 text-violet-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Flexible LLM Configuration</h3>
                <p className="text-slate-600">
                  Use your own API keys for OpenAI, Claude, Gemini, or Azure. Full control over AI service providers.
                </p>
              </div>

              {/* Activity Tracking & Audit Logs */}
              <div className="bg-white p-8 rounded-xl shadow-sm border hover:shadow-md transition">
                <div className="bg-amber-100 p-3 rounded-lg w-fit mb-4">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Activity Tracking</h3>
                <p className="text-slate-600">
                  Complete audit trail of user actions. Built-in logging for compliance and security investigations.
                </p>
              </div>
            </div>

            {/* Privacy Assurance */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <CheckCircle2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Your Code Stays Private</h3>
                  <p className="text-blue-800">
                    Ephemeral processing means code is analyzed and immediately deleted. On-premises deployment available for maximum control and compliance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Security & Compliance</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Built to meet enterprise security and compliance requirements
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {['SOC 2 Type II', 'GDPR Compliant', 'ISO 27001', 'HIPAA Ready'].map((cert) => (
                <div key={cert} className="bg-white p-6 rounded-xl shadow-sm border text-center">
                  <Shield className="h-8 w-8 text-indigo-600 mx-auto mb-3" />
                  <h3 className="font-bold">{cert}</h3>
                  <Badge variant="outline" className="mt-2">In Progress</Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Enterprise?</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Start with a 14-day free trial. Upgrade to Enterprise anytime.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white bg-indigo-500/20 hover:bg-indigo-500">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Enterprise;
