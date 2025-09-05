import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  hover = false,
  onClick,
  variant = 'default',
  glass = false
}) => {
  const paddingClasses = {
    none: '',
    xs: 'p-2',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const shadowClasses = {
    none: '',
    soft: 'shadow-soft',
    sm: 'shadow-sm',
    default: 'card-shadow',
    medium: 'shadow-medium',
    lg: 'shadow-large',
  };

  const variantClasses = {
    default: 'bg-white border border-gray-100',
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100 border border-primary-200',
    gold: 'bg-gradient-to-br from-gold-50 to-gold-100 border border-gold-200',
    success: 'bg-gradient-to-br from-success-50 to-success-100 border border-success-200',
    danger: 'bg-gradient-to-br from-danger-50 to-danger-100 border border-danger-200',
    warning: 'bg-gradient-to-br from-warning-50 to-warning-100 border border-warning-200',
    glass: 'glass-effect',
  };

  const baseClasses = 'rounded-2xl transition-all duration-300 ease-out';
  const glassClasses = glass ? 'glass-effect' : variantClasses[variant];
  const hoverClasses = hover ? 'floating-element cursor-pointer hover:card-shadow-hover' : '';
  const clickableClasses = onClick ? 'select-none' : '';
  
  const cardClasses = `
    ${baseClasses} 
    ${glassClasses}
    ${paddingClasses[padding]} 
    ${shadowClasses[shadow]} 
    ${hoverClasses} 
    ${clickableClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;