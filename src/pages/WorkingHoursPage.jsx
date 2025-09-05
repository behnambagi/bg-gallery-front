import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jewelerService } from '../services/jeweler';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WorkingHoursPage = () => {
  const { updateProfile, getProfile } = jewelerService;
  const navigate = useNavigate();
  const { updateJewelerData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [workingHours, setWorkingHours] = useState({
    saturday: { open: '09:00', close: '18:00', closed: false },
    sunday: { open: '09:00', close: '18:00', closed: false },
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '', close: '', closed: true }
  });

  const dayNames = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه'
  };

  const dayIcons = {
    saturday: '📅',
    sunday: '☀️',
    monday: '💼',
    tuesday: '📊',
    wednesday: '🔄',
    thursday: '📋',
    friday: '🕌'
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      if (profile.workingHours) {
        setWorkingHours(profile.workingHours);
      }
    } catch (error) {
      showError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const updatedProfile = await updateProfile({ workingHours });
      updateJewelerData(updatedProfile);
      showSuccess('ساعات کاری با موفقیت بروزرسانی شد');
      navigate('/profile');
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در بروزرسانی ساعات کاری';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleAllDays = (closed) => {
    const newWorkingHours = { ...workingHours };
    Object.keys(newWorkingHours).forEach(day => {
      if (day !== 'friday') { // Keep Friday as is
        newWorkingHours[day] = {
          ...newWorkingHours[day],
          closed,
          open: closed ? '' : '09:00',
          close: closed ? '' : '18:00'
        };
      }
    });
    setWorkingHours(newWorkingHours);
  };

  const presetSchedules = [
    {
      name: 'کاری عادی',
      icon: '🏢',
      schedule: {
        saturday: { open: '09:00', close: '18:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: false },
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '', close: '', closed: true }
      }
    },
    {
      name: 'کاری طولانی',
      icon: '⏰',
      schedule: {
        saturday: { open: '08:00', close: '20:00', closed: false },
        sunday: { open: '08:00', close: '20:00', closed: false },
        monday: { open: '08:00', close: '20:00', closed: false },
        tuesday: { open: '08:00', close: '20:00', closed: false },
        wednesday: { open: '08:00', close: '20:00', closed: false },
        thursday: { open: '08:00', close: '20:00', closed: false },
        friday: { open: '', close: '', closed: true }
      }
    },
    {
      name: 'آخر هفته باز',
      icon: '🛍️',
      schedule: {
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '09:00', close: '18:00', closed: false },
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '10:00', close: '16:00', closed: false }
      }
    }
  ];

  if (loading) {
    return (
      <Layout title="ساعات کاری" showBackButton onBack={() => navigate('/profile')}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="ساعات کاری" 
      showBackButton 
      onBack={() => navigate('/profile')}
    >
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ساعات کاری گالری</h1>
          <p className="text-gray-600">برنامه کاری هفتگی خود را تنظیم کنید</p>
        </div>

        {/* Quick Actions */}
        <Card shadow="medium" className="animate-slide-up">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2 space-x-reverse">
              <span className="text-lg">⚡</span>
              <span>تنظیمات سریع</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button
                onClick={() => toggleAllDays(false)}
                variant="outline"
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                باز کردن همه
              </Button>
              <Button
                onClick={() => toggleAllDays(true)}
                variant="outline"
                size="sm"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                }
              >
                بستن همه
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">الگوهای آماده:</h4>
              <div className="grid grid-cols-1 gap-2">
                {presetSchedules.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setWorkingHours(preset.schedule)}
                    className="flex items-center space-x-3 space-x-reverse p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-right"
                  >
                    <span className="text-lg">{preset.icon}</span>
                    <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Working Hours */}
        <div className="space-y-3">
          {Object.entries(workingHours).map(([day, hours], index) => (
            <Card 
              key={day} 
              shadow="medium" 
              className="animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-2xl">{dayIcons[day]}</span>
                    <div>
                      <h3 className="font-bold text-gray-900">{dayNames[day]}</h3>
                      <p className="text-sm text-gray-600">
                        {hours.closed ? 'تعطیل' : `${hours.open} - ${hours.close}`}
                      </p>
                    </div>
                  </div>
                  
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                      className="w-5 h-5 text-primary-600 bg-gray-100 border-gray-300 rounded-lg focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">تعطیل</span>
                  </label>
                </div>

                {!hours.closed && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ساعت باز شدن</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={hours.open}
                            onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ساعت بسته شدن</label>
                        <div className="relative">
                          <input
                            type="time"
                            value={hours.close}
                            onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-6">
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            size="md"
            fullWidth
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          >
            انصراف
          </Button>
          <Button
            onClick={handleSubmit}
            size="md"
            fullWidth
            loading={submitting}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
          >
            ذخیره تغییرات
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default WorkingHoursPage;