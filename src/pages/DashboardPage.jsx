import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { inquiryService } from '../services/inquiries';
import { productService } from '../services/products';
import { subscriptionService } from '../services/subscriptions';
import { mediaService } from '../services/media';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    inquiries: null,
    products: null,
    subscription: null,
    media: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [inquiriesStats, productsData, subscriptionData, mediaStats] = await Promise.allSettled([
          inquiryService.getStats(),
          productService.getMyProducts({ page: 1, limit: 1, sortBy: 'createdAt', sortOrder: 'desc' }),
          subscriptionService.getCurrentSubscription(),
          mediaService.getStats(),
        ]);

        setStats({
          inquiries: inquiriesStats.status === 'fulfilled' ? inquiriesStats.value : null,
          products: productsData.status === 'fulfilled' ? productsData.value : null,
          subscription: subscriptionData.status === 'fulfilled' ? subscriptionData.value : null,
          media: mediaStats.status === 'fulfilled' ? mediaStats.value : null,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getSubscriptionStatusBadge = (subscription) => {
    if (!subscription) return <Badge variant="default">رایگان</Badge>;
    
    switch (subscription.status) {
      case 'active':
        return <Badge variant="success">فعال</Badge>;
      case 'expired':
        return <Badge variant="danger">منقضی شده</Badge>;
      default:
        return <Badge variant="warning">در انتظار</Badge>;
    }
  };

  const quickActions = [
    {
      title: 'افزودن محصول',
      description: 'محصول جدید اضافه کنید',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => navigate('/products/add'),
      color: 'text-primary-500 bg-primary-50',
    },
    {
      title: 'مدیریت استعلام‌ها',
      description: 'پاسخ به استعلام‌های مشتریان',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      ),
      onClick: () => navigate('/inquiries'),
      color: 'text-blue-500 bg-blue-50',
      badge: stats.inquiries?.pending > 0 ? stats.inquiries.pending : null,
    },
    {
      title: 'ویرایش پروفایل',
      description: 'اطلاعات گالری را بروزرسانی کنید',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      ),
      onClick: () => navigate('/profile/edit'),
      color: 'text-green-500 bg-green-50',
    },
    {
      title: 'مدیریت اشتراک',
      description: 'مشاهده و ارتقا اشتراک',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => navigate('/subscription'),
      color: 'text-gold-500 bg-gold-50',
    },
  ];

  if (loading) {
    return (
      <Layout title="داشبورد">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="داشبورد">
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl p-6 text-white overflow-hidden shadow-large">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-8 -translate-y-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-4 translate-y-4" />
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-gold-400 to-gold-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {user?.galleryName?.charAt(0) || 'ک'}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-shadow">سلام {user?.galleryName || 'کاربر عزیز'}</h2>
                  <p className="text-primary-100 text-sm mt-1">به پنل مدیریت خوش آمدید</p>
                </div>
              </div>
              
              <div className="hidden">
                <svg className="w-8 h-8 text-white/40" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-shadow">{stats.products?.length || 0}</p>
                <p className="text-primary-100 text-sm font-medium">محصولات</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                <div className="w-10 h-10 bg-white/20 rounded-xl mx-auto mb-2 flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-2xl font-bold text-shadow">{stats.inquiries?.total || 0}</p>
                <p className="text-primary-100 text-sm font-medium">استعلام‌ها</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">دسترسی سریع</h3>
            <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Card
                key={index}
                padding="sm"
                hover
                onClick={action.onClick}
                className="relative group overflow-hidden animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
                shadow="medium"
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-2xl ${action.color} mb-3 transition-transform duration-300 group-hover:scale-110`}>
                    {action.icon}
                  </div>
                  {action.badge && (
                    <div className="absolute -top-1 -left-1">
                      <div className="relative">
                        <Badge 
                          variant="danger" 
                          size="sm"
                          className="animate-bounce-subtle shadow-md"
                        >
                          {action.badge}
                        </Badge>
                        <div className="absolute inset-0 bg-danger-500 rounded-full animate-ping opacity-75" />
                      </div>
                    </div>
                  )}
                  <h3 className="font-bold text-gray-900 text-sm mb-1 group-hover:text-primary-600 transition-colors">{action.title}</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">{action.description}</p>
                </div>
                
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-gold-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">آمار و وضعیت</h3>
            <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full" />
          </div>
          
          {/* Subscription Status */}
          <Card shadow="medium" className="animate-slide-up" variant={stats.subscription ? 'success' : 'default'}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  stats.subscription ? 'bg-success-100' : 'bg-gray-100'
                }`}>
                  <svg className={`w-6 h-6 ${stats.subscription ? 'text-success-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">وضعیت اشتراک</h3>
                  <p className="text-sm text-gray-600">مدیریت برنامه اشتراک</p>
                </div>
              </div>
              {getSubscriptionStatusBadge(stats.subscription)}
            </div>
            
            {stats.subscription ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 mb-1">طرح فعلی</p>
                    <p className="font-bold text-gray-900">{stats.subscription.plan?.name}</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-600 mb-1">تاریخ انقضا</p>
                    <p className="font-bold text-gray-900">
                      {new Date(stats.subscription.endDate).toLocaleDateString('fa-IR')}
                    </p>
                  </div>
                </div>
                
                {stats.subscription.daysRemaining <= 7 && (
                  <div className="bg-gradient-to-r from-warning-50 to-warning-100 border border-warning-200 rounded-2xl p-4 mt-4">
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <div className="w-10 h-10 bg-warning-100 rounded-xl flex items-center justify-center">
                        <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-warning-800 text-sm font-medium">
                          اشتراک شما {stats.subscription.daysRemaining} روز دیگر منقضی می‌شود
                        </p>
                        <button 
                          onClick={() => navigate('/subscription')}
                          className="text-warning-700 text-xs font-semibold hover:text-warning-800 underline underline-offset-2"
                        >
                          تمدید اشتراک
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-600 text-sm mb-4">از طرح رایگان استفاده می‌کنید</p>
                <Button
                  onClick={() => navigate('/subscription')}
                  variant="gold"
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                >
                  ارتقا به طرح پولی
                </Button>
              </div>
            )}
          </Card>

          {/* Storage Usage */}
          {stats.media && (
            <Card shadow="medium" className="animate-slide-up" variant="primary" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center space-x-3 space-x-reverse mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">فضای ذخیره‌سازی</h3>
                  <p className="text-sm text-gray-600">مدیریت تصاویر و ویدیوها</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-xl p-3 text-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{stats.media.totalImages}</p>
                    <p className="text-xs text-gray-600">تصاویر</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3 text-center">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-lg font-bold text-gray-900">{stats.media.totalVideos}</p>
                    <p className="text-xs text-gray-600">ویدیوها</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700 font-medium">فضای استفاده شده</span>
                    <span className="text-sm font-bold text-primary-600">
                      {Math.round(stats.media.storageUsagePercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(stats.media.storageUsagePercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
