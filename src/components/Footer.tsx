import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-2">
              <li><Link to="/products/code-security" className="text-slate-500 hover:text-indigo-600">Code Security</Link></li>
              <li><Link to="/products" className="text-slate-500 hover:text-indigo-600">Dependency Scanner</Link></li>
              <li><Link to="/products/container-security" className="text-slate-500 hover:text-indigo-600">Container Security</Link></li>
              <li><Link to="/products/iac-security" className="text-slate-500 hover:text-indigo-600">IaC Security</Link></li>
              <li><Link to="/products/cloud-security" className="text-slate-500 hover:text-indigo-600">Cloud Security</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/platform" className="text-slate-500 hover:text-indigo-600">Platform</Link></li>
              <li><Link to="/pricing" className="text-slate-500 hover:text-indigo-600">Pricing</Link></li>
              <li><Link to="/enterprise" className="text-slate-500 hover:text-indigo-600">Enterprise</Link></li>
              <li><Link to="/partners" className="text-slate-500 hover:text-indigo-600">Partners</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/developers" className="text-slate-500 hover:text-indigo-600">Developers</Link></li>
              <li><Link to="/docs" className="text-slate-500 hover:text-indigo-600">Documentation</Link></li>
              <li><Link to="/blog" className="text-slate-500 hover:text-indigo-600">Blog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/company" className="text-slate-500 hover:text-indigo-600">Company</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/images/logo.png" alt="CodeSentinel Logo" className="w-8 h-8" />
              <span className="text-xl font-bold text-indigo-600">CodeSentinel</span>
            </div>
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} CodeSentinel. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
