
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';

interface SecurityScanProgressProps {
  progress: number;
  status: 'scanning' | 'complete' | 'error';
}

const SecurityScanProgress: React.FC<SecurityScanProgressProps> = ({ progress, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'scanning':
        return 'text-indigo-600';
      case 'complete':
        return 'text-teal-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'scanning':
        return <Shield className={`h-12 w-12 ${getStatusColor()} animate-pulse`} />;
      case 'complete':
        return <CheckCircle className={`h-12 w-12 ${getStatusColor()}`} />;
      case 'error':
        return <AlertCircle className={`h-12 w-12 ${getStatusColor()}`} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          {getStatusIcon()}
          <div className="absolute inset-0 bg-indigo-600/10 rounded-full animate-ping" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800">
          {status === 'scanning' ? 'Scanning in Progress' : 
           status === 'complete' ? 'Scan Complete' : 'Scan Error'}
        </h2>
        
        <div className="w-full space-y-4">
          <Progress value={progress} className="h-2" />
          <p className="text-center text-slate-600">
            {progress}% Complete
          </p>
        </div>

        <div className="w-full max-w-md p-4 bg-gray-50 rounded-lg">
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-teal-500" />
              <span className="text-slate-700">Initializing security scan</span>
            </li>
            {progress >= 30 && (
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-slate-700">Analyzing code patterns</span>
              </li>
            )}
            {progress >= 60 && (
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-slate-700">Checking for vulnerabilities</span>
              </li>
            )}
            {progress >= 90 && (
              <li className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-slate-700">Generating security report</span>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecurityScanProgress;
