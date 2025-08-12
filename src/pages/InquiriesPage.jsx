import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { inquiryService } from '../services/inquiries';
import { useToast } from '../components/common/Toast';
import { formatPersianDate, convertGregorianToPersian } from '../utils/dateUtils';

const InquiriesPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await inquiryService.getJewelerInquiries(params);
      setInquiries(data);
    } catch (error) {
      showError('خطا در بارگذاری استعلام‌ها');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await inquiryService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching inquiry stats:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning" size="sm">در انتظار پاسخ</Badge>;
      case 'available':
        return <Badge variant="success" size="sm">موجود</Badge>;
      case 'unavailable':
        return <Badge variant="danger" size="sm">ناموجود</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const formatPrice = (calculatedPrice) => {
    if (!calculatedPrice?.totalPrice) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(calculatedPrice.totalPrice) + ' تومان';
  };

  const statusOptions = [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'pending', label: 'در انتظار پاسخ' },
    { value: 'available', label: 'موجود' },
    { value: 'unavailable', label: 'ناموجود' },
  ];

  if (loading && !stats) {
    return (
      <Layout title="مدیریت استعلام‌ها">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="مدیریت استعلام‌ها">
      <div className="p-4 space-y-4">
        {stats && (
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">آمار استعلام‌ها</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                <p className="text-gray-600 text-sm">در انتظار پاسخ</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{stats.available}</p>
                <p className="text-gray-600 text-sm">موجود</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">{stats.unavailable}</p>
                <p className="text-gray-600 text-sm">ناموجود</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-500">{Math.round(stats.responseRate)}%</p>
                <p className="text-gray-600 text-sm">نرخ پاسخ</p>
              </div>
            </div>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="flex-1"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : inquiries.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">استعلامی یافت نشد</h3>
            <p className="text-gray-600 text-sm">
              {statusFilter 
                ? 'با فیلتر انتخاب شده استعلامی یافت نشد' 
                : 'هنوز استعلامی دریافت نکرده‌اید'
              }
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {inquiries.map((inquiry) => (
              <Card key={inquiry.id} padding="sm" hover onClick={() => navigate(`/inquiries/${inquiry.id}`)}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 space-x-reverse mb-2">
                        {getStatusBadge(inquiry.status)}
                        <span className="text-xs text-gray-500">
                          {formatPersianDate(convertGregorianToPersian(inquiry.createdAt.split('T')[0]))}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-900 mb-1">
                        {inquiry.product?.name}
                      </h4>
                      
                      {inquiry.product?.productCode && (
                        <p className="text-xs text-gray-500 mb-2">
                          کد محصول: {inquiry.product.productCode}
                        </p>
                      )}

                      <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-600">
                        <span>{inquiry.product?.weightGrams} گرم</span>
                        <span>{inquiry.product?.karat} عیار</span>
                        <span className="capitalize">{inquiry.product?.goldType}</span>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 mr-3">
                      {inquiry.product?.productMedia?.find(m => m.isPrimary)?.mediaUrl ? (
                        <img
                          src={inquiry.product.productMedia.find(m => m.isPrimary).mediaUrl}
                          alt={inquiry.product.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {inquiry.user?.fullName || 'کاربر'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {inquiry.user?.phoneNumber}
                        </p>
                      </div>
                      
                      {inquiry.status === 'pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/inquiries/${inquiry.id}`);
                          }}
                        >
                          پاسخ دادن
                        </Button>
                      )}
                    </div>

                    {inquiry.userMessage && (
                      <div className="mt-2 bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          {inquiry.userMessage}
                        </p>
                      </div>
                    )}

                    {inquiry.jewelerResponseMessage && (
                      <div className="mt-2 bg-primary-50 rounded-lg p-3">
                        <p className="text-sm text-primary-700">
                          <span className="font-medium">پاسخ شما: </span>
                          {inquiry.jewelerResponseMessage}
                        </p>
                      </div>
                    )}

                    {inquiry.suggestedProducts && inquiry.suggestedProducts.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">
                          محصولات پیشنهادی: {inquiry.suggestedProducts.length} مورد
                        </p>
                        <div className="flex space-x-2 space-x-reverse overflow-x-auto">
                          {inquiry.suggestedProducts.slice(0, 3).map((product) => (
                            <div key={product.id} className="flex-shrink-0">
                              {product.productMedia?.find(m => m.isPrimary)?.mediaUrl ? (
                                <img
                                  src={product.productMedia.find(m => m.isPrimary).mediaUrl}
                                  alt={product.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          ))}
                          {inquiry.suggestedProducts.length > 3 && (
                            <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <span className="text-xs text-gray-500">
                                +{inquiry.suggestedProducts.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InquiriesPage;