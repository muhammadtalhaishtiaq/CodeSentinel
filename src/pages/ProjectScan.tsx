import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SecurityScanProgress from '@/components/SecurityScanProgress';
import { toast } from 'sonner';
import { 
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle 
} from '@/components/ui/resizable';
import { SidebarProvider } from '@/components/ui/sidebar';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

const ProjectScan = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'scanning' | 'complete' | 'error'>('scanning');
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('complete');
          toast.success('Security scan completed successfully!');
          setTimeout(() => {
            navigate('/projects/1');
          }, 2000);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <Sidebar />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={80}>
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-6">
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
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </SidebarProvider>
  );
};

export default ProjectScan;
