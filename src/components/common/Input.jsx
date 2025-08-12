import React from 'react';

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
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 rounded-lg border transition-all duration-200 text-right placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1';
  const normalClasses = 'border-gray-300 focus:border-primary-500 focus:ring-primary-200';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-200';
  const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed';

  const inputClasses = `
    ${baseClasses} 
    ${error ? errorClasses : normalClasses} 
    ${disabled ? disabledClasses : 'bg-white'} 
    ${className}
  `;

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;