import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Container, Clock, Mail, CheckCircle2 } from 'lucide-react';

const ContainerSecurityProduct = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="bg-gradient-to-br from-slate-600 to-slate-700 py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge variant="outline" className="border-white text-white mb-4">Coming Soon</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Container Security</h1>
              <p className="text-xl text-slate-100 mb-8">
                Comprehensive Docker and OCI container security scanning. Detect vulnerabilities,
                malware, secrets, and misconfigurations in your container images.
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
                    Container Security is currently under development as part of our comprehensive security platform.
                    Join the waitlist to get early access and help shape the product.
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-8">Planned Features</h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <Container className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Image Vulnerability Scanning</h3>
                  <p className="text-slate-600">
                    Scan base images and all layers for known CVEs from major vulnerability databases.
                    Support for Docker Hub, Amazon ECR, Google GCR, Azure ACR, and private registries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Dockerfile Best Practices</h3>
                  <p className="text-slate-600">
                    Analyze Dockerfiles for security best practices: non-root users, minimal base images,
                    multi-stage builds, and proper secret handling.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Secrets Detection</h3>
                  <p className="text-slate-600">
                    Detect hardcoded secrets, API keys, passwords, and credentials embedded in container images.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Registry Integration</h3>
                  <p className="text-slate-600">
                    Automatic scanning of images pushed to registries. CI/CD pipeline integration to block
                    vulnerable images from deployment.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-6 bg-white rounded-lg shadow-sm border">
                <CheckCircle2 className="h-6 w-6 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold mb-2">Runtime Protection</h3>
                  <p className="text-slate-600">
                    Monitor running containers for suspicious behavior, privilege escalation attempts,
                    and unauthorized network connections.
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
              Be among the first to access Container Security when it launches. 
              We'll notify you and offer exclusive early access pricing.
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

export default ContainerSecurityProduct;
