import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './Toast';
import { uploadService } from '../../services/upload';

const ProfileImageUploader = ({ 
  onImageChange,
  className = '',
  disabled = false,
  showExisting = true,
  size = 'lg', // 'sm', 'md', 'lg', 'xl'
  showName = false,
  userName = ''
}) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  useEffect(() => {
    if (showExisting) {
      fetchExistingImages();
    }
  }, [showExisting]);

  const fetchExistingImages = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getProfileImages();
      setExistingImages(response.uploads || []);
      
      // Set first image as current if exists
      if (response.uploads?.length > 0) {
        setCurrentImage(response.uploads[0]);
        if (onImageChange) {
          onImageChange(response.uploads[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching profile images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (response) => {
    setCurrentImage(response);
    showSuccess('تصویر پروفایل با موفقیت آپلود شد');
    
    // Refresh existing images
    if (showExisting) {
      fetchExistingImages();
    }
    
    if (onImageChange) {
      onImageChange(response);
    }
  };

  const handleImageError = (error) => {
    console.error('Profile image upload error:', error);
    showError('خطا در آپلود تصویر پروفایل');
  };

  const selectExistingImage = (image) => {
    setCurrentImage(image);
    if (onImageChange) {
      onImageChange(image);
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      return;
    }

    try {
      await uploadService.deleteUpload(imageId);
      showSuccess('تصویر حذف شد');
      
      // Remove from existing images
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      
      // Clear current image if it was deleted
      if (currentImage?.id === imageId) {
        setCurrentImage(null);
        if (onImageChange) {
          onImageChange(null);
        }
      }
    } catch (error) {
      showError('خطا در حذف تصویر');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'کاربر';
    const words = name.split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
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
      <div className="flex flex-col items-center space-y-4">
        {/* Current Profile Image Display */}
        <div className="relative">
          <div className={`${sizeClasses[size]} relative`}>
            {currentImage ? (
              <img
                src={currentImage.url}
                alt={currentImage.altText || 'تصویر پروفایل'}
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg ring-2 ring-gray-200"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 rounded-full border-4 border-white shadow-lg ring-2 ring-gray-200 flex items-center justify-center">
                <span className={`font-bold text-white ${textSizeClasses[size]}`}>
                  {getInitials(userName)}
                </span>
              </div>
            )}
            
            {/* Upload overlay */}
            <div className="absolute inset-0">
              <ImageUploader
                variant="avatar"
                category="profile"
                altText="تصویر پروفایل کاربر"
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageError}
                existingImage={currentImage?.url}
                disabled={disabled}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Camera icon indicator */}
          <div className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-full border-2 border-white flex items-center justify-center shadow-lg">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>

        {/* User name */}
        {showName && userName && (
          <div className="text-center">
            <h3 className="font-semibold text-gray-900">{userName}</h3>
            {currentImage && (
              <p className="text-sm text-gray-500 mt-1">
                آپلود شده در {new Date(currentImage.createdAt).toLocaleDateString('fa-IR')}
              </p>
            )}
          </div>
        )}

        {/* Current Image Details */}
        {currentImage && !showName && (
          <div className="text-center">
            <h4 className="text-sm font-medium text-gray-900">
              {currentImage.originalName}
            </h4>
            <p className="text-xs text-gray-500">
              {(currentImage.size / 1024).toFixed(1)} KB
            </p>
          </div>
        )}

        {/* Existing Profile Images */}
        {showExisting && existingImages.length > 1 && (
          <div className="w-full">
            <h5 className="text-sm font-medium text-gray-700 mb-3 text-center">تصاویر قبلی</h5>
            <div className="flex justify-center space-x-3 space-x-reverse overflow-x-auto pb-2">
              {existingImages.filter(img => img.id !== currentImage?.id).map((image) => (
                <div
                  key={image.id}
                  className="flex-shrink-0 relative group cursor-pointer"
                  onClick={() => selectExistingImage(image)}
                >
                  <div className="w-16 h-16 relative">
                    <img
                      src={image.url}
                      alt={image.altText || image.originalName}
                      className="w-full h-full object-cover rounded-full border-2 border-gray-200 hover:border-primary-400 transition-colors"
                    />
                    
                    {/* Overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-full flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteImage(image.id);
                          }}
                          className="w-6 h-6 bg-danger-500 text-white rounded-full flex items-center justify-center hover:bg-danger-600 transition-colors"
                          title="حذف تصویر"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• فرمت‌های مجاز: JPG، PNG، WebP</p>
          <p>• حداکثر حجم: 5 مگابایت</p>
          <p>• ابعاد پیشنهادی: 400×400 پیکسل</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUploader;