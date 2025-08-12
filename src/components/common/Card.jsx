import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  padding = 'default',
  shadow = 'default',
  hover = false,
  onClick 
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
  };

  const baseClasses = 'bg-white rounded-xl border border-gray-100';
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : '';
  
  const cardClasses = `
    ${baseClasses} 
    ${paddingClasses[padding]} 
    ${shadowClasses[shadow]} 
    ${hoverClasses} 
    ${className}
  `;

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;