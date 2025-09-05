import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productService } from '../services/products';
import { useToast } from '../components/common/Toast';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const data = await productService.getById(id);
      setProduct(data);
    } catch (error) {
      showError('خطا در بارگذاری جزئیات محصول');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsSold = async () => {
    try {
      setActionLoading(true);
      await productService.markAsSold(id);
      showSuccess('محصول به عنوان فروخته شده علامت‌گذاری شد');
      fetchProduct();
    } catch (error) {
      showError('خطا در علامت‌گذاری محصول');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    try {
      setActionLoading(true);
      await productService.delete(id);
      showSuccess('محصول با موفقیت حذف شد');
      navigate('/products');
    } catch (error) {
      showError('خطا در حذف محصول');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="lg">موجود</Badge>;
      case 'sold':
        return <Badge variant="default" size="lg">فروخته شده</Badge>;
      case 'inactive':
        return <Badge variant="warning" size="lg">غیرفعال</Badge>;
      default:
        return <Badge variant="default" size="lg">{status}</Badge>;
    }
  };

  const formatPrice = (calculatedPrice) => {
    if (!calculatedPrice?.totalPrice) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(calculatedPrice.totalPrice) + ' تومان';
  };

  const headerActions = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => navigate(`/products/edit/${id}`),
      variant: 'primary'
    }
  ];

  if (loading) {
    return (
      <Layout title="جزئیات محصول" showBackButton onBack={() => navigate('/products')}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout title="جزئیات محصول" showBackButton onBack={() => navigate('/products')}>
        <div className="p-4">
          <Card className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">محصول یافت نشد</h3>
            <p className="text-gray-600 text-sm mb-6">محصول مورد نظر حذف شده یا وجود ندارد</p>
            <Button variant="primary" onClick={() => navigate('/products')}>
              بازگشت به لیست محصولات
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const images = product.media?.filter(m => m.type === 'image') || [];
  const videos = product.media?.filter(m => m.type === 'video') || [];

  return (
    <Layout 
      title="جزئیات محصول" 
      showBackButton 
      onBack={() => navigate('/products')}
      headerActions={headerActions}
    >
      <div className="animate-fade-in">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[selectedImageIndex]?.mediaUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            
            {/* Status Badge Overlay */}
            <div className="absolute top-4 right-4">
              {getStatusBadge(product.status)}
            </div>
            
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/70 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                    selectedImageIndex === index 
                      ? 'border-primary-500 ring-2 ring-primary-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={image.mediaUrl}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 space-y-6">
          {/* Basic Info */}
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                {product.productCode && (
                  <p className="text-sm text-gray-600 font-medium">کد محصول: {product.productCode}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary-600">
                  {formatPrice(product.calculatedPrice)}
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">دسته‌بندی</p>
                  <p className="font-semibold text-gray-900">{product.category?.name || 'نامشخص'}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Specifications */}
          <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h2 className="text-lg font-bold text-gray-900 mb-4">مشخصات فنی</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-primary-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-primary-700">{product.weightGrams}</p>
                <p className="text-sm text-primary-600 font-medium">گرم</p>
              </div>
              
              <div className="bg-gradient-to-br from-gold-50 to-gold-100 rounded-2xl p-4 text-center">
                <div className="w-10 h-10 bg-gold-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-gold-700">{product.karat}</p>
                <p className="text-sm text-gold-600 font-medium">عیار</p>
              </div>
              
              {product.stoneType && (
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
                  <div className="w-10 h-10 bg-purple-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-purple-700">{product.stoneType}</p>
                  <p className="text-xs text-purple-600">نوع سنگ</p>
                </div>
              )}
              
              {product.stoneWeight && (
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
                  <div className="w-10 h-10 bg-green-200 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-green-700">{product.stoneWeight}</p>
                  <p className="text-xs text-green-600">وزن سنگ</p>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          {product.description && (
            <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.2s'}}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">توضیحات</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </Card>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.3s'}}>
              <h2 className="text-lg font-bold text-gray-900 mb-4">ویدیوها</h2>
              <div className="space-y-3">
                {videos.map((video, index) => (
                  <div key={index} className="rounded-2xl overflow-hidden">
                    <video
                      controls
                      className="w-full h-48 object-cover"
                      poster={video.thumbnailUrl}
                    >
                      <source src={video.mediaUrl} type="video/mp4" />
                      مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                    </video>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pb-6">
            {product.status === 'active' && (
              <Button
                variant="success"
                size="lg"
                fullWidth
                onClick={handleMarkAsSold}
                loading={actionLoading}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                علامت‌گذاری به عنوان فروخته شده
              </Button>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/products/edit/${id}`)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                ویرایش
              </Button>
              
              <Button
                variant="danger"
                size="lg"
                onClick={handleDeleteProduct}
                loading={actionLoading}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;