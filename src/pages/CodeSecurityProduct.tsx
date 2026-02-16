import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, CheckCircle2, ArrowRight, Shield, Zap, Brain } from 'lucide-react';

const CodeSecurityProduct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-600 to-green-700 py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 text-white">
                <Badge className="bg-green-500 text-white mb-4">Available Now</Badge>
                <h1 className="text-4xl md:text-5xl font-bold mb-6">SAST Code Security</h1>
                <p className="text-xl text-green-100 mb-8">
                  Static Application Security Testing powered by AI. Find and fix vulnerabilities in your source code
                  before they reach production. 14+ languages supported, 5-second scans, instant AI fixes.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/register">
                    <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
                      Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button size="lg" variant="outline" className="border-white text-white bg-green-500/20 hover:bg-green-500">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-1">
                <div className="bg-white p-6 rounded-xl shadow-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="text-sm overflow-x-auto"><code>{`// ⚠️ SQL Injection vulnerability detected
function getUser(userId) {
  const query = "SELECT * FROM users WHERE id = " 
    + userId; // UNSAFE!
  return db.execute(query);
}

// ✅ AI-powered fix suggestion
function getUser(userId) {
  const query = "SELECT * FROM users WHERE id = ?";
  return db.execute(query, [userId]);
}`}</code></pre>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Vulnerability fixed with AI guidance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade SAST Features</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Everything you need to secure your codebase
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">OWASP Top 10 Coverage</h3>
                <p className="text-slate-600">
                  Detects all OWASP Top 10 vulnerabilities: SQL injection, XSS, CSRF, 
                  insecure deserialization, and more.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Lightning Fast Scans</h3>
                <p className="text-slate-600">
                  Complete scans in 5 seconds, not minutes. AI-optimized algorithms analyze 
                  your entire codebase at blazing speed.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="bg-indigo-100 p-3 rounded-lg w-fit mb-4">
                  <Brain className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Fixes</h3>
                <p className="text-slate-600">
                  Get context-aware code fixes with explanations. Learn security best practices 
                  as you develop.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Languages Supported */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">14+ Languages Supported</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Comprehensive security scanning for all major programming languages
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                'JavaScript', 'TypeScript', 'Python', 'Java',
                'PHP', 'C#', 'Go', 'Ruby',
                'Swift', 'Kotlin', 'Rust', 'C/C++',
                'Scala', 'Shell Script'
              ].map((lang) => (
                <div key={lang} className="bg-white p-4 rounded-lg shadow-sm border text-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto mb-2" />
                  <span className="font-medium">{lang}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vulnerability Types */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comprehensive Vulnerability Detection</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                'SQL Injection', 'Cross-Site Scripting (XSS)', 'CSRF Attacks',
                'Insecure Deserialization', 'Authentication Flaws', 'Authorization Issues',
                'Sensitive Data Exposure', 'XXE Injection', 'Security Misconfigurations',
                'Command Injection', 'Path Traversal', 'Broken Access Control',
                'Cryptographic Failures', 'Server-Side Request Forgery', 'Race Conditions'
              ].map((vuln) => (
                <div key={vuln} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="font-medium text-slate-800">{vuln}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-green-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Secure Your Code?</h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Get started with 50 free scans per month. No credit card required.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-green-700 hover:bg-green-50">
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

export default CodeSecurityProduct;
