import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Bell, User, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="CodeSentinel Logo" className="w-18 h-14" />
            {/* <span className="text-xl font-bold text-indigo-600"></span> */}
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px]">
                      <Link to="/products/code-security" className="block p-3 hover:bg-slate-50 rounded-lg">
                        <h3 className="text-sm font-semibold">Code Security</h3>
                        <p className="text-sm text-gray-500">Find and fix vulnerabilities in your code</p>
                      </Link>
                      <Link to="/products/cloud-security" className="block p-3 hover:bg-slate-50 rounded-lg">
                        <h3 className="text-sm font-semibold">Cloud Security</h3>
                        <p className="text-sm text-gray-500">Secure your cloud infrastructure</p>
                      </Link>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/platform" className="text-sm">
                    <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium">
                      Platform
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/developers" className="text-sm">
                    <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium">
                      Developers
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/enterprise" className="text-sm">
                    <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium">
                      Enterprise
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/pricing" className="text-sm">
                    <NavigationMenuLink className="inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium">
                      Pricing
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button> */}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5 mr-2" />
                      <span>{user?.firstName || 'User'}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/api-integrations">API Keys</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign up</Button>
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </nav>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden fixed inset-0 top-[73px] bg-white z-50 overflow-y-auto">
            <nav className="flex flex-col p-4">
              <Link to="/products" className="py-2 text-lg">Products</Link>
              <Link to="/platform" className="py-2 text-lg">Platform</Link>
              <Link to="/developers" className="py-2 text-lg">Developers</Link>
              <Link to="/enterprise" className="py-2 text-lg">Enterprise</Link>
              <Link to="/pricing" className="py-2 text-lg">Pricing</Link>
              <div className="border-t border-gray-200 my-4" />
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="py-2 text-lg">Dashboard</Link>
                  <Link to="/api-integrations" className="py-2 text-lg">API Keys</Link>
                  <Link to="/settings" className="py-2 text-lg">Settings</Link>
                  <Button className="mt-4" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full">Sign up</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
