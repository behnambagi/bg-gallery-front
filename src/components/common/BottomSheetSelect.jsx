import React, { useState } from 'react';
import BottomSheet from './BottomSheet';

const BottomSheetSelect = ({ 
  label, 
  error, 
  options = [], 
  value, 
  onChange, 
  disabled = false,
  required = false,
  placeholder = 'انتخاب کنید',
  className = '',
  icon,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const selectedOption = options.find(option => option.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;
  
  const handleOptionSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  const baseClasses = 'w-full px-4 py-3 rounded-2xl border transition-all duration-200 text-right focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white cursor-pointer';
  const normalClasses = 'border-gray-300 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-200';
  const errorClasses = 'border-red-300 focus:border-red-500 focus:ring-red-200';
  const disabledClasses = 'bg-gray-100 text-gray-500 cursor-not-allowed';

  const buttonClasses = `
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
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={buttonClasses}
        {...props}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            {icon && (
              <div className="text-gray-400">
                {icon}
              </div>
            )}
            <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
              {displayText}
            </span>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      <BottomSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label || 'انتخاب کنید'}
      >
        <div className="space-y-2">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option.value)}
              className={`w-full text-right px-4 py-4 rounded-2xl transition-all duration-200 ${
                value === option.value
                  ? 'bg-primary-50 text-primary-700 border-2 border-primary-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-900 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.label}</span>
                {value === option.value && (
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default BottomSheetSelect;