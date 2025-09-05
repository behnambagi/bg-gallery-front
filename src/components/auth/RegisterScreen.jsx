import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jewelerService } from '../../services/jeweler';
import Button from '../common/Button';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Select from '../common/Select';
import { useToast } from '../common/Toast';
import LoadingSpinner from '../common/LoadingSpinner';

const RegisterScreen = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { showSuccess, showError } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;
    const [formData, setFormData] = useState({
        galleryName: '',
        ownerName: '',
        phoneNumber: '',
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
        'رشت', 'کرمان', 'همدان', 'یزد', 'اردبیل', 'بندرعباس', 'آبادان',
        'زنجان', 'سنندج', 'قزوین', 'خرم‌آباد', 'گرگان', 'ساری', 'بیرجند',
        'کاشان', 'سمنان', 'بوشهر', 'دزفول', 'گیلان', 'مازندران'
    ];

    const iranianProvinces = [
        'تهران', 'خراسان رضوی', 'اصفهان', 'البرز', 'آذربایجان شرقی', 'فارس',
        'خوزستان', 'قم', 'گیلان', 'کرمان', 'همدان', 'یزد', 'اردبیل',
        'هرمزگان', 'زنجان', 'کردستان', 'قزوین', 'لرستان', 'گلستان',
        'مازندران', 'خراسان جنوبی', 'مرکزی', 'سمنان', 'بوشهر', 'خوزستان'
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
        setLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    handleInputChange('location.latitude', position.coords.latitude.toString());
                    handleInputChange('location.longitude', position.coords.longitude.toString());
                    showSuccess('موقعیت مکانی با موفقیت دریافت شد');
                    setLoading(false);
                },
                (error) => {
                    showError('خطا در دریافت موقعیت مکانی');
                    setLoading(false);
                }
            );
        } else {
            showError('مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند');
            setLoading(false);
        }
    };

    const validateStep = (step) => {
        const stepFields = {
            1: ['galleryName', 'ownerName', 'phoneNumber'],
            2: ['address', 'city', 'province'],
            3: [], // Optional fields
            4: [] // Working hours are optional
        };

        const required = stepFields[step] || [];
        for (let field of required) {
            if (!formData[field]) {
                showError(`لطفاً ${getFieldLabel(field)} را وارد کنید`);
                return false;
            }
        }

        if (step === 1 && !/^09\d{9}$/.test(formData.phoneNumber)) {
            showError('شماره موبایل باید با 09 شروع شده و 11 رقم باشد');
            return false;
        }

        return true;
    };

    const validateForm = () => {
        for (let step = 1; step <= totalSteps; step++) {
            if (!validateStep(step)) return false;
        }
        return true;
    };

    const getFieldLabel = (field) => {
        const labels = {
            galleryName: 'نام گالری',
            ownerName: 'نام مالک',
            phoneNumber: 'شماره موبایل',
            address: 'آدرس',
            city: 'شهر',
            province: 'استان'
        };
        return labels[field] || field;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const submitData = { ...formData };

            if (!submitData.location.latitude || !submitData.location.longitude) {
                delete submitData.location;
            } else {
                submitData.location.latitude = parseFloat(submitData.location.latitude);
                submitData.location.longitude = parseFloat(submitData.location.longitude);
            }

            await jewelerService.register(submitData);
            showSuccess('درخواست ثبت‌نام با موفقیت ارسال شد.');

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);
        } catch (error) {
            console.log(error);
            const message = error.response?.data?.message || 'خطا در ثبت‌نام';
            showError(message);
        } finally {
            setLoading(false);
        }
    };

    const getStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-large">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">اطلاعات گالری</h2>
                            <p className="text-gray-600">نام گالری و اطلاعات مالک</p>
                        </div>

                        <Input
                            label="نام گالری *"
                            value={formData.galleryName}
                            onChange={(e) => handleInputChange('galleryName', e.target.value)}
                            placeholder="گالری طلا و جواهرات"
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

                        <Input
                            label="شماره موبایل *"
                            value={formData.phoneNumber}
                            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                            placeholder="09123456789"
                            type="tel"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            }
                        />
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-large">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">آدرس و موقعیت</h2>
                            <p className="text-gray-600">آدرس گالری و موقعیت جغرافیایی</p>
                        </div>

                        <Textarea
                            label="آدرس *"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            placeholder="آدرس کامل گالری"
                            rows={3}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Select
                                label="شهر *"
                                value={formData.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                options={iranianCities.map(city => ({ value: city, label: city }))}
                                placeholder="انتخاب شهر"
                            />

                            <Select
                                label="استان *"
                                value={formData.province}
                                onChange={(e) => handleInputChange('province', e.target.value)}
                                options={iranianProvinces.map(province => ({ value: province, label: province }))}
                                placeholder="انتخاب استان"
                            />
                        </div>

                        <div className="bg-gray-50 rounded-2xl p-4">
                            <h3 className="font-semibold text-gray-900 mb-3">موقعیت مکانی (اختیاری)</h3>
                            <div className="grid grid-cols-2 gap-3 mb-3">
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
                                loading={loading}
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
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-large">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">تصاویر و معرفی</h2>
                            <p className="text-gray-600">لوگو، کاور و معرفی گالری (اختیاری)</p>
                        </div>

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

                        <Textarea
                            label="درباره ما"
                            value={formData.aboutUs}
                            onChange={(e) => handleInputChange('aboutUs', e.target.value)}
                            placeholder="توضیحی کوتاه درباره گالری، سابقه کار و تخصص‌ها"
                            rows={4}
                        />
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-large">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">ساعات کاری</h2>
                            <p className="text-gray-600">برنامه کاری هفتگی گالری</p>
                        </div>

                        <div className="space-y-3">
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
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gold-200/30 to-gold-300/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-3 h-3 bg-gold-400 rounded-full animate-bounce-subtle" />
                        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary-400 rounded-full animate-bounce-subtle" style={{animationDelay: '0.5s'}} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 gradient-text">ثبت‌نام گالری</h1>
                    <p className="text-gray-600 text-lg">ایجاد حساب کاربری طلافروش</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">مرحله {currentStep} از {totalSteps}</span>
                        <span className="text-sm font-medium text-primary-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                            className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2">
                        {Array.from({ length: totalSteps }, (_, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                                i + 1 <= currentStep ? 'bg-primary-500' : 'bg-gray-300'
                            }`} />
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-large p-6 mb-6">
                    {getStepContent()}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-3 mb-6">
                    {currentStep > 1 && (
                        <Button
                            onClick={prevStep}
                            variant="outline"
                            size="lg"
                            className="flex-1"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            }
                        >
                            قبلی
                        </Button>
                    )}
                    
                    {currentStep < totalSteps ? (
                        <Button
                            onClick={nextStep}
                            size="lg"
                            className="flex-1"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            }
                            iconPosition="right"
                        >
                            بعدی
                        </Button>
                    ) : (
                        <Button
                            onClick={handleSubmit}
                            size="lg"
                            className="flex-1"
                            loading={loading}
                            variant="success"
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            }
                        >
                            ثبت درخواست
                        </Button>
                    )}
                </div>

                {/* Login Link */}
                <div className="text-center">
                    <div className="glass-effect rounded-2xl p-4 border border-gray-200/50">
                        <p className="text-gray-600 text-sm">
                            حساب کاربری دارید؟
                            <button
                                onClick={() => navigate('/login')}
                                className="text-primary-600 hover:text-primary-700 font-medium mx-2 underline underline-offset-2 transition-colors"
                            >
                                ورود
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
