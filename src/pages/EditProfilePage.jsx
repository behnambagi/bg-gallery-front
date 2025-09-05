import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {jewelerService} from '../services/jeweler';
import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import Select from '../components/common/Select';
import BottomSheetSelect from '../components/common/BottomSheetSelect';
import { useToast } from '../components/common/Toast';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Card from "../components/common/Card.jsx";

const EditProfilePage = () => {

  const {updateProfile, getProfile} = jewelerService;
  const navigate = useNavigate();
  const { updateJewelerData } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    galleryName: '',
    ownerName: '',
    address: '',
    city: '',
    province: '',
    location: {
      latitude: '',
      longitude: ''
    },
    logoUrl: '',
    coverImageUrl: '',
    aboutUs: '',
    workingHours: {
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false },
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '', close: '', closed: true }
    }
  });

  const iranianCities = [
    'تهران', 'مشهد', 'اصفهان', 'کرج', 'تبریز', 'شیراز', 'اهواز', 'قم', 
    'رشت', 'کرمان', 'همدان', 'یزد', 'اردبیل', 'بندرعباس', 'آبادان'
  ];

  const iranianProvinces = [
    'تهران', 'خراسان رضوی', 'اصفهان', 'البرز', 'آذربایجان شرقی', 'فارس',
    'خوزستان', 'قم', 'گیلان', 'کرمان', 'همدان', 'یزد', 'اردبیل', 'هرمزگان'
  ];

  const dayNames = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه'
  };


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const profile = await getProfile();
      setFormData({
        galleryName: profile.galleryName || '',
        ownerName: profile.ownerName || '',
        address: profile.address || '',
        city: profile.city || '',
        province: profile.province || '',
        location: {
          latitude: profile.location?.latitude?.toString() || '',
          longitude: profile.location?.longitude?.toString() || ''
        },
        logoUrl: profile.logoUrl || '',
        coverImageUrl: profile.coverImageUrl || '',
        aboutUs: profile.aboutUs || '',
        workingHours: profile.workingHours || formData.workingHours
      });
    } catch (error) {
      showError('خطا در دریافت اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const getCurrentLocation = () => {
    setSubmitting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange('location.latitude', position.coords.latitude.toString());
          handleInputChange('location.longitude', position.coords.longitude.toString());
          showSuccess('موقعیت مکانی با موفقیت دریافت شد');
          setSubmitting(false);
        },
        (error) => {
          showError('خطا در دریافت موقعیت مکانی');
          setSubmitting(false);
        }
      );
    } else {
      showError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const required = ['galleryName', 'ownerName', 'address', 'city', 'province'];
    for (let field of required) {
      if (!formData[field]) {
        showError(`لطفاً ${getFieldLabel(field)} را وارد کنید`);
        return false;
      }
    }
    return true;
  };

  const getFieldLabel = (field) => {
    const labels = {
      galleryName: 'نام گالری',
      ownerName: 'نام مالک',
      address: 'آدرس',
      city: 'شهر',
      province: 'استان'
    };
    return labels[field] || field;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const submitData = { ...formData };
      
      if (!submitData.location.latitude || !submitData.location.longitude) {
        delete submitData.location;
      } else {
        submitData.location.latitude = parseFloat(submitData.location.latitude);
        submitData.location.longitude = parseFloat(submitData.location.longitude);
      }

      const updatedProfile = await updateProfile(submitData);
      updateJewelerData(updatedProfile);
      showSuccess('پروفایل با موفقیت بروزرسانی شد');
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در بروزرسانی پروفایل';
      showError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      title="ویرایش پروفایل" 
      showBackButton 
      onBack={() => navigate('/profile')}
    >
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ویرایش پروفایل</h1>
          <p className="text-gray-600">اطلاعات گالری خود را بروزرسانی کنید</p>
        </div>

        {/* Basic Information */}
        <Card shadow="medium" className="animate-slide-up">
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">اطلاعات کلی</h2>
              <p className="text-sm text-gray-600">نام و مشخصات گالری</p>
            </div>
          </div>
          
            <Input
              label="نام گالری *"
              value={formData.galleryName}
              onChange={(e) => handleInputChange('galleryName', e.target.value)}
              placeholder="نام گالری یا فروشگاه"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              }
            />

            <Input
              label="نام مالک *"
              value={formData.ownerName}
              onChange={(e) => handleInputChange('ownerName', e.target.value)}
              placeholder="نام و نام خانوادگی مالک"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />

            <Textarea
              label="آدرس *"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="آدرس کامل گالری"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-3">
              <BottomSheetSelect
                label="شهر *"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                options={iranianCities.map(city => ({ value: city, label: city }))}
                placeholder="انتخاب شهر"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />

              <BottomSheetSelect
                label="استان *"
                value={formData.province}
                onChange={(e) => handleInputChange('province', e.target.value)}
                options={iranianProvinces.map(province => ({ value: province, label: province }))}
                placeholder="انتخاب استان"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </div>
        </Card>

        {/* Location Section */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.1s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">موقعیت مکانی</h2>
              <p className="text-sm text-gray-600">مختصات جغرافیایی گالری</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="عرض جغرافیایی"
                value={formData.location.latitude}
                onChange={(e) => handleInputChange('location.latitude', e.target.value)}
                placeholder="35.6892"
                type="number"
                step="any"
              />
              <Input
                label="طول جغرافیایی"
                value={formData.location.longitude}
                onChange={(e) => handleInputChange('location.longitude', e.target.value)}
                placeholder="51.3890"
                type="number"
                step="any"
              />
            </div>
            <Button
              onClick={getCurrentLocation}
              variant="outline"
              fullWidth
              loading={submitting}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            >
              دریافت موقعیت فعلی
            </Button>
          </div>
        </Card>

        {/* Media Section */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">تصاویر گالری</h2>
              <p className="text-sm text-gray-600">لوگو و تصویر کاور</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <Input
              label="لینک لوگو"
              value={formData.logoUrl}
              onChange={(e) => handleInputChange('logoUrl', e.target.value)}
              placeholder="https://example.com/logo.jpg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
            />

            <Input
              label="لینک تصویر کاور"
              value={formData.coverImageUrl}
              onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
              placeholder="https://example.com/cover.jpg"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </Card>

        {/* About Section */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-gold-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gold-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">درباره گالری</h2>
              <p className="text-sm text-gray-600">معرفی و توضیحات</p>
            </div>
          </div>
          
          <Textarea
            label="درباره ما"
            value={formData.aboutUs}
            onChange={(e) => handleInputChange('aboutUs', e.target.value)}
            placeholder="توضیحی کوتاه درباره گالری، سابقه کار و تخصص‌ها"
            rows={4}
          />
        </Card>

        {/* Working Hours Section */}
        <Card shadow="medium" className="animate-slide-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center space-x-3 space-x-reverse mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">ساعات کاری</h2>
              <p className="text-sm text-gray-600">برنامه کاری هفتگی</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {Object.entries(formData.workingHours).map(([day, hours]) => (
              <div key={day} className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-900">{dayNames[day]}</span>
                  <label className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) => handleWorkingHoursChange(day, 'closed', e.target.checked)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-600">تعطیل</span>
                  </label>
                </div>

                {!hours.closed && (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">از ساعت</label>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">تا ساعت</label>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
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

export default EditProfilePage;
