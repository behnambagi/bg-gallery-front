import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jewelerService } from '../services/jeweler';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LocationPage = () => {
  const { updateProfile, getProfile } = jewelerService;
  const navigate = useNavigate();
  const { updateJewelerData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [locationData, setLocationData] = useState({
    latitude: '',
    longitude: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setLocationData({
        latitude: profile.location?.latitude?.toString() || '',
        longitude: profile.location?.longitude?.toString() || '',
        address: profile.address || ''
      });
    } catch (error) {
      showError('خطا در دریافت اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getCurrentLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocationData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          showSuccess('موقعیت مکانی با موفقیت دریافت شد');
          setGettingLocation(false);
        },
        (error) => {
          let errorMessage = 'خطا در دریافت موقعیت مکانی';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'دسترسی به موقعیت مکانی رد شد';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'موقعیت مکانی در دسترس نیست';
              break;
            case error.TIMEOUT:
              errorMessage = 'زمان دریافت موقعیت مکانی تمام شد';
              break;
          }
          showError(errorMessage);
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      showError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
      setGettingLocation(false);
    }
  };

  const openInMaps = () => {
    if (locationData.latitude && locationData.longitude) {
      const url = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
      window.open(url, '_blank');
    } else {
      showError('ابتدا مختصات جغرافیایی را وارد کنید');
    }
  };

  const validateForm = () => {
    if (!locationData.address.trim()) {
      showError('آدرس الزامی است');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const updateData = {
        address: locationData.address,
        ...(locationData.latitude && locationData.longitude && {
          location: {
            latitude: parseFloat(locationData.latitude),
            longitude: parseFloat(locationData.longitude)
          }
        })
      };

      const updatedProfile = await updateProfile(updateData);
      updateJewelerData(updatedProfile);
      showSuccess('اطلاعات موقعیت مکانی با موفقیت بروزرسانی شد');
      navigate('/profile');
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در بروزرسانی اطلاعات';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateMapsLink = () => {
    if (locationData.address) {
      return `https://www.google.com/maps/search/${encodeURIComponent(locationData.address)}`;
    }
    return null;
  };

  const searchAddressInMaps = () => {
    const mapsLink = generateMapsLink();
    if (mapsLink) {
      window.open(mapsLink, '_blank');
    } else {
      showError('ابتدا آدرس را وارد کنید');
    }
  };

  if (loading) {
    return (
      <Layout title="موقعیت مکانی" showBackButton onBack={() => navigate('/profile')}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="موقعیت مکانی" 
      showBackButton 
      onBack={() => navigate('/profile')}
    >
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">موقعیت مکانی گالری</h1>
          <p className="text-gray-600">آدرس و مختصات جغرافیایی گالری خود را تنظیم کنید</p>
        </div>

        {/* Address Section */}
        <Card shadow="medium" className="animate-slide-up">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">آدرس گالری</h2>
              <p className="text-sm text-gray-600">آدرس کامل محل گالری</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={locationData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="آدرس کامل گالری را وارد کنید..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all duration-200 resize-none"
            />
            
            <Button
              onClick={searchAddressInMaps}
              variant="outline"
              fullWidth
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            >
              جستجو در نقشه
            </Button>
          </div>
        </Card>

        {/* Coordinates Section */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">مختصات جغرافیایی</h2>
              <p className="text-sm text-gray-600">موقعیت دقیق بر روی نقشه</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="عرض جغرافیایی"
                value={locationData.latitude}
                onChange={(e) => handleInputChange('latitude', e.target.value)}
                placeholder="35.6892"
                type="number"
                step="any"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                }
              />
              <Input
                label="طول جغرافیایی"
                value={locationData.longitude}
                onChange={(e) => handleInputChange('longitude', e.target.value)}
                placeholder="51.3890"
                type="number"
                step="any"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                }
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={getCurrentLocation}
                loading={gettingLocation}
                fullWidth
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              >
                موقعیت فعلی
              </Button>
              
              <Button
                onClick={openInMaps}
                variant="outline"
                fullWidth
                disabled={!locationData.latitude || !locationData.longitude}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                }
              >
                نمایش در نقشه
              </Button>
            </div>
          </div>
        </Card>

        {/* Location Help */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">راهنما</h3>
              <p className="text-sm text-gray-600">نکاتی برای بهتر تنظیم کردن موقعیت</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>آدرس کامل و دقیق گالری خود را وارد کنید</p>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>برای دریافت موقعیت فعلی، دسترسی به مکان را مجاز کنید</p>
            </div>
            
            <div className="flex items-start space-x-3 space-x-reverse">
              <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>مختصات جغرافیایی کمک می‌کند مشتریان شما را بهتر پیدا کنند</p>
            </div>
          </div>
        </Card>

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

export default LocationPage;