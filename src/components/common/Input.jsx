import React, { useState } from 'react';

const Input = ({ 
  label, 
  error, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  required = false,
  className = '',
  icon,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const baseClasses = 'w-full px-4 py-3.5 rounded-xl border-2 transition-all duration-300 text-right placeholder-gray-400 focus:outline-none';
  const normalClasses = `border-gray-200 hover:border-gray-300 focus:border-primary-500 ${
    isFocused ? 'shadow-soft ring-2 ring-primary-100' : ''
  }`;
  const errorClasses = 'border-danger-300 focus:border-danger-500 shadow-soft ring-2 ring-danger-100';
  const disabledClasses = 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200';

  const inputClasses = `
    ${baseClasses} 
    ${error ? errorClasses : normalClasses} 
    ${disabled ? disabledClasses : 'bg-white hover:bg-gray-50/50'} 
    ${icon ? 'pr-12' : ''}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-bold text-gray-700 mb-3">
          {label}
          {required && <span className="text-danger-500 mr-1 font-normal">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={inputClasses}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        
        {icon && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-2 flex items-center space-x-2 space-x-reverse">
          <svg className="w-4 h-4 text-danger-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm text-danger-600 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default Input;