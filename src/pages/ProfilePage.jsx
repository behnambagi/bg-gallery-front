import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { jewelerService } from '../services/jeweler';
import { subscriptionService } from '../services/subscriptions';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchSubscription();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await jewelerService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSubscription = async () => {
    try {
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">فعال</Badge>;
      case 'pending':
        return <Badge variant="warning">در انتظار تایید</Badge>;
      case 'suspended':
        return <Badge variant="danger">تعلیق شده</Badge>;
      case 'rejected':
        return <Badge variant="danger">رد شده</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (status) => {
    if (!subscription) return <Badge variant="default">رایگان</Badge>;
    
    switch (status) {
      case 'active':
        return <Badge variant="success">فعال</Badge>;
      case 'expired':
        return <Badge variant="danger">منقضی شده</Badge>;
      default:
        return <Badge variant="warning">در انتظار</Badge>;
    }
  };

  const profileMenuItems = [
    {
      id: 'edit-profile',
      title: 'ویرایش پروفایل',
      description: 'اطلاعات گالری و تنظیمات حساب',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      onClick: () => navigate('/profile/edit'),
      color: 'text-blue-500',
    },
    {
      id: 'subscription',
      title: 'مدیریت اشتراک',
      description: 'مشاهده و ارتقا طرح اشتراک',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => navigate('/subscription'),
      color: 'text-gold-500',
      badge: subscription && subscription.daysRemaining <= 7 ? 'هشدار' : null,
    },
    {
      id: 'working-hours',
      title: 'ساعات کاری',
      description: 'تنظیم ساعات کاری گالری',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      onClick: () => navigate('/profile/working-hours'),
      color: 'text-green-500',
    },
    {
      id: 'location',
      title: 'موقعیت مکانی',
      description: 'تنظیم آدرس و موقعیت گالری',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      onClick: () => navigate('/profile/location'),
      color: 'text-purple-500',
    },
  ];

  if (loading) {
    return (
      <Layout title="پروفایل">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="پروفایل">
      <div className="p-4 space-y-4">
        <Card>
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              {profile?.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="لوگوی گالری"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {profile?.galleryName || 'گالری طلا'}
            </h2>
            
            <p className="text-gray-600 mb-3">
              {profile?.ownerName || user?.galleryName}
            </p>
            
            <div className="flex items-center justify-center space-x-2 space-x-reverse">
              {getStatusBadge(profile?.status || 'pending')}
              {profile?.isVerified && (
                <Badge variant="info" size="sm">تایید شده</Badge>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary-500">
                  {profile?.productCount || 0}
                </p>
                <p className="text-gray-600 text-sm">محصولات</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">
                  {subscription ? subscription.plan?.name : 'رایگان'}
                </p>
                <p className="text-gray-600 text-sm">طرح اشتراک</p>
              </div>
            </div>
          </div>

          {profile?.address && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{profile.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {profile.city} • {profile.province}
                  </p>
                </div>
              </div>
            </div>
          )}

          {profile?.phoneNumber && (
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-sm text-gray-600">{profile.phoneNumber}</p>
              </div>
            </div>
          )}
        </Card>

        {subscription && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">اشتراک فعلی</h3>
              {getSubscriptionBadge(subscription.status)}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">طرح:</span>
                <span className="font-medium">{subscription.plan?.name}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">تاریخ انقضا:</span>
                <span className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString('fa-IR')}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">روزهای باقی‌مانده:</span>
                <span className={`font-medium ${subscription.daysRemaining <= 7 ? 'text-red-500' : 'text-green-500'}`}>
                  {subscription.daysRemaining} روز
                </span>
              </div>
            </div>

            {subscription.daysRemaining <= 7 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <div className="flex items-start space-x-2 space-x-reverse">
                  <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-yellow-800 font-medium text-sm">تاریخ انقضا نزدیک است</p>
                    <p className="text-yellow-700 text-xs mt-1">برای عدم قطع سرویس، اشتراک خود را تمدید کنید</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        <div className="space-y-3">
          {profileMenuItems.map((item) => (
            <Card
              key={item.id}
              padding="sm"
              hover
              onClick={item.onClick}
              className="relative"
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
                  {item.icon}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                
                <div className="flex items-center space-x-2 space-x-reverse">
                  {item.badge && (
                    <Badge variant="warning" size="sm">
                      {item.badge}
                    </Badge>
                  )}
                  
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card>
          <div className="text-center py-4">
            <h3 className="font-medium text-gray-900 mb-2">نیاز به پشتیبانی دارید؟</h3>
            <p className="text-gray-600 text-sm mb-4">
              تیم پشتیبانی زرناب آماده کمک به شماست
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.open('tel:02188888888', '_self');
              }}
            >
              تماس با پشتیبانی
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfilePage;