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
  icon,
  iconPosition = 'left',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center relative overflow-hidden group transform active:scale-95';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 disabled:from-primary-300 disabled:to-primary-300 shadow-lg hover:shadow-xl',
    secondary: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 focus:ring-gray-500 disabled:from-gray-100 disabled:to-gray-100 border border-gray-200',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 hover:border-primary-600 focus:ring-primary-500 disabled:border-primary-300 disabled:text-primary-300 bg-white hover:shadow-md',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-300 hover:shadow-sm',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white hover:from-danger-600 hover:to-danger-700 focus:ring-danger-500 disabled:from-danger-300 disabled:to-danger-300 shadow-lg hover:shadow-xl',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 focus:ring-success-500 disabled:from-success-300 disabled:to-success-300 shadow-lg hover:shadow-xl',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600 text-white hover:from-warning-600 hover:to-warning-700 focus:ring-warning-500 disabled:from-warning-300 disabled:to-warning-300 shadow-lg hover:shadow-xl',
    gold: 'bg-gradient-to-r from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 focus:ring-gold-500 disabled:from-gold-300 disabled:to-gold-300 shadow-lg hover:shadow-xl',
  };

  const sizeClasses = {
    xs: 'px-3 py-2 text-xs',
    sm: 'px-4 py-2.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
    xl: 'px-10 py-5 text-xl',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  
  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner size="sm" color="currentColor" />
          <span className="mr-2">در حال پردازش...</span>
        </>
      );
    }

    const iconElement = icon && (
      <span className={`${children ? (iconPosition === 'left' ? 'ml-2' : 'mr-2') : ''}`}>
        {icon}
      </span>
    );

    return (
      <>
        {icon && iconPosition === 'left' && iconElement}
        {children}
        {icon && iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {renderContent()}
      </span>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </button>
  );
};

export default Button;