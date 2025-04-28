import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import SecurityScanProgress from '@/components/SecurityScanProgress';
import { toast } from 'sonner';
import { authenticatedRequest } from '@/utils/authUtils';
import Sidebar from '@/components/Sidebar';

interface ScanLocation {
  state: {
    projectId: string;
    scanId: string;
  }
}

const ProjectScan = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'complete' | 'error'>('scanning');
  const navigate = useNavigate();
  const { scanId } = useParams();
  const location = useLocation() as ScanLocation;
  
  // Get projectId and scanId from location state or params
  const projectId = location.state?.projectId;
  const currentScanId = scanId || location.state?.scanId;

  useEffect(() => {
    if (!currentScanId) {
      toast.error('Scan ID not found');
      navigate('/projects');
      return;
    }

    let pollingInterval: NodeJS.Timeout;
    let progressCounter = 0;
    
    // Function to fetch scan status
    const fetchScanStatus = async () => {
      try {
        const response = await authenticatedRequest(`/api/scans/${currentScanId}`);
        
        if (response.success) {
          const scanData = response.data;
          
          // Update status based on scan status
          if (scanData.status === 'completed') {
            setStatus('complete');
            setProgress(100);
            clearInterval(pollingInterval);
            
            toast.success('Security scan completed successfully!');
            
            // Navigate to project details after 2 seconds
            setTimeout(() => {
              navigate(`/projects/${projectId || scanData.projectId}`);
            }, 2000);
          } else if (scanData.status === 'failed') {
            setStatus('error');
            clearInterval(pollingInterval);
            
            toast.error('Security scan failed');
          } else if (scanData.status === 'in-progress') {
            // Calculate progress - we'll use a combination of real progress and simulated progress
            // This gives users feedback while the scan is running
            
            // Move progress forward but never reach 100% until complete
            if (progressCounter < 90) {
              // Gradually slow down progress as it gets higher
              const increment = progressCounter < 30 ? 5 : 
                               progressCounter < 60 ? 3 : 
                               progressCounter < 80 ? 2 : 1;
                               
              progressCounter += increment;
              setProgress(progressCounter);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching scan status:', error);
        
        // If we can't fetch status, keep the UI progressing to prevent it from appearing stuck
        if (progressCounter < 90) {
          progressCounter += 1;
          setProgress(progressCounter);
        }
      }
    };
    
    // Initial check
    fetchScanStatus();
    
    // Poll for status every 3 seconds
    pollingInterval = setInterval(fetchScanStatus, 3000);
    
    // Clean up on unmount
    return () => {
      clearInterval(pollingInterval);
    };
  }, [currentScanId, navigate, projectId]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8">
        <div className="container mx-auto">
          <SecurityScanProgress progress={progress} status={status} />
          <div className="mt-8 text-center">
            <img 
              src="/images/logo.png" 
              alt="CodeSentinel Security Analysis" 
              className="mx-auto rounded-lg shadow-lg w-32 h-32 opacity-85"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectScan;
