import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Clock, Mail, CheckCircle2 } from 'lucide-react';

const CloudSecurityProduct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-slate-600 to-slate-700 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge variant="outline" className="border-white text-white mb-4">Coming Soon</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Cloud Security Posture Management</h1>
              <p className="text-xl text-slate-100 mb-8">
                Runtime cloud security for AWS, Azure, and Google Cloud Platform. Monitor configurations,
                detect misconfigurations, and maintain compliance across your cloud infrastructure.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-8 mb-12">
              <div className="flex items-start gap-4">
                <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
                <div>
                  <h2 className="text-2xl font-bold mb-3">Development In Progress</h2>
                  <p className="text-slate-700 mb-4">
                    Cloud Security Posture Management (CSPM) is on our roadmap. Join the waitlist to get early
                    access and influence which cloud providers we prioritize.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8">Planned Features</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <Cloud className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Multi-Cloud Security Monitoring</h3>
                  <p className="text-slate-600 mb-3">
                    Unified security view across all major cloud providers:
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Amazon Web Services (AWS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Microsoft Azure</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Google Cloud Platform (GCP)</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Misconfiguration Detection</h3>
                  <p className="text-slate-600">
                    Identify security risks: publicly exposed S3 buckets, overly permissive security groups,
                    unencrypted storage, missing MFA, and IAM policy issues.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">IAM & Access Management</h3>
                  <p className="text-slate-600">
                    Audit identity and access management policies. Detect over-privileged roles, unused
                    credentials, weak password policies, and privilege escalation paths.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Compliance Monitoring</h3>
                  <p className="text-slate-600">
                    Continuous compliance checking: CIS Benchmarks, PCI-DSS, HIPAA, SOC 2, GDPR, and more.
                    Generate compliance reports and track remediation progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Real-Time Alerts</h3>
                  <p className="text-slate-600">
                    Get notified instantly of critical security changes: new public resources, IAM changes,
                    security group modifications, and policy violations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Automated Remediation</h3>
                  <p className="text-slate-600">
                    One-click fixes for common misconfigurations. Automated remediation workflows with approval
                    gates for critical changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 py-16">
          <div className="container mx-auto px-6 text-center text-white">
            <Mail className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Join the Waitlist</h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Be among the first to secure your cloud infrastructure with CodeSentinel CSPM.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                Sign Up for Updates
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CloudSecurityProduct;
