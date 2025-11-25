import React, { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './Toast';
import { uploadService } from '../../services/upload';

const CoverImageUploader = ({ 
  onImageChange,
  className = '',
  disabled = false,
  showExisting = true,
  height = 'normal', // 'short', 'normal', 'tall'
  showOverlay = true,
  overlayText = 'تصویر کاور'
}) => {
  const [currentImage, setCurrentImage] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const heightClasses = {
    short: 'h-24',
    normal: 'h-32',
    tall: 'h-40'
  };

  const thumbnailHeightClasses = {
    short: 'h-16',
    normal: 'h-20',
    tall: 'h-24'
  };

  useEffect(() => {
    if (showExisting) {
      fetchExistingImages();
    }
  }, [showExisting]);

  const fetchExistingImages = async () => {
    try {
      setLoading(true);
      const response = await uploadService.getCovers();
      setExistingImages(response.uploads || []);
      
      // Set first image as current if exists
      if (response.uploads?.length > 0) {
        setCurrentImage(response.uploads[0]);
        if (onImageChange) {
          onImageChange(response.uploads[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching cover images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (response) => {
    setCurrentImage(response);
    showSuccess('تصویر کاور با موفقیت آپلود شد');
    
    // Refresh existing images
    if (showExisting) {
      fetchExistingImages();
    }
    
    if (onImageChange) {
      onImageChange(response);
    }
  };

  const handleImageError = (error) => {
    console.error('Cover image upload error:', error);
    showError('خطا در آپلود تصویر کاور');
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

  const removeCurrent = () => {
    setCurrentImage(null);
    if (onImageChange) {
      onImageChange(null);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${heightClasses[height]} ${className}`}>
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Current Cover Image Display */}
        <div className="relative group">
          <div className={`${heightClasses[height]} w-full relative rounded-lg overflow-hidden`}>
            {currentImage ? (
              <>
                <img
                  src={currentImage.url}
                  alt={currentImage.altText || 'تصویر کاور'}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                {showOverlay && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex space-x-2 space-x-reverse">
                          <button
                            onClick={removeCurrent}
                            className="px-3 py-1.5 bg-danger-500 text-white text-sm rounded-lg hover:bg-danger-600 transition-colors shadow-lg"
                            title="حذف تصویر"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image info */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {currentImage.originalName} • {(currentImage.size / 1024).toFixed(1)} KB
                </div>
              </>
            ) : (
              // Upload Area
              <ImageUploader
                variant="cover"
                category="cover"
                altText="تصویر کاور"
                accept="image/*"
                maxSize={10 * 1024 * 1024} // 10MB
                onUploadSuccess={handleImageUpload}
                onUploadError={handleImageError}
                disabled={disabled}
                className="w-full h-full"
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm text-gray-600">{overlayText}</p>
                  <p className="text-xs text-gray-500 mt-1">کلیک کنید یا فایل را بکشید</p>
                </div>
              </ImageUploader>
            )}
          </div>
        </div>

        {/* Existing Cover Images */}
        {showExisting && existingImages.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-700 mb-3">تصاویر کاور قبلی</h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {existingImages.map((image) => (
                <div
                  key={image.id}
                  className={`
                    relative group cursor-pointer rounded-lg overflow-hidden border-2 
                    ${currentImage?.id === image.id 
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                    transition-all duration-200
                  `}
                  onClick={() => selectExistingImage(image)}
                >
                  <div className={thumbnailHeightClasses[height]}>
                    <img
                      src={image.url}
                      alt={image.altText || image.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 space-x-reverse">
                      {currentImage?.id !== image.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            selectExistingImage(image);
                          }}
                          className="px-2 py-1 bg-primary-500 text-white text-xs rounded hover:bg-primary-600 transition-colors"
                          title="انتخاب"
                        >
                          انتخاب
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                        className="px-2 py-1 bg-danger-500 text-white text-xs rounded hover:bg-danger-600 transition-colors"
                        title="حذف"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                  
                  {/* Selected indicator */}
                  {currentImage?.id === image.id && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}

                  {/* Image name */}
                  <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-1.5 py-0.5 rounded text-center">
                    <p className="truncate" style={{ maxWidth: '100px' }}>
                      {image.originalName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload new image button when current exists */}
        {currentImage && (
          <div className="text-center">
            <ImageUploader
              category="cover"
              altText="تصویر کاور جدید"
              accept="image/*"
              maxSize={10 * 1024 * 1024} // 10MB
              onUploadSuccess={handleImageUpload}
              onUploadError={handleImageError}
              disabled={disabled}
              showPreview={false}
            >
              <div className="py-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-400 hover:bg-gray-50 transition-all">
                <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <p className="text-sm text-gray-600">افزودن تصویر جدید</p>
              </div>
            </ImageUploader>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• فرمت‌های مجاز: JPG، PNG، WebP</p>
          <p>• حداکثر حجم: 10 مگابایت</p>
          <p>• ابعاد پیشنهادی: 1200×400 پیکسل</p>
          <p>• نسبت ابعاد: 3:1 (عرض × ارتفاع)</p>
        </div>
      </div>
    </div>
  );
};

export default CoverImageUploader;