import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Cloud, Clock, Mail, CheckCircle2 } from 'lucide-react';

const IaCSecurityProduct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-slate-600 to-slate-700 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge variant="outline" className="border-white text-white mb-4">Coming Soon</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Infrastructure as Code Security</h1>
              <p className="text-xl text-slate-100 mb-8">
                Scan Terraform, CloudFormation, Kubernetes manifests, and Helm charts for misconfigurations
                and security risks before deployment.
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
                    IaC Security scanning is on our roadmap. Join the waitlist to get notified when it launches
                    and help us prioritize which IaC tools to support first.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8">Planned Features</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <Cloud className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Multi-Cloud IaC Support</h3>
                  <p className="text-slate-600 mb-3">
                    Comprehensive scanning for all major IaC tools and cloud providers:
                  </p>
                  <ul className="space-y-2 text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Terraform (AWS, Azure, GCP, multi-cloud)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>AWS CloudFormation & CDK</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Azure ARM Templates & Bicep</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>Google Cloud Deployment Manager</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Kubernetes & Helm Security</h3>
                  <p className="text-slate-600">
                    Scan Kubernetes manifests, Helm charts, and Kustomize configurations for security best practices,
                    RBAC issues, privilege escalation risks, and network policy gaps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Policy-as-Code Enforcement</h3>
                  <p className="text-slate-600">
                    Custom security policies using Open Policy Agent (OPA). Enforce compliance requirements,
                    tag policies, resource limits, and organizational standards.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">CIS Benchmarks & Compliance</h3>
                  <p className="text-slate-600">
                    Automated checking against CIS Benchmarks, PCI-DSS, HIPAA, SOC 2, and other compliance
                    frameworks. Generate compliance reports for audits.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Drift Detection</h3>
                  <p className="text-slate-600">
                    Compare deployed infrastructure state with your IaC definitions. Detect manual changes,
                    configuration drift, and unauthorized modifications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">CI/CD Integration</h3>
                  <p className="text-slate-600">
                    Scan IaC files in pull requests before merge. Block deployments with critical security
                    issues. Integrate with Terraform Cloud, GitHub Actions, GitLab CI, and more.
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
              Be first to know when IaC Security launches. Get early access and help us prioritize features.
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

export default IaCSecurityProduct;
