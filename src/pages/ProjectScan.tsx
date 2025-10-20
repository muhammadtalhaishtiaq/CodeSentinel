import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import SecurityScanProgress from '@/components/SecurityScanProgress';
import Sidebar from '@/components/Sidebar';

interface ScanStatus {
  status: 'in-progress' | 'completed' | 'failed';
  progress: number;
  currentFile?: string;
  totalFiles?: number;
  scannedFiles?: number;
  vulnerabilitiesFound?: number;
  estimatedTimeRemaining?: string;
  message?: string;
}

const ProjectScan: React.FC = () => {
  const { id: projectId, scanId } = useParams<{ id: string; scanId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [scanStatus, setScanStatus] = useState<ScanStatus>({
    status: 'in-progress',
    progress: 0,
    message: 'Initializing scan...'
  });
  const [redirecting, setRedirecting] = useState(false);

  // Function to get random increment between 1-5
  const getRandomIncrement = () => Math.floor(Math.random() * 4) + 1;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Error",
        description: "Authentication token is missing",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/scans/${scanId}/status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (data.success) {
          // Update actual status from API
          setScanStatus(prev => ({
            ...prev,
            message: data.data.message,
            status: data.data.status
          }));

          // Handle progress based on status
          if (data.data.status === 'in-progress') {
            // Increment dummy progress while in progress
            setScanStatus(prev => ({
              ...prev,
              progress: Math.min(prev.progress + getRandomIncrement(), 95) // Cap at 95% until completion
            }));
          } else if (data.data.status === 'completed') {
            // Set to 100% on completion
            setScanStatus(prev => ({
              ...prev,
              progress: 100,
              message: 'Scan completed successfully!'
            }));
            setRedirecting(true);
            
            // Wait 2 seconds before redirecting
            setTimeout(() => {
              navigate(`/projects/${projectId}`);
            }, 2000);
          } else if (data.data.status === 'failed') {
            // On failure, show error and redirect to projects page
            toast({
              title: "Scan Failed",
              description: "The scan failed to complete. Please try again.",
              variant: "destructive"
            });
            setTimeout(() => {
              navigate('/projects');
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error polling scan status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [scanId, navigate, toast, projectId]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="container mx-auto">
          <SecurityScanProgress {...scanStatus} />
          <div className="mt-8 space-y-4">
            <div className="text-center">
              {redirecting ? (
                <p className="text-lg text-gray-600 dark:text-gray-400 animate-pulse">
                  Redirecting to project detail page...
                </p>
              ) : (
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {scanStatus.message}
                </p>
              )}
            </div>
            {scanStatus.totalFiles && scanStatus.totalFiles > 0 && (
              <p className="text-center text-gray-600 dark:text-gray-400">
                Files processed: {scanStatus.scannedFiles} of {scanStatus.totalFiles}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectScan;
