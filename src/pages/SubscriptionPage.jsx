import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../services/subscriptions';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../components/common/Toast';
import Modal from '../components/common/Modal';

const SubscriptionPage = () => {
    const { getAllPlans, getCurrentSubscription, createSubscription, upgradeSubscription, getHistory } = subscriptionService;
    const [plans, setPlans] = useState([]);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [subscriptionHistory, setSubscriptionHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const { showSuccess, showError } = useToast();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedPricing, setSelectedPricing] = useState(null);
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [plansData, currentData, historyData] = await Promise.all([
                getAllPlans(),
                getCurrentSubscription().catch(() => null),
                getHistory().catch(() => [])
            ]);

            setPlans(plansData);
            setCurrentSubscription(currentData);
            setSubscriptionHistory(historyData);
        } catch (error) {
            console.log(error);
            showError('خطا در دریافت اطلاعات');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan, pricing) => {
        setSelectedPlan(plan);
        setSelectedPricing(pricing);
        setShowUpgradeModal(true);
    };

    const handleSubscribe = async () => {
        if (!selectedPricing) return;

        try {
            setSubmitting(true);

            if (currentSubscription) {
                await upgradeSubscription(selectedPricing.id);
                showSuccess('اشتراک با موفقیت ارتقا یافت');
            } else {
                await createSubscription(selectedPricing.id);
                showSuccess('اشتراک با موفقیت فعال شد');
            }

            setShowUpgradeModal(false);
            await fetchData();
        } catch (error) {
            const message = error.response?.data?.message || 'خطا در فعال‌سازی اشتراک';
            showError(message);
        } finally {
            setSubmitting(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
    };

    const calculateDiscountedPrice = (price, discountPercentage) => {
        return price - (price * discountPercentage / 100);
    };

    const getPlanBadgeVariant = (planName) => {
        switch (planName.toLowerCase()) {
            case 'basic': return 'secondary';
            case 'professional': return 'primary';
            case 'premium': return 'success';
            default: return 'secondary';
        }
    };

    const getPlanIcon = (planName) => {
        switch (planName.toLowerCase()) {
            case 'basic':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                );
            case 'professional':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                );
            case 'premium':
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                );
        }
    };

    const isCurrentPlan = (planId) => {
        return currentSubscription?.plan?.id === planId;
    };

    const canUpgrade = (planId) => {
        if (!currentSubscription) return true;
        return currentSubscription.plan.id < planId;
    };

    const getDaysRemaining = () => {
        if (!currentSubscription) return 0;
        const endDate = new Date(currentSubscription.endDate);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    if (loading) {
        return (
            <Layout title="مدیریت اشتراک">
                <div className="flex items-center justify-center h-64">
                    <LoadingSpinner size="lg" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="مدیریت اشتراک">
            <div className="px-3 py-2 space-y-3 animate-fade-in">
                {/* Compact Header */}
                <div className="text-center mb-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mx-auto mb-2 flex items-center justify-center shadow-md">
                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-bold text-gray-900 mb-1">مدیریت اشتراک</h1>
                    <p className="text-xs text-gray-600">بهترین طرح برای گالری خود را انتخاب کنید</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex bg-gray-100 rounded-lg p-0.5 animate-slide-up">
                    {[
                        { id: 'current', label: 'فعلی', icon: '💎' },
                        { id: 'plans', label: 'طرح‌ها', icon: '📦' },
                        { id: 'history', label: 'تاریخچه', icon: '📋' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 px-1 text-xs font-medium rounded-md transition-all duration-200 flex items-center justify-center space-x-1 space-x-reverse ${
                                activeTab === tab.id
                                    ? 'bg-white text-primary-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <span className="text-sm">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Current Subscription Tab */}
                {activeTab === 'current' && (
                    <div className="animate-scale-in">
                        {currentSubscription ? (
                            <Card shadow="sm" className="overflow-hidden">
                                <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 mb-3">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <div className="w-10 h-10 bg-primary-200 rounded-lg flex items-center justify-center text-primary-700">
                                                {getPlanIcon(currentSubscription.plan.name)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900">اشتراک فعال</h3>
                                                <Badge variant={getPlanBadgeVariant(currentSubscription.plan.name)} size="sm">
                                                    {currentSubscription.plan.name}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Badge variant={currentSubscription.status === 'active' ? 'success' : 'warning'} size="sm">
                                            {currentSubscription.status === 'active' ? 'فعال' : 'غیرفعال'}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-white/50 rounded-lg p-3 text-center">
                                            <div className="text-lg font-bold text-primary-600 mb-1">
                                                {getDaysRemaining()}
                                            </div>
                                            <div className="text-xs text-gray-600">روز باقی‌مانده</div>
                                        </div>
                                        <div className="bg-white/50 rounded-lg p-3 text-center">
                                            <div className="text-xs font-medium text-gray-900 mb-1">
                                                {new Date(currentSubscription.endDate).toLocaleDateString('fa-IR')}
                                            </div>
                                            <div className="text-xs text-gray-600">تاریخ انقضا</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-4 pb-4">
                                    <h4 className="font-bold text-sm text-gray-900 mb-3">امکانات فعلی</h4>
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {[
                                            { label: 'محصولات', value: currentSubscription.plan.productLimit === -1 ? 'نامحدود' : currentSubscription.plan.productLimit },
                                            { label: 'عکس‌ها', value: currentSubscription.plan.photoLimitPerProduct === -1 ? 'نامحدود' : currentSubscription.plan.photoLimitPerProduct },
                                            { label: 'آپلود ویدیو', value: currentSubscription.plan.videoUploadAllowed, isBoolean: true },
                                            { label: 'محصولات ویژه', value: currentSubscription.plan.canBeFeatured, isBoolean: true }
                                        ].map((feature, index) => (
                                            <div key={index} className="flex items-center space-x-2 space-x-reverse">
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                                                    feature.isBoolean 
                                                        ? feature.value ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                                        : 'bg-primary-100 text-primary-600'
                                                }`}>
                                                    {feature.isBoolean ? (
                                                        feature.value ? (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )
                                                    ) : (
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-900">{feature.label}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {feature.isBoolean ? (feature.value ? 'فعال' : 'غیرفعال') : feature.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => setActiveTab('plans')}
                                        variant="primary"
                                        size="sm"
                                        fullWidth
                                        icon={
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        }
                                    >
                                        ارتقا اشتراک
                                    </Button>
                                </div>
                            </Card>
                        ) : (
                            <Card shadow="sm" className="text-center py-12">
                                <div className="relative mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center transform rotate-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2">هنوز اشتراکی ندارید</h3>
                                <p className="text-gray-600 text-xs mb-6 max-w-xs mx-auto leading-relaxed">
                                    یکی از طرح‌های اشتراک را انتخاب کنید تا از امکانات کامل استفاده کنید
                                </p>
                                
                                <Button
                                    onClick={() => setActiveTab('plans')}
                                    variant="primary"
                                    size="sm"
                                    icon={
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                    }
                                >
                                    مشاهده طرح‌ها
                                </Button>
                            </Card>
                        )}
                    </div>
                )}

                {/* Plans Tab */}
                {activeTab === 'plans' && (
                    <div className="space-y-3 animate-scale-in">
                        {plans.map((plan, index) => (
                            <Card 
                                key={plan.id} 
                                shadow="sm"
                                className={`${isCurrentPlan(plan.id) ? 'ring-2 ring-primary-500 bg-primary-50/30' : ''} animate-slide-up`}
                                style={{animationDelay: `${index * 0.1}s`}}
                            >
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-3 space-x-reverse">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                                getPlanBadgeVariant(plan.name) === 'primary' ? 'bg-primary-100 text-primary-600' :
                                                getPlanBadgeVariant(plan.name) === 'success' ? 'bg-green-100 text-green-600' :
                                                'bg-gray-100 text-gray-600'
                                            }`}>
                                                {getPlanIcon(plan.name)}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-gray-900 mb-1">{plan.name}</h3>
                                                {isCurrentPlan(plan.id) && (
                                                    <Badge variant="success" size="sm">طرح فعلی</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-4">
                                        {[
                                            { icon: '📦', label: 'محصولات', value: plan.productLimit === -1 ? 'نامحدود' : plan.productLimit },
                                            { icon: '📸', label: 'عکس‌ها', value: plan.photoLimitPerProduct === -1 ? 'نامحدود' : plan.photoLimitPerProduct },
                                            { icon: '🎥', label: 'ویدیو', value: plan.videoUploadAllowed, isBoolean: true },
                                            { icon: '⭐', label: 'ویژه', value: plan.canBeFeatured, isBoolean: true }
                                        ].map((feature, featureIndex) => (
                                            <div key={featureIndex} className="bg-gray-50 rounded-lg p-2 flex items-center space-x-2 space-x-reverse">
                                                <span className="text-sm">{feature.icon}</span>
                                                <div>
                                                    <div className="text-xs font-medium text-gray-900">{feature.label}</div>
                                                    <div className="text-xs text-gray-600">
                                                        {feature.isBoolean ? (feature.value ? 'فعال' : 'غیرفعال') : feature.value}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Pricing Options */}
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-sm text-gray-900">گزینه‌های قیمت</h4>
                                        {plan.pricings.map((pricing) => (
                                            <div key={pricing.id} className="bg-white border border-gray-100 rounded-lg p-3 hover:border-primary-200 transition-colors">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 space-x-reverse">
                                                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-1 space-x-reverse">
                                                                <span className="font-bold text-sm text-gray-900">{pricing.durationMonths} ماهه</span>
                                                                {pricing.discountPercentage > 0 && (
                                                                    <Badge variant="success" size="sm">
                                                                        {pricing.discountPercentage}% تخفیف
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {pricing.discountPercentage > 0 && (
                                                                <div className="text-xs text-gray-500 line-through">
                                                                    {formatPrice(pricing.price)}
                                                                </div>
                                                            )}
                                                            <div className="text-sm font-bold text-primary-600">
                                                                {formatPrice(calculateDiscountedPrice(pricing.price, pricing.discountPercentage))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {!isCurrentPlan(plan.id) && canUpgrade(plan.id) && (
                                                        <Button
                                                            onClick={() => handleSelectPlan(plan, pricing)}
                                                            size="sm"
                                                            icon={
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            }
                                                        >
                                                            انتخاب
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-3 animate-scale-in">
                        {subscriptionHistory.length > 0 ? (
                            subscriptionHistory.map((subscription, index) => (
                                <Card 
                                    key={subscription.id} 
                                    shadow="sm"
                                    className="animate-slide-up"
                                    style={{animationDelay: `${index * 0.1}s`}}
                                >
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center space-x-2 space-x-reverse">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                    getPlanBadgeVariant(subscription.plan.name) === 'primary' ? 'bg-primary-100 text-primary-600' :
                                                    getPlanBadgeVariant(subscription.plan.name) === 'success' ? 'bg-green-100 text-green-600' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {getPlanIcon(subscription.plan.name)}
                                                </div>
                                                <div>
                                                    <Badge variant={getPlanBadgeVariant(subscription.plan.name)} size="sm">
                                                        {subscription.plan.name}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <Badge variant={subscription.status === 'active' ? 'success' : 'secondary'} size="sm">
                                                {subscription.status === 'active' ? 'فعال' : 'منقضی شده'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                                <div className="text-xs font-medium text-gray-900">
                                                    {new Date(subscription.startDate).toLocaleDateString('fa-IR')}
                                                </div>
                                                <div className="text-xs text-gray-600">تاریخ شروع</div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-2 text-center">
                                                <div className="text-xs font-medium text-gray-900">
                                                    {new Date(subscription.endDate).toLocaleDateString('fa-IR')}
                                                </div>
                                                <div className="text-xs text-gray-600">تاریخ پایان</div>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))
                        ) : (
                            <Card shadow="sm" className="text-center py-12">
                                <div className="relative mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center transform -rotate-3">
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                                
                                <h3 className="text-lg font-bold text-gray-900 mb-2">تاریخچه‌ای موجود نیست</h3>
                                <p className="text-gray-600 text-xs">هنوز هیچ اشتراکی فعال نکرده‌اید</p>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Upgrade Modal */}
            {showUpgradeModal && selectedPlan && selectedPricing && (
                <Modal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    title={currentSubscription ? 'ارتقا اشتراک' : 'فعال‌سازی اشتراک'}
                >
                    <div className="space-y-4">
                        <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl">
                            <div className="w-12 h-12 bg-primary-200 rounded-xl mx-auto mb-3 flex items-center justify-center text-primary-700">
                                {getPlanIcon(selectedPlan.name)}
                            </div>
                            <h3 className="font-bold text-lg mb-2 text-gray-900">{selectedPlan.name}</h3>
                            <div className="text-2xl font-bold text-primary-600 mb-1">
                                {formatPrice(calculateDiscountedPrice(selectedPricing.price, selectedPricing.discountPercentage))}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                                برای {selectedPricing.durationMonths} ماه
                            </div>
                            {selectedPricing.discountPercentage > 0 && (
                                <Badge variant="success" size="sm">
                                    {selectedPricing.discountPercentage}% تخفیف
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-sm text-gray-900">امکانات شامل:</h4>
                            <div className="grid grid-cols-1 gap-2">
                                {[
                                    { icon: '📦', label: `تا ${selectedPlan.productLimit === -1 ? 'نامحدود' : selectedPlan.productLimit} محصول` },
                                    { icon: '📸', label: `${selectedPlan.photoLimitPerProduct === -1 ? 'نامحدود' : selectedPlan.photoLimitPerProduct} عکس برای هر محصول` },
                                    ...(selectedPlan.videoUploadAllowed ? [{ icon: '🎥', label: 'امکان آپلود ویدیو' }] : []),
                                    ...(selectedPlan.canBeFeatured ? [{ icon: '⭐', label: 'نمایش در بخش محصولات ویژه' }] : [])
                                ].map((feature, index) => (
                                    <div key={index} className="flex items-center space-x-2 space-x-reverse bg-gray-50 rounded-lg p-2">
                                        <span className="text-sm">{feature.icon}</span>
                                        <span className="text-xs font-medium text-gray-900">{feature.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-3">
                            <Button
                                onClick={() => setShowUpgradeModal(false)}
                                variant="outline"
                                fullWidth
                                size="sm"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={handleSubscribe}
                                fullWidth
                                size="sm"
                                loading={submitting}
                                icon={
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                }
                            >
                                تایید و پرداخت
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};

export default SubscriptionPage;