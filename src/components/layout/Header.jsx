import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import Button from '../common/Button';

const Header = ({ title, showBackButton = false, onBack, actions = [] }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess('با موفقیت خارج شدید');
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-soft border-b border-gray-100/50 px-4 py-4 sticky top-0 z-40 animate-slide-down">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <div className="flex items-center space-x-3 space-x-reverse">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900 gradient-text">{title}</h1>
            {user?.galleryName && (
              <p className="text-xs text-gray-500 mt-0.5">{user.galleryName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-2.5 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                action.variant === 'primary' 
                  ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {action.icon}
            </button>
          ))}
          
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                {user?.galleryName?.charAt(0) || 'ک'}
              </div>
            </button>
            
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-large z-20 animate-slide-down overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-gray-100">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">
                        {user?.galleryName?.charAt(0) || 'ک'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.galleryName || 'کاربر عزیز'}</p>
                        <p className="text-xs text-gray-600 truncate">{user?.phoneNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center text-right px-3 py-2.5 text-sm text-danger-600 hover:bg-danger-50 rounded-xl transition-all duration-200 group"
                    >
                      <svg className="w-4 h-4 ml-3 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      خروج از حساب کاربری
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;