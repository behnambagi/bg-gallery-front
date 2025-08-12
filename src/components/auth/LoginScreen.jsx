import React, { useState } from 'react';
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
      await login(phoneNumber, otpCode);
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">پنل طلافروش</h1>
          <p className="text-gray-600">زرناب</p>
        </div>

        <Card>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">ورود به حساب کاربری</h2>
                <p className="text-gray-600 text-sm">شماره موبایل خود را وارد کنید</p>
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
              >
                ارسال کد تایید
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">تایید شماره موبایل</h2>
                <p className="text-gray-600 text-sm">
                  کد تایید ارسال شده به شماره
                  <span className="font-medium text-gray-900 mx-1">{phoneNumber}</span>
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

              <div className="space-y-3">
                <Button
                  type="submit"
                  fullWidth
                  loading={otpLoading}
                >
                  تایید و ورود
                </Button>

                <div className="flex justify-between items-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleBackToPhone}
                  >
                    تغییر شماره
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResendOtp}
                    loading={loading}
                  >
                    ارسال مجدد کد
                  </Button>
                </div>
              </div>
            </form>
          )}
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            با ورود به سیستم، 
            <span className="text-primary-500 mx-1">شرایط و قوانین</span>
            را می‌پذیرید
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;