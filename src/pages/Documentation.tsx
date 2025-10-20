
import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarHeader,
  SidebarProvider 
} from '@/components/ui/sidebar';

const Documentation = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader>
            <h2 className="text-lg font-semibold px-4">Documentation</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              {/* Add documentation navigation here */}
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <main className="flex-grow p-8">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Documentation</h1>
            {/* Add documentation content here */}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Documentation;
