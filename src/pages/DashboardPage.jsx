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
          productService.getMyProducts({ page: 1, limit: 1, sortBy: 'created_at', sortOrder: 'desc' }),
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
      onClick: () => navigate('/products/new'),
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
      <div className="p-4 space-y-6">
        <div className="bg-gradient-to-l from-primary-500 to-primary-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">سلام {user?.galleryName || 'کاربر عزیز'}</h2>
              <p className="text-primary-100 text-sm mt-1">به پنل مدیریت خوش آمدید</p>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.products?.length || 0}</p>
              <p className="text-primary-100 text-sm">محصولات</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.inquiries?.total || 0}</p>
              <p className="text-primary-100 text-sm">استعلام‌ها</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              padding="sm"
              hover
              onClick={action.onClick}
              className="relative"
            >
              <div className={`inline-flex p-3 rounded-xl ${action.color} mb-3`}>
                {action.icon}
              </div>
              {action.badge && (
                <Badge 
                  variant="danger" 
                  size="sm"
                  className="absolute top-2 left-2"
                >
                  {action.badge}
                </Badge>
              )}
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{action.title}</h3>
              <p className="text-gray-600 text-xs leading-relaxed">{action.description}</p>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">وضعیت اشتراک</h3>
              {getSubscriptionStatusBadge(stats.subscription)}
            </div>
            
            {stats.subscription ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">طرح فعلی:</span>
                  <span className="font-medium">{stats.subscription.plan?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">تاریخ انقضا:</span>
                  <span className="font-medium">
                    {new Date(stats.subscription.endDate).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {stats.subscription.daysRemaining <= 7 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                    <p className="text-yellow-800 text-sm">
                      اشتراک شما {stats.subscription.daysRemaining} روز دیگر منقضی می‌شود
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 text-sm mb-3">از طرح رایگان استفاده می‌کنید</p>
                <button
                  onClick={() => navigate('/subscription')}
                  className="text-primary-500 text-sm font-medium hover:text-primary-600"
                >
                  ارتقا به طرح پولی
                </button>
              </div>
            )}
          </Card>

          {stats.media && (
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">استفاده از فضای ذخیره‌سازی</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">تصاویر:</span>
                  <span className="font-medium">{stats.media.totalImages} عدد</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ویدیوها:</span>
                  <span className="font-medium">{stats.media.totalVideos} عدد</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">فضای استفاده شده:</span>
                    <span className="font-medium">
                      {Math.round(stats.media.storageUsagePercentage)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
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