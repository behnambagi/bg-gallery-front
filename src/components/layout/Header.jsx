import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import Button from '../common/Button';

const Header = ({ title, showBackButton = false, onBack, actions = [] }) => {
  const { user, logout } = useAuth();
  const { showSuccess } = useToast();

  const handleLogout = () => {
    logout();
    showSuccess('با موفقیت خارج شدید');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 px-4 py-4 max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors ml-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-2 rounded-lg transition-colors ${
                action.variant === 'primary' 
                  ? 'text-primary-500 hover:bg-primary-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {action.icon}
            </button>
          ))}
          
          <div className="relative group">
            <button className="flex items-center p-2 text-gray-600 hover:text-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <div className="absolute left-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{user?.galleryName || 'کاربر'}</p>
                <p className="text-xs text-gray-500">{user?.phoneNumber}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  خروج از حساب کاربری
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;