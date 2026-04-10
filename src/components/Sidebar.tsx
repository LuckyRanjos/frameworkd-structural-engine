"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useCurrentUser } from './UserContext';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { email, plan, role, isAuthenticated } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Navigation items configuration
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      description: 'Overview and analytics'
    },
    {
      id: 'diagnostic',
      label: 'Run Diagnostic',
      icon: '🎯',
      path: '/diagnostic',
      description: 'Analyze your decision framework',
      primary: true // Highlighted as primary action
    },
    {
      id: 'history',
      label: 'Decision Log',
      icon: '📝',
      path: '/history',
      description: 'View past analyses'
    },
    {
      id: 'billing',
      label: 'Billing',
      icon: '💳',
      path: '/billing',
      description: 'Manage your subscription'
    },
    // Admin only
    ...(role === 'admin' ? [{
      id: 'admin',
      label: 'Admin',
      icon: '⚙️',
      path: '/admin',
      description: 'System administration'
    }] : [])
  ];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Extract user initials from email
  const getInitials = (emailStr: string | null) => {
    if (!emailStr) return "?";
    const name = emailStr.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  };

  // Check if current path matches navigation item
  const isActive = (path: string) => {
    if (path === '/dashboard' && pathname === '/') return true;
    return pathname === path;
  };

  return (
    <div className={`flex flex-col h-screen bg-white border-r border-neutral-200 ${className}`}>
      {/* Logo Section */}
      <div className="flex items-center justify-center px-6 py-8 border-b border-neutral-100">
        <div className="flex flex-col items-center space-y-2">
          <div className="text-2xl font-bold text-foreground tracking-tight">
            FRAMEWORKD
          </div>
          <div className="text-xs text-neutral-500 font-medium tracking-wider">
            STRUCTURAL ENGINE
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigationItems.map((item) => {
          const active = isActive(item.path);
          const isPrimary = item.primary;

          return (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group sidebar-item-hover
                ${active
                  ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-sm'
                  : isPrimary
                    ? 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-foreground hover:shadow-sm'
                }
              `}
            >
              {/* Icon */}
              <span className={`text-lg ${active || isPrimary ? '' : 'group-hover:scale-110 transition-transform duration-200'}`}>
                {item.icon}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${active || isPrimary ? 'font-semibold' : ''}`}>
                  {item.label}
                </div>
                <div className={`text-xs mt-0.5 ${active ? 'text-amber-700' : isPrimary ? 'text-amber-100' : 'text-neutral-500 group-hover:text-neutral-600'}`}>
                  {item.description}
                </div>
              </div>

              {/* Active indicator */}
              {active && (
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      {isAuthenticated && (
        <div className="px-4 py-6 border-t border-neutral-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-all duration-200 group sidebar-item-hover">
            {/* Avatar */}
            <div className="w-10 h-10 bg-neutral-800 text-white text-sm font-semibold flex items-center justify-center rounded-full group-hover:scale-105 transition-transform duration-200">
              {getInitials(email)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">
                {email?.split('@')[0]}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
                  {plan?.toUpperCase() || 'FREE'}
                </span>
                {role === 'admin' && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                    ADMIN
                  </span>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-neutral-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50"
              title="Sign out"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;