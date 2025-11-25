import React, { useState, useRef } from 'react';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './Toast';
import { uploadService } from '../../services/upload';

const ImageUploader = ({
  onUploadSuccess,
  onUploadError,
  category = 'general',
  altText = '',
  maxFiles = 1,
  multiple = false,
  accept = 'image/*,video/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  showPreview = true,
  variant = 'default', // 'default', 'avatar', 'cover'
  existingImage = null,
  className = '',
  children
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState(existingImage);
  const fileInputRef = useRef(null);
  const { showError } = useToast();

  const validateFile = (file) => {
    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      showError(`حجم فایل نباید بیشتر از ${sizeMB} مگابایت باشد`);
      return false;
    }
    
    const validTypes = accept.split(',').map(type => type.trim());
    if (!validTypes.some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    })) {
      showError('فرمت فایل مجاز نیست');
      return false;
    }
    
    return true;
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    
    if (!multiple && fileArray.length > 1) {
      showError('فقط یک فایل مجاز است');
      return;
    }
    
    if (fileArray.length > maxFiles) {
      showError(`حداکثر ${maxFiles} فایل مجاز است`);
      return;
    }

    // Validate all files
    for (const file of fileArray) {
      if (!validateFile(file)) {
        return;
      }
    }

    // Show preview for single file
    if (!multiple && fileArray[0] && fileArray[0].type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(fileArray[0]);
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      
      if (multiple) {
        fileArray.forEach(file => formData.append('files', file));
        formData.append('category', category);
      } else {
        formData.append('file', fileArray[0]);
        formData.append('category', category);
        formData.append('altText', altText);
      }

      const response = await uploadFiles(formData, multiple);
      
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error);
      } else {
        showError('خطا در آپلود فایل');
      }
      setPreview(existingImage);
    } finally {
      setUploading(false);
    }
  };

  // Real upload function using uploadService
  const uploadFiles = async (formData, isMultiple) => {
    if (isMultiple) {
      const files = formData.getAll('files');
      return await uploadService.uploadMultiple(files, category, altText);
    } else {
      const file = formData.get('file');
      const alt = formData.get('altText');
      return await uploadService.uploadSingle(file, category, alt);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    if (files?.length > 0) {
      handleFileSelect(files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const removePreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Avatar variant
  if (variant === 'avatar') {
    return (
      <div className={`relative ${className}`}>
        <div 
          className={`
            relative w-24 h-24 rounded-full overflow-hidden cursor-pointer border-2 border-dashed
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
            transition-all duration-200
          `}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="تصویر پروفایل" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" />
            </div>
          )}
        </div>
        
        {preview && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePreview();
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
            title="حذف تصویر"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  // Cover variant
  if (variant === 'cover') {
    return (
      <div className={`relative ${className}`}>
        <div 
          className={`
            relative w-full h-32 rounded-lg overflow-hidden cursor-pointer border-2 border-dashed
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
            ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400'}
            transition-all duration-200
          `}
          onClick={openFileDialog}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <img 
              src={preview} 
              alt="تصویر کاور" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-100">
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-500">تصویر کاور</span>
            </div>
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <LoadingSpinner size="sm" color="white" />
            </div>
          )}
        </div>
        
        {preview && !uploading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              removePreview();
            }}
            className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-70 text-white rounded-full flex items-center justify-center hover:bg-opacity-90 transition-all"
            title="حذف تصویر"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || uploading}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className={className}>
      <div 
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}
          ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary-400 hover:bg-gray-50'}
          transition-all duration-200
        `}
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <LoadingSpinner size="md" />
            <p className="mt-3 text-sm text-gray-600">در حال آپلود...</p>
          </div>
        ) : (
          <>
            <svg 
              className="mx-auto h-12 w-12 text-gray-400 mb-3" 
              stroke="currentColor" 
              fill="none" 
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            <div>
              <p className="text-base text-gray-600 mb-1">
                {children || 'فایل را بکشید و رها کنید یا کلیک کنید'}
              </p>
              <p className="text-sm text-gray-400">
                {multiple ? `حداکثر ${maxFiles} فایل` : 'یک فایل'} • حداکثر {Math.round(maxSize / (1024 * 1024))} مگابایت
              </p>
            </div>
          </>
        )}
      </div>
      
      {showPreview && preview && !uploading && (
        <div className="mt-4">
          <div className="relative inline-block">
            <img 
              src={preview} 
              alt="پیش‌نمایش" 
              className="h-20 w-20 object-cover rounded-lg"
            />
            <button
              onClick={removePreview}
              className="absolute -top-2 -right-2 w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
              title="حذف تصویر"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default ImageUploader;