import React from 'react';

const Select = ({ 
  label, 
  error, 
  options = [], 
  value, 
  onChange, 
  disabled = false,
  required = false,
  placeholder = 'انتخاب کنید',
  className = '',
  ...props 
}) => {
  const baseClasses = 'w-full px-4 py-3 rounded-lg border transition-all duration-200 text-right focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white';
  const normalClasses = 'border-gray-300 focus:border-primary-500 focus:ring-primary-200';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-200';
  const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed';

  const selectClasses = `
    ${baseClasses} 
    ${error ? errorClasses : normalClasses} 
    ${disabled ? disabledClasses : ''} 
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;