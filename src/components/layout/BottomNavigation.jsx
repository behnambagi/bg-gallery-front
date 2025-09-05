import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: 'داشبورد',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2m-6 4h6" />
        </svg>
      )
    },
    {
      id: 'products',
      path: '/products',
      label: 'محصولات',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      id: 'inquiries',
      path: '/inquiries',
      label: 'استعلام‌ها',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      id: 'profile',
      path: '/profile',
      label: 'پروفایل',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const isActiveRoute = (path) => {
    if (path === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200/50 px-4 py-2 shadow-large z-50">
      <div className="max-w-md mx-auto">
        {/* Active indicator background */}
        <div className="absolute top-0 left-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transform -translate-x-1/2 transition-all duration-300" />
        
        <div className="flex justify-around items-center relative">
          {navItems.map((item, index) => {
            const isActive = isActiveRoute(item.path);
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center py-3 px-4 rounded-2xl transition-all duration-300 transform relative ${
                  isActive
                    ? 'text-primary-600 bg-primary-50 scale-105'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-2 left-1/2 w-2 h-2 bg-primary-500 rounded-full transform -translate-x-1/2 animate-bounce-subtle" />
                )}
                
                <div className={`transition-all duration-300 ${isActive ? 'transform scale-110' : ''}`}>
                  {item.icon}
                </div>
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  isActive ? 'text-primary-700 font-semibold' : ''
                }`}>
                  {item.label}
                </span>
                
                {/* Ripple effect */}
                <div className="absolute inset-0 rounded-2xl bg-primary-100 opacity-0 scale-0 transition-all duration-300 pointer-events-none" />
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavigation;