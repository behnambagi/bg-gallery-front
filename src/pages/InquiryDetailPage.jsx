import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import { inquiryService } from '../services/inquiries';
import { productService } from '../services/products';
import { useToast } from '../components/common/Toast';
import { formatPersianDate, convertGregorianToPersian } from '../utils/dateUtils';

const InquiryDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [inquiry, setInquiry] = useState(null);
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responseLoading, setResponseLoading] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [responseData, setResponseData] = useState({
    isAvailable: null,
    responseMessage: '',
    suggestedProductIds: [],
  });

  useEffect(() => {
    if (id) {
      fetchInquiry();
      fetchMyProducts();
    }
  }, [id]);

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      const data = await inquiryService.getById(id);
      setInquiry(data);
    } catch (error) {
      showError('خطا در بارگذاری استعلام');
      navigate('/inquiries');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProducts = async () => {
    try {
      const data = await productService.getMyProducts({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      setMyProducts(data.filter(product => product.status === 'active'));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleResponse = async (isAvailable) => {
    if (!responseData.responseMessage.trim()) {
      showError('لطفاً پیام پاسخ را وارد کنید');
      return;
    }

    setResponseLoading(true);
    try {
      const response = {
        isAvailable,
        responseMessage: responseData.responseMessage,
      };

      if (!isAvailable && responseData.suggestedProductIds.length > 0) {
        response.suggestedProductIds = responseData.suggestedProductIds;
      }

      await inquiryService.respond(id, response);
      showSuccess('پاسخ با موفقیت ارسال شد');
      fetchInquiry();
      
      setResponseData({
        isAvailable: null,
        responseMessage: '',
        suggestedProductIds: [],
      });
    } catch (error) {
      showError('خطا در ارسال پاسخ');
    } finally {
      setResponseLoading(false);
    }
  };

  const handleProductSelect = (productId) => {
    setResponseData(prev => ({
      ...prev,
      suggestedProductIds: prev.suggestedProductIds.includes(productId)
        ? prev.suggestedProductIds.filter(id => id !== productId)
        : [...prev.suggestedProductIds, productId]
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">در انتظار پاسخ</Badge>;
      case 'available':
        return <Badge variant="success">موجود</Badge>;
      case 'unavailable':
        return <Badge variant="danger">ناموجود</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Layout 
        title="جزئیات استعلام" 
        showBackButton 
        onBack={() => navigate('/inquiries')}
        showBottomNav={false}
      >
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="جزئیات استعلام"
      showBackButton
      onBack={() => navigate('/inquiries')}
      showBottomNav={false}
    >
      <div className="p-4 space-y-4">
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse mb-2">
                {getStatusBadge(inquiry.status)}
                <span className="text-sm text-gray-500">
                  {formatPersianDate(convertGregorianToPersian(inquiry.createdAt.split('T')[0]))}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                استعلام محصول: {inquiry.product?.name}
              </h2>
              {inquiry.product?.productCode && (
                <p className="text-sm text-gray-600 mt-1">
                  کد محصول: {inquiry.product.productCode}
                </p>
              )}
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-4 space-x-reverse">
              <div className="flex-shrink-0">
                {inquiry.product?.productMedia?.find(m => m.isPrimary)?.mediaUrl ? (
                  <img
                    src={inquiry.product.productMedia.find(m => m.isPrimary).mediaUrl}
                    alt={inquiry.product.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-2">{inquiry.product?.name}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                  <span>وزن: {inquiry.product?.weightGrams} گرم</span>
                  <span>عیار: {inquiry.product?.karat}</span>
                  <span>نوع طلا: {inquiry.product?.goldType}</span>
                  <span>وضعیت: {inquiry.product?.condition === 'new' ? 'نو' : 'دست دوم'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium text-gray-900 mb-2">اطلاعات مشتری</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {inquiry.user?.fullName || 'کاربر'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {inquiry.user?.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {inquiry.userMessage && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-medium text-gray-900 mb-2">پیام مشتری</h4>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-gray-800">{inquiry.userMessage}</p>
              </div>
            </div>
          )}
        </Card>

        {inquiry.status === 'pending' ? (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">پاسخ به استعلام</h3>
            
            <div className="space-y-4">
              <Textarea
                label="پیام پاسخ"
                value={responseData.responseMessage}
                onChange={(e) => setResponseData(prev => ({ ...prev, responseMessage: e.target.value }))}
                placeholder="پاسخ خود را اینجا بنویسید..."
                rows={3}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="primary"
                  fullWidth
                  loading={responseLoading}
                  onClick={() => handleResponse(true)}
                  disabled={!responseData.responseMessage.trim()}
                >
                  موجود است
                </Button>
                
                <Button
                  variant="secondary"
                  fullWidth
                  loading={responseLoading}
                  onClick={() => {
                    setResponseData(prev => ({ ...prev, isAvailable: false }));
                    setShowProductModal(true);
                  }}
                  disabled={!responseData.responseMessage.trim()}
                >
                  ناموجود - پیشنهاد محصولات
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">پاسخ ارسال شده</h3>
            
            <div className="space-y-3">
              <div className="bg-primary-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <span className="font-medium text-primary-800">وضعیت:</span>
                  <span className="text-primary-700">
                    {inquiry.status === 'available' ? 'موجود اعلام شده' : 'ناموجود اعلام شده'}
                  </span>
                </div>
                
                <div className="border-t border-primary-100 pt-2 mt-2">
                  <p className="text-primary-800 font-medium mb-1">پیام شما:</p>
                  <p className="text-primary-700">{inquiry.jewelerResponseMessage}</p>
                </div>
              </div>

              {inquiry.suggestedProducts && inquiry.suggestedProducts.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">محصولات پیشنهادی</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {inquiry.suggestedProducts.map((product) => (
                      <div key={product.id} className="border rounded-lg p-3">
                        <div className="flex items-center space-x-3 space-x-reverse">
                          <div className="flex-shrink-0">
                            {product.productMedia?.find(m => m.isPrimary)?.mediaUrl ? (
                              <img
                                src={product.productMedia.find(m => m.isPrimary).mediaUrl}
                                alt={product.name}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 text-sm">{product.name}</h5>
                            <p className="text-xs text-gray-600 mt-1">
                              {product.weightGrams} گرم • {product.karat} عیار • {product.goldType}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <Modal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          title="انتخاب محصولات پیشنهادی"
          size="lg"
        >
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">
              محصولات مشابه یا جایگزینی را که می‌خواهید به مشتری پیشنهاد دهید، انتخاب کنید.
            </p>
            
            <div className="max-h-64 overflow-y-auto space-y-2">
              {myProducts.map((product) => (
                <div
                  key={product.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    responseData.suggestedProductIds.includes(product.id)
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleProductSelect(product.id)}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={responseData.suggestedProductIds.includes(product.id)}
                      onChange={() => {}}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    
                    <div className="flex-shrink-0">
                      {product.media?.find(m => m.isPrimary)?.mediaUrl ? (
                        <img
                          src={product.media.find(m => m.isPrimary).mediaUrl}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{product.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {product.weightGrams} گرم • {product.karat} عیار • {product.goldType}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 space-x-reverse pt-4">
              <Button
                variant="primary"
                onClick={() => {
                  handleResponse(false);
                  setShowProductModal(false);
                }}
                loading={responseLoading}
                disabled={responseData.suggestedProductIds.length === 0}
              >
                ارسال پاسخ با محصولات انتخاب شده
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => setShowProductModal(false)}
              >
                انصراف
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default InquiryDetailPage;
