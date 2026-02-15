import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Home, Plus, BarChart2, Settings, Key, Shield, Code, Users, Building, FileCode, BookOpen, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  // {
  //   name: 'Security Scans',
  //   path: '/security-scans',
  //   icon: <Shield className="h-5 w-5" />,
  // },
  // {
  //   name: 'Code Analysis',
  //   path: '/code-analysis',
  //   icon: <Code className="h-5 w-5" />,
  // },
  // {
  //   name: 'Team Members',
  //   path: '/team',
  //   icon: <Users className="h-5 w-5" />,
  // },
  // {
  //   name: 'Organizations',
  //   path: '/organizations',
  //   icon: <Building className="h-5 w-5" />,
  // },
  {
    name: 'API & Integrations',
    path: '/api-integrations',
    icon: <Key className="h-5 w-5" />,
  },
  // {
  //   name: 'Documentation',
  //   path: '/docs',
  //   icon: <BookOpen className="h-5 w-5" />,
  // },
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

const Sidebar: React.FC<SidebarProps> = ({ collapsed: externalCollapsed, onToggle }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    // Get initial state from localStorage or default to false
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Persist to localStorage whenever collapsed state changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);

  const handleToggle = () => {
    setCollapsed(!collapsed);
    onToggle?.();
  };

  // Use external collapsed prop if provided, otherwise use internal state
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : collapsed;
  
  return (
    <aside 
      className={cn(
        "bg-white border-r border-gray-200 min-h-screen transition-all duration-300 flex flex-col relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <Link to="/">
            <img src="/images/logo.png" alt="CodeSentinel Logo" className="w-18 h-14" />
          </Link>
        )}
        <button
          onClick={handleToggle}
          className={cn(
            "p-1.5 hover:bg-gray-100 rounded-md transition-colors",
            isCollapsed && "mx-auto"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>
      
      {isCollapsed && (
        <div className="flex items-center justify-center p-2">
          <Link to="/">
            <img src="/images/logo.png" alt="CodeSentinel Logo" className="w-10 h-10" />
          </Link>
        </div>
      )}
      
      <nav className="mt-8 flex-grow">
        <ul className="space-y-2 px-2">
          {sidebarItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 text-slate-600 rounded-md hover:bg-indigo-50 hover:text-indigo-600 transition-colors justify-center",
                  location.pathname === item.path && "bg-indigo-50 text-indigo-600 font-medium",
                  !isCollapsed && "justify-start"
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="mr-3">{item.icon}</span>
                {!isCollapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Logout Button */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className={cn(
            "flex items-center w-full px-4 py-3 text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors justify-center",
            !isCollapsed && "justify-start"
          )}
          title={isCollapsed ? "Logout" : undefined}
        >
          <span className="mr-3"><LogOut className="h-5 w-5" /></span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
