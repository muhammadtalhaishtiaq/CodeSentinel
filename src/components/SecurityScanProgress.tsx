import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Shield, CheckCircle, AlertCircle, Clock, FileText, AlertTriangle } from 'lucide-react';

interface SecurityScanProgressProps {
  progress: number;
  status: 'in-progress' | 'completed' | 'failed';
  currentFile?: string;
  totalFiles?: number;
  scannedFiles?: number;
  vulnerabilitiesFound?: number;
  estimatedTimeRemaining?: string;
}

const SecurityScanProgress: React.FC<SecurityScanProgressProps> = ({ 
  progress, 
  status,
  currentFile,
  totalFiles,
  scannedFiles,
  vulnerabilitiesFound,
  estimatedTimeRemaining
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'in-progress':
        return 'text-indigo-600';
      case 'completed':
        return 'text-teal-500';
      case 'failed':
        return 'text-red-500';
      default:
        return 'text-slate-400';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'in-progress':
        return <Shield className={`h-12 w-12 ${getStatusColor()} animate-pulse`} />;
      case 'completed':
        return <CheckCircle className={`h-12 w-12 ${getStatusColor()}`} />;
      case 'failed':
        return <AlertCircle className={`h-12 w-12 ${getStatusColor()}`} />;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        <div className="relative">
          {getStatusIcon()}
          <div className="absolute inset-0 bg-indigo-600/10 rounded-full animate-ping" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800">
          {status === 'in-progress' ? 'Scanning in Progress' : 
           status === 'completed' ? 'Scan Complete' : 'Scan Failed'}
        </h2>
        
        <div className="w-full space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-slate-600">
            <span>{progress}% Complete</span>
            {estimatedTimeRemaining && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {estimatedTimeRemaining} remaining
              </span>
            )}
          </div>
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-slate-500" />
              <span className="font-medium">Files Processed</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {scannedFiles || 0} / {totalFiles || 0}
            </div>
            {currentFile && (
              <div className="text-sm text-slate-500 mt-1 truncate">
                Current: {currentFile}
              </div>
            )}
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span className="font-medium">Vulnerabilities Found</span>
            </div>
            <div className="text-2xl font-bold text-red-500">
              {vulnerabilitiesFound || 0}
            </div>
          </div>
        </div> */}

        <div className="space-y-3">
          <ul className="space-y-3">
            <li className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-teal-500" />
              <span className="text-slate-700">Initializing security scan</span>
            </li>
            {/* //we need to show as wellthat Fetching Code from Branch/PR(Pull Request) */}
            {progress >= 10 && (
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-teal-500" />
                <span className="text-slate-700">Fetching Code from Branch/PR(Pull Request)</span>
              </li>
            )}
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
