import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './Toast';
import { uploadService } from '../../services/upload';

const LogoUploader = ({ 
  onLogoChange,
  className = '',
  disabled = false,
  showExisting = true,
  size = 'md' // 'sm', 'md', 'lg'
}) => {
  const [currentLogo, setCurrentLogo] = useState(null);
  const [existingLogos, setExistingLogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24', 
    lg: 'w-32 h-32'
  };

  useEffect(() => {
    if (showExisting) {
      fetchExistingLogos();
    }
  }, [showExisting]);

  const fetchExistingLogos = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getLogos();
      setExistingLogos(response.uploads || []);
      
      // Set first logo as current if exists
      if (response.uploads?.length > 0) {
        setCurrentLogo(response.uploads[0]);
        if (onLogoChange) {
          onLogoChange(response.uploads[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching logos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (response) => {
    setCurrentLogo(response);
    showSuccess('لوگو با موفقیت آپلود شد');
    
    // Refresh existing logos
    if (showExisting) {
      fetchExistingLogos();
    }
    
    if (onLogoChange) {
      onLogoChange(response);
    }
  };

  const handleLogoError = (error) => {
    console.error('Logo upload error:', error);
    showError('خطا در آپلود لوگو');
  };

  const selectExistingLogo = (logo) => {
    setCurrentLogo(logo);
    if (onLogoChange) {
      onLogoChange(logo);
    }
  };

  const deleteLogo = async (logoId) => {
    if (!window.confirm('آیا از حذف این لوگو اطمینان دارید؟')) {
      return;
    }

    try {
      await uploadService.deleteUpload(logoId);
      showSuccess('لوگو حذف شد');
      
      // Remove from existing logos
      setExistingLogos(prev => prev.filter(logo => logo.id !== logoId));
      
      // Clear current logo if it was deleted
      if (currentLogo?.id === logoId) {
        setCurrentLogo(null);
        if (onLogoChange) {
          onLogoChange(null);
        }
      }
    } catch (error) {
      showError('خطا در حذف لوگو');
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current Logo Display */}
        {currentLogo && (
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className={`${sizeClasses[size]} flex-shrink-0`}>
              <img
                src={currentLogo.url}
                alt={currentLogo.altText || 'لوگو فعلی'}
                className="w-full h-full object-contain rounded-lg border border-gray-200"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {currentLogo.originalName}
              </h4>
              <p className="text-xs text-gray-500">
                {(currentLogo.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>
        )}

        {/* Logo Uploader */}
        <div>
          <ImageUploader
            variant="avatar"
            category="logo"
            altText="لوگو فروشگاه"
            accept="image/*"
            maxSize={5 * 1024 * 1024} // 5MB
            onUploadSuccess={handleLogoUpload}
            onUploadError={handleLogoError}
            existingImage={currentLogo?.url}
            disabled={disabled}
            className="flex justify-center"
          />
        </div>

        {/* Existing Logos */}
        {showExisting && existingLogos.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">لوگوهای قبلی</h5>
            <div className="grid grid-cols-3 gap-3">
              {existingLogos.map((logo) => (
                <div
                  key={logo.id}
                  className={`
                    relative group cursor-pointer rounded-lg border-2 overflow-hidden
                    ${currentLogo?.id === logo.id 
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                  onClick={() => selectExistingLogo(logo)}
                >
                  <div className="aspect-square">
                    <img
                      src={logo.url}
                      alt={logo.altText || logo.originalName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteLogo(logo.id);
                        }}
                        className="w-8 h-8 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                        title="حذف لوگو"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {currentLogo?.id === logo.id && (
                    <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 text-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• فرمت‌های مجاز: JPG، PNG، WebP</p>
          <p>• حداکثر حجم: 5 مگابایت</p>
          <p>• ابعاد پیشنهادی: 512×512 پیکسل</p>
        </div>
      </div>
    </div>
  );
};

export default LogoUploader;