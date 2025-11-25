import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import Button from '../common/Button';
import Input from '../common/Input';
import Card from '../common/Card';

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { sendOtp, login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateOtp = (otp) => {
    return /^\d{6}$/.test(otp);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validatePhoneNumber(phoneNumber)) {
      setErrors({ phoneNumber: 'شماره موبایل وارد شده معتبر نیست' });
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setStep('otp');
      showSuccess('کد تایید با موفقیت ارسال شد');
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در ارسال کد تایید';
      setErrors({ phoneNumber: message });
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateOtp(otpCode)) {
      setErrors({ otpCode: 'کد تایید باید 6 رقم باشد' });
      return;
    }

    setOtpLoading(true);
    try {
      const response = await login(phoneNumber, otpCode);
      
      if (response.needsRegistration === true) {
        navigate('/register?phoneNumber=' + phoneNumber);
      } else if (response.isNewUser === true) {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
      
      showSuccess('ورود با موفقیت انجام شد');
    } catch (error) {
      const message = error.response?.data?.message || 'کد تایید نامعتبر است';
      setErrors({ otpCode: message });
      showError(message);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      showSuccess('کد تایید مجدداً ارسال شد');
    } catch (error) {
      showError('خطا در ارسال مجدد کد تایید');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtpCode('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-gold-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary-200/30 to-primary-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-gold-200/30 to-gold-300/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-primary-100/20 to-gold-100/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative z-10 animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large transform rotate-3 hover:rotate-0 transition-transform duration-500">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            {/* Floating elements */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-gold-400 rounded-full animate-bounce-subtle" />
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-primary-400 rounded-full animate-bounce-subtle" style={{animationDelay: '0.5s'}} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 gradient-text">پنل طلافروش</h1>
          <p className="text-gray-600 text-lg font-medium">زرناب</p>
          <div className="w-20 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full mx-auto mt-4" />
        </div>

        <Card shadow="large" className="animate-scale-in backdrop-blur-sm bg-white/95" variant="glass">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">ورود به حساب کاربری</h2>
                <p className="text-gray-600">شماره موبایل خود را وارد کنید</p>
              </div>

              <Input
                label="شماره موبایل"
                type="tel"
                placeholder="09xxxxxxxxx"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={errors.phoneNumber}
                required
                maxLength={11}
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                size="lg"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                }
              >
                ارسال کد تایید
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تایید شماره موبایل</h2>
                <p className="text-gray-600 leading-relaxed">
                  کد تایید ارسال شده به شماره
                  <span className="font-bold text-primary-600 mx-1 px-2 py-1 bg-primary-50 rounded-lg">{phoneNumber}</span>
                  را وارد کنید
                </p>
              </div>

              <Input
                label="کد تایید"
                type="text"
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                error={errors.otpCode}
                required
                maxLength={6}
              />

              <div className="space-y-4">
                <Button
                  type="submit"
                  fullWidth
                  loading={otpLoading}
                  variant="success"
                  size="lg"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                >
                  تایید و ورود
                </Button>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToPhone}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    }
                  >
                    تغییر شماره
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    loading={loading}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    ارسال مجدد کد
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>

        <div className="text-center mt-8 animate-fade-in">
          <div className="glass-effect rounded-2xl p-4 border border-gray-200/50">
            <p className="text-gray-600 text-sm leading-relaxed">
              با ورود به سیستم، 
              <button className="text-primary-600 hover:text-primary-700 font-medium mx-1 underline underline-offset-2 transition-colors">
                شرایط و قوانین
              </button>
              را می‌پذیرید
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
