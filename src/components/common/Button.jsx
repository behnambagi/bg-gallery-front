import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false,
  fullWidth = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-100',
    outline: 'border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300',
    ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-300',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 disabled:bg-red-300',
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner size="sm" color="white" />}
      {loading ? (
        <span className="mr-2">در حال پردازش...</span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;