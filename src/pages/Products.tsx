import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Container, Cloud, Boxes, Plug2, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const Products = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-indigo-600 to-indigo-700 py-20">
          <div className="container mx-auto px-6 text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Complete Application Security</h1>
            <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
              From code to cloud, secure your entire development lifecycle with AI-powered scanning,
              intelligent fixes, and continuous monitoring.
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* SAST - Available */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-green-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-green-100 p-4 rounded-lg">
                  <Code className="h-8 w-8 text-green-600" />
                </div>
                <Badge className="bg-green-500 text-white">Available Now</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">SAST Code Security</h2>
              <p className="text-slate-600 mb-6">
                Static Application Security Testing for 14+ programming languages. Find vulnerabilities before they reach production.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>JavaScript, Python, Java, PHP, C#, Go, Ruby, TypeScript</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>OWASP Top 10, CWE, SANS 25 vulnerability detection</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>AI-powered code fixes with explanations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>Custom security rules for your frameworks</span>
                </li>
              </ul>
              <Link to="/products/code-security">
                <Button className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

            {/* SCA - Q2 2026 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-amber-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-amber-100 p-4 rounded-lg">
                  <Boxes className="h-8 w-8 text-amber-600" />
                </div>
                <Badge className="bg-amber-500 text-white">Q2 2026</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">SCA Dependency Scanner</h2>
              <p className="text-slate-600 mb-6">
                Software Composition Analysis for all your dependencies. 80% of vulnerabilities are in third-party code.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>NPM, pip, Maven, Gradle, Composer, Go modules</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>CVE database with real-time updates</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>License compliance checking</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span>Dependency tree visualization</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full" disabled>Coming Q2 2026</Button>
            </div>

            {/* Container Security - Roadmap */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <Container className="h-8 w-8 text-slate-600" />
                </div>
                <Badge variant="outline">Roadmap</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">Container Security</h2>
              <p className="text-slate-600 mb-6">
                Scan Docker images and OCI containers for vulnerabilities, malware, and misconfigurations.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Docker Hub, ECR, GCR registry integration</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Base image vulnerability scanning</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Dockerfile security best practices</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Secrets and credential detection</span>
                </li>
              </ul>
              <Link to="/products/container-security">
                <Button variant="outline" className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

            {/* IaC Security - Roadmap */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <Cloud className="h-8 w-8 text-slate-600" />
                </div>
                <Badge variant="outline">Roadmap</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">IaC Security</h2>
              <p className="text-slate-600 mb-6">
                Infrastructure as Code scanning for Terraform, CloudFormation, Kubernetes, and more.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Terraform, CloudFormation, ARM templates</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Kubernetes manifests & Helm charts</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Cloud misconfigurations (AWS, Azure, GCP)</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Policy-as-code enforcement (OPA)</span>
                </li>
              </ul>
              <Link to="/products/iac-security">
                <Button variant="outline" className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

            {/* Cloud Security - Roadmap */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <Cloud className="h-8 w-8 text-slate-600" />
                </div>
                <Badge variant="outline">Roadmap</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">Cloud Security</h2>
              <p className="text-slate-600 mb-6">
                Runtime cloud security posture management for AWS, Azure, and Google Cloud Platform.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>AWS, Azure, GCP security scanning</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>CIS Benchmarks compliance</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Identity & access management (IAM) audits</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Continuous compliance monitoring</span>
                </li>
              </ul>
              <Link to="/products/cloud-security">
                <Button variant="outline" className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>

            {/* IDE Extensions - Roadmap */}
            <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-slate-200">
              <div className="flex items-start justify-between mb-6">
                <div className="bg-slate-100 p-4 rounded-lg">
                  <Plug2 className="h-8 w-8 text-slate-600" />
                </div>
                <Badge variant="outline">Roadmap</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-3">IDE Extensions</h2>
              <p className="text-slate-600 mb-6">
                Real-time security feedback directly in your editor. Fix vulnerabilities as you code.
              </p>
              <ul className="space-y-3 mb-6 text-slate-600">
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>VS Code, IntelliJ IDEA, PyCharm extensions</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Real-time vulnerability highlighting</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>One-click fixes and explanations</span>
                </li>
                <li className="flex items-start">
                  <Clock className="h-5 w-5 mr-2 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>Offline scanning mode</span>
                </li>
              </ul>
              <Link to="/developers">
                <Button variant="outline" className="w-full">Learn More <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Start with SAST Code Security Today</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Our SAST scanner is ready now. Get 50 free scans per month on the Free tier.
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

export default Products;
