import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { jewelerService } from '../services/jeweler';
import { useToast } from '../components/common/Toast';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formData, setFormData] = useState({
    galleryName: '',
    ownerName: '',
    address: '',
    city: '',
    province: '',
    logoUrl: '',
    coverImageUrl: '',
    aboutUs: '',
    location: {
      latitude: '',
      longitude: '',
    },
    workingHours: {
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '09:00', close: '18:00', closed: false },
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '', close: '', closed: true },
    },
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await jewelerService.getProfile();
      
      setFormData({
        galleryName: data.galleryName || '',
        ownerName: data.ownerName || '',
        address: data.address || '',
        city: data.city || '',
        province: data.province || '',
        logoUrl: data.logoUrl || '',
        coverImageUrl: data.coverImageUrl || '',
        aboutUs: data.aboutUs || '',
        location: {
          latitude: data.location?.latitude || '',
          longitude: data.location?.longitude || '',
        },
        workingHours: data.workingHours || {
          saturday: { open: '09:00', close: '18:00', closed: false },
          sunday: { open: '09:00', close: '18:00', closed: false },
          monday: { open: '09:00', close: '18:00', closed: false },
          tuesday: { open: '09:00', close: '18:00', closed: false },
          wednesday: { open: '09:00', close: '18:00', closed: false },
          thursday: { open: '09:00', close: '18:00', closed: false },
          friday: { open: '', close: '', closed: true },
        },
      });
    } catch (error) {
      showError('خطا در بارگذاری اطلاعات پروفایل');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.galleryName.trim()) {
      newErrors.galleryName = 'نام گالری الزامی است';
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = 'نام مالک الزامی است';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'آدرس الزامی است';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'نام شهر الزامی است';
    }
    if (!formData.province.trim()) {
      newErrors.province = 'نام استان الزامی است';
    }

    if (formData.location.latitude && (isNaN(formData.location.latitude) || Math.abs(formData.location.latitude) > 90)) {
      newErrors.latitude = 'عرض جغرافیایی معتبر نیست';
    }
    if (formData.location.longitude && (isNaN(formData.location.longitude) || Math.abs(formData.location.longitude) > 180)) {
      newErrors.longitude = 'طول جغرافیایی معتبر نیست';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    try {
      const updateData = {
        ...formData,
        location: formData.location.latitude && formData.location.longitude ? {
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude),
        } : undefined,
      };

      if (!updateData.location) {
        delete updateData.location;
      }

      const updatedProfile = await jewelerService.updateProfile(updateData);
      updateUser(updatedProfile);
      showSuccess('پروفایل با موفقیت بروزرسانی شد');
      navigate('/profile');
    } catch (error) {
      showError(error.response?.data?.message || 'خطا در بروزرسانی پروفایل');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
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
        [field]: value
      }));
    }

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleWorkingHourChange = (day, field, value) => {
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
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude.toFixed(6),
              longitude: position.coords.longitude.toFixed(6),
            }
          }));
          showSuccess('موقعیت فعلی شما دریافت شد');
        },
        (error) => {
          showError('دسترسی به موقعیت مکانی امکان‌پذیر نیست');
        }
      );
    } else {
      showError('مرورگر شما از تشخیص موقعیت مکانی پشتیبانی نمی‌کند');
    }
  };

  const weekDays = [
    { key: 'saturday', label: 'شنبه' },
    { key: 'sunday', label: 'یکشنبه' },
    { key: 'monday', label: 'دوشنبه' },
    { key: 'tuesday', label: 'سه‌شنبه' },
    { key: 'wednesday', label: 'چهارشنبه' },
    { key: 'thursday', label: 'پنج‌شنبه' },
    { key: 'friday', label: 'جمعه' },
  ];

  if (loading) {
    return (
      <Layout 
        title="ویرایش پروفایل" 
        showBackButton 
        onBack={() => navigate('/profile')}
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
      title="ویرایش پروفایل"
      showBackButton
      onBack={() => navigate('/profile')}
      showBottomNav={false}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">اطلاعات اصلی</h3>
            <div className="space-y-4">
              <Input
                label="نام گالری"
                value={formData.galleryName}
                onChange={(e) => handleInputChange('galleryName', e.target.value)}
                placeholder="طلا فروشی زرین"
                error={errors.galleryName}
                required
              />

              <Input
                label="نام مالک"
                value={formData.ownerName}
                onChange={(e) => handleInputChange('ownerName', e.target.value)}
                placeholder="احمد محمدی"
                error={errors.ownerName}
                required
              />

              <Input
                label="لینک لوگو (اختیاری)"
                value={formData.logoUrl}
                onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                placeholder="https://example.com/logo.jpg"
              />

              <Input
                label="لینک تصویر کاور (اختیاری)"
                value={formData.coverImageUrl}
                onChange={(e) => handleInputChange('coverImageUrl', e.target.value)}
                placeholder="https://example.com/cover.jpg"
              />

              <Textarea
                label="درباره ما"
                value={formData.aboutUs}
                onChange={(e) => handleInputChange('aboutUs', e.target.value)}
                placeholder="ما بیش از 20 سال تجربه در زمینه طلا و جواهرات داریم..."
                rows={4}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">اطلاعات آدرس</h3>
            <div className="space-y-4">
              <Textarea
                label="آدرس کامل"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="تهران، خیابان فردوسی، پلاک 123"
                error={errors.address}
                rows={3}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="شهر"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="تهران"
                  error={errors.city}
                  required
                />

                <Input
                  label="استان"
                  value={formData.province}
                  onChange={(e) => handleInputChange('province', e.target.value)}
                  placeholder="تهران"
                  error={errors.province}
                  required
                />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">موقعیت جغرافیایی</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
              >
                موقعیت فعلی
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="عرض جغرافیایی"
                  type="number"
                  step="0.000001"
                  value={formData.location.latitude}
                  onChange={(e) => handleInputChange('location.latitude', e.target.value)}
                  placeholder="35.689487"
                  error={errors.latitude}
                />

                <Input
                  label="طول جغرافیایی"
                  type="number"
                  step="0.000001"
                  value={formData.location.longitude}
                  onChange={(e) => handleInputChange('location.longitude', e.target.value)}
                  placeholder="51.389160"
                  error={errors.longitude}
                />
              </div>

              <p className="text-xs text-gray-500">
                برای دریافت موقعیت فعلی، روی دکمه "موقعیت فعلی" کلیک کنید یا مختصات را به صورت دستی وارد کنید.
              </p>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">ساعات کاری</h3>
            <div className="space-y-4">
              {weekDays.map((day) => (
                <div key={day.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">{day.label}</span>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${day.key}-closed`}
                        checked={formData.workingHours[day.key]?.closed || false}
                        onChange={(e) => handleWorkingHourChange(day.key, 'closed', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`${day.key}-closed`} className="mr-2 text-sm text-gray-700">
                        تعطیل
                      </label>
                    </div>
                  </div>

                  {!formData.workingHours[day.key]?.closed && (
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="ساعت شروع"
                        type="time"
                        value={formData.workingHours[day.key]?.open || ''}
                        onChange={(e) => handleWorkingHourChange(day.key, 'open', e.target.value)}
                      />

                      <Input
                        label="ساعت پایان"
                        type="time"
                        value={formData.workingHours[day.key]?.close || ''}
                        onChange={(e) => handleWorkingHourChange(day.key, 'close', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="pb-4">
            <Button
              type="submit"
              fullWidth
              loading={saveLoading}
              size="lg"
            >
              ذخیره تغییرات
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditProfilePage;