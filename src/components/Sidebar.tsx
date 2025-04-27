import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Plus, BarChart2, Settings, Key, Shield, Code, Users, Building, FileCode, BookOpen } from 'lucide-react';

const sidebarItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: 'New Project',
    path: '/new-project',
    icon: <Plus className="h-5 w-5" />,
  },
  {
    name: 'My Projects',
    path: '/projects',
    icon: <BarChart2 className="h-5 w-5" />,
  },
  {
    name: 'Security Scans',
    path: '/security-scans',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    name: 'Code Analysis',
    path: '/code-analysis',
    icon: <Code className="h-5 w-5" />,
  },
  {
    name: 'Team Members',
    path: '/team',
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: 'Organizations',
    path: '/organizations',
    icon: <Building className="h-5 w-5" />,
  },
  {
    name: 'API & Integrations',
    path: '/api-integrations',
    icon: <Key className="h-5 w-5" />,
  },
  {
    name: 'Documentation',
    path: '/docs',
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  
  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 h-screen transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-4">
        {collapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-indigo-600">CodeSentinel</span>
          </div>
        )}
      </div>
      
      <nav className="mt-8">
        <ul className="space-y-2 px-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-slate-600 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors",
                  location.pathname === item.path && "bg-indigo-50 text-indigo-600 font-medium"
                )}
              >
                <span className="mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
