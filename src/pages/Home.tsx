import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, Code, Lock, Github } from 'lucide-react';
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
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
                  Automated AI-Powered<br />Code Security Audits
                </h1>
                <p className="text-xl text-indigo-100 mb-8">
                  CodeSentinel converses with you about security issues, teaches best practices,
                  and integrates smoothly into your workflow while keeping your code private.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/register">
                    <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  {/* <Link to="/docs">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-indigo-500">
                      View Documentation
                    </Button>
                  </Link> */}
                </div>
              </div>
              <div className="w-full lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end animate-scale-in">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                    <code>{`// Potential security vulnerability detected
function validateInput(userInput) {
  return eval(userInput); // Unsafe usage of eval()
}

// Recommended fix:
function validateInputSafely(userInput) {
  // Use safer alternatives like JSON.parse 
  // for specific use cases
  return JSON.parse(userInput);
}`}</code>
                  </pre>
                  <div className="mt-4 flex items-center p-2 bg-indigo-50 rounded text-indigo-700 text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    <span>Security issue identified and fixed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-24" id="features">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CodeSentinel?</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Our platform combines AI intelligence with security expertise to identify vulnerabilities
                before they become problems.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Code className="h-6 w-6" />}
                title="Interactive AI Auditor"
                description="Have real conversations with our AI about your code's security issues, with detailed explanations and teaching moments."
              />
              <FeatureCard
                icon={<Github className="h-6 w-6" />}
                title="Seamless GitHub Integration"
                description="Connect repositories with a few clicks for automatic scans of pull requests and commits, with inline security comments."
              />
              <FeatureCard
                icon={<Lock className="h-6 w-6" />}
                title="Enterprise-Grade Security"
                description="Your code remains private with our encrypted, ephemeral processing and flexible hosting options including on-premises."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Multi-Language Support"
                description="Scan and analyze code in multiple languages including JavaScript, Python, Java, C#, and more."
              />
              <FeatureCard
                icon={<Code className="h-6 w-6" />}
                title="Ready-Made Code Fixes"
                description="Get suggested code fixes that you can apply directly to your codebase with a single click."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Continuous Protection"
                description="Schedule regular scans to keep your codebase secure as it evolves and grows over time."
              />
            </div>
          </div>
        </section>
        
        {/* Testimonial/Social Proof */}
        <section className="bg-gray-50 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Developers Worldwide</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Join thousands of developers and companies using CodeSentinel to protect their applications.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-60">
              <div className="h-12 flex items-center">
                <span className="text-2xl font-bold">TechCorp</span>
              </div>
              <div className="h-12 flex items-center">
                <span className="text-2xl font-bold">DevSecOps</span>
              </div>
              <div className="h-12 flex items-center">
                <span className="text-2xl font-bold">CodeSafe</span>
              </div>
              <div className="h-12 flex items-center">
                <span className="text-2xl font-bold">SecureDev</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="bg-indigo-600 rounded-2xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Start securing your code today
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                Get started with CodeSentinel for free. No credit card required.
                Start scanning your first project in minutes.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
