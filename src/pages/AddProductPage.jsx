import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import BottomSheetSelect from '../components/common/BottomSheetSelect';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productService } from '../services/products';
import { categoryService } from '../services/categories';
import { useToast } from '../components/common/Toast';

const AddProductPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    productCode: '',
    description: '',
    weightGrams: '',
    karat: 18,
    goldType: 'yellow',
    laborChargeType: 'percentage',
    laborChargeValue: '',
    sellerProfitPercentage: 7,
    vatPercentage: 9,
    condition: 'new',
    dimensionsMm: {
      length: '',
      width: '',
      height: '',
      diameter: '',
    },
    ringSize: '',
    isSizable: false,
    hallmarkCode: '',
    manufacturerBrand: '',
    collectionName: '',
    finishType: '',
    claspType: '',
    chainType: '',
    earringBackingType: '',
    stoneDetails: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      showError('خطا در بارگذاری دسته‌بندی‌ها');
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.categoryId) newErrors.categoryId = 'انتخاب دسته‌بندی الزامی است';
        if (!formData.name.trim()) newErrors.name = 'نام محصول الزامی است';
        break;
      case 2:
        if (!formData.weightGrams || formData.weightGrams <= 0) newErrors.weightGrams = 'وزن محصول الزامی است';
        break;
      case 3:
        if (!formData.laborChargeValue || formData.laborChargeValue <= 0) newErrors.laborChargeValue = 'مقدار اجرت الزامی است';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      return;
    }

    setLoading(true);
    try {
      const productData = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        weightGrams: parseFloat(formData.weightGrams),
        karat: parseInt(formData.karat),
        laborChargeValue: parseFloat(formData.laborChargeValue),
        sellerProfitPercentage: parseFloat(formData.sellerProfitPercentage),
        vatPercentage: parseFloat(formData.vatPercentage),
        dimensionsMm: {
          length: formData.dimensionsMm.length ? parseFloat(formData.dimensionsMm.length) : undefined,
          width: formData.dimensionsMm.width ? parseFloat(formData.dimensionsMm.width) : undefined,
          height: formData.dimensionsMm.height ? parseFloat(formData.dimensionsMm.height) : undefined,
          diameter: formData.dimensionsMm.diameter ? parseFloat(formData.dimensionsMm.diameter) : undefined,
        },
      };

      // Remove empty optional string fields
      const optionalFields = ['claspType', 'chainType', 'earringBackingType', 'productCode', 'description', 'ringSize', 'hallmarkCode', 'manufacturerBrand', 'collectionName', 'finishType', 'stoneDetails'];
      optionalFields.forEach(field => {
        if (!productData[field] || productData[field].trim() === '') {
          delete productData[field];
        }
      });

      Object.keys(productData.dimensionsMm).forEach(key => {
        if (productData.dimensionsMm[key] === undefined) {
          delete productData.dimensionsMm[key];
        }
      });

      if (Object.keys(productData.dimensionsMm).length === 0) {
        delete productData.dimensionsMm;
      }

      const response = await productService.create(productData);
      showSuccess('محصول با موفقیت اضافه شد');
      navigate(`/products/edit/${response.id}`);
    } catch (error) {
      showError(error.response?.data?.message || 'خطا در افزودن محصول');
    } finally {
      setLoading(false);
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'اطلاعات کلی محصول';
      case 2: return 'مشخصات طلا';
      case 3: return 'قیمت‌گذاری';
      case 4: return 'ابعاد و مشخصات فیزیکی';
      case 5: return 'مشخصات اضافی';
      default: return 'افزودن محصول';
    }
  };

  const getStepIcon = () => {
    switch (currentStep) {
      case 1: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
      case 2: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
      case 3: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      );
      case 4: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      );
      case 5: return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
      default: return null;
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  const goldTypeOptions = [
    { value: 'yellow', label: 'طلای زرد' },
    { value: 'white', label: 'طلای سفید' },
    { value: 'rose_gold', label: 'طلای رز' },
  ];

  const karatOptions = [
    { value: 8, label: '8 عیار' },
    { value: 14, label: '14 عیار' },
    { value: 18, label: '18 عیار' },
    { value: 21, label: '21 عیار' },
    { value: 24, label: '24 عیار' },
  ];

  const laborChargeTypeOptions = [
    { value: 'percentage', label: 'درصدی' },
    { value: 'fixed_amount', label: 'مبلغ ثابت' },
  ];

  const conditionOptions = [
    { value: 'new', label: 'نو' },
    { value: 'second_hand', label: 'دست دوم' },
  ];

  const finishTypeOptions = [
    { value: 'polished', label: 'پولیش' },
    { value: 'matte', label: 'مات' },
    { value: 'brushed', label: 'براش' },
    { value: 'mirror_finish', label: 'آینه‌ای' },
    { value: 'sandblast', label: 'سندبلاست' },
  ];

  const claspTypeOptions = [
    { value: 'lobster', label: 'لابستر' },
    { value: 'spring_ring', label: 'حلقه فنری' },
    { value: 'parrot', label: 'طوطی' },
    { value: 'fold_over', label: 'تاشو' },
    { value: 'box', label: 'جعبه‌ای' },
    { value: 'magnetic', label: 'مغناطیسی' },
  ];

  const chainTypeOptions = [
    { value: 'figaro', label: 'فیگارو' },
    { value: 'curb', label: 'حلقه‌ای' },
    { value: 'cable', label: 'کابلی' },
    { value: 'rope', label: 'طنابی' },
    { value: 'ball', label: 'گوی' },
    { value: 'venetian', label: 'ونیزی' },
    { value: 'mariner', label: 'دریانوردی' },
  ];

  const earringBackingTypeOptions = [
    { value: 'push_back', label: 'پشت فشاری' },
    { value: 'screw_back', label: 'پشت پیچی' },
    { value: 'leverback', label: 'اهرمی' },
    { value: 'fish_hook', label: 'قلاب ماهی' },
    { value: 'clip_on', label: 'گیره‌ای' },
    { value: 'omega_back', label: 'پشت امگا' },
  ];

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-6">
              <BottomSheetSelect
                label="دسته‌بندی *"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                options={categoryOptions}
                error={errors.categoryId}
                placeholder="انتخاب دسته‌بندی"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />

              <Input
                label="نام محصول *"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="مثال: انگشتر طلا زرد"
                error={errors.name}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                }
              />

              <Input
                label="کد محصول"
                value={formData.productCode}
                onChange={(e) => handleInputChange('productCode', e.target.value)}
                placeholder="مثال: RNG001"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                }
              />

              <Textarea
                label="توضیحات محصول"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="توضیحات کامل در مورد محصول..."
                rows={3}
              />
            </div>
          </Card>
        );

      case 2:
        return (
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="وزن (گرم) *"
                  type="number"
                  step="0.1"
                  value={formData.weightGrams}
                  onChange={(e) => handleInputChange('weightGrams', e.target.value)}
                  placeholder="5.2"
                  error={errors.weightGrams}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                    </svg>
                  }
                />

                <BottomSheetSelect
                  label="عیار"
                  value={formData.karat}
                  onChange={(e) => handleInputChange('karat', e.target.value)}
                  options={karatOptions}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  }
                />
              </div>

              <BottomSheetSelect
                label="نوع طلا"
                value={formData.goldType}
                onChange={(e) => handleInputChange('goldType', e.target.value)}
                options={goldTypeOptions}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                }
              />

              <BottomSheetSelect
                label="وضعیت"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                options={conditionOptions}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>
          </Card>
        );

      case 3:
        return (
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <BottomSheetSelect
                  label="نوع اجرت"
                  value={formData.laborChargeType}
                  onChange={(e) => handleInputChange('laborChargeType', e.target.value)}
                  options={laborChargeTypeOptions}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                />

                <Input
                  label={`مقدار اجرت ${formData.laborChargeType === 'percentage' ? '(درصد)' : '(تومان)'} *`}
                  type="number"
                  step="0.1"
                  value={formData.laborChargeValue}
                  onChange={(e) => handleInputChange('laborChargeValue', e.target.value)}
                  placeholder="15.5"
                  error={errors.laborChargeValue}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="سود فروشنده (%)"
                  type="number"
                  step="0.1"
                  value={formData.sellerProfitPercentage}
                  onChange={(e) => handleInputChange('sellerProfitPercentage', e.target.value)}
                  placeholder="7"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  }
                />

                <Input
                  label="مالیات (%)"
                  type="number"
                  step="0.1"
                  value={formData.vatPercentage}
                  onChange={(e) => handleInputChange('vatPercentage', e.target.value)}
                  placeholder="9"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="طول (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.length}
                  onChange={(e) => handleInputChange('dimensionsMm.length', e.target.value)}
                  placeholder="25.5"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
                    </svg>
                  }
                />

                <Input
                  label="عرض (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.width}
                  onChange={(e) => handleInputChange('dimensionsMm.width', e.target.value)}
                  placeholder="15.2"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="ارتفاع (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.height}
                  onChange={(e) => handleInputChange('dimensionsMm.height', e.target.value)}
                  placeholder="5.1"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  }
                />

                <Input
                  label="قطر (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.diameter}
                  onChange={(e) => handleInputChange('dimensionsMm.diameter', e.target.value)}
                  placeholder="20"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="سایز انگشتر"
                  value={formData.ringSize}
                  onChange={(e) => handleInputChange('ringSize', e.target.value)}
                  placeholder="7"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  }
                />

                <div className="flex items-center justify-center">
                  <label className="flex items-center space-x-3 space-x-reverse bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.isSizable}
                      onChange={(e) => handleInputChange('isSizable', e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">قابل تغییر سایز</span>
                  </label>
                </div>
              </div>
            </div>
          </Card>
        );

      case 5:
        return (
          <Card shadow="medium" className="animate-slide-up">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="کد انگ"
                  value={formData.hallmarkCode}
                  onChange={(e) => handleInputChange('hallmarkCode', e.target.value)}
                  placeholder="HM123"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  }
                />

                <Input
                  label="برند سازنده"
                  value={formData.manufacturerBrand}
                  onChange={(e) => handleInputChange('manufacturerBrand', e.target.value)}
                  placeholder="برند طلا"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>

              <Input
                label="نام کلکسیون"
                value={formData.collectionName}
                onChange={(e) => handleInputChange('collectionName', e.target.value)}
                placeholder="کلکسیون بهار"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <BottomSheetSelect
                  label="نوع پرداخت"
                  value={formData.finishType}
                  onChange={(e) => handleInputChange('finishType', e.target.value)}
                  options={[{ value: '', label: 'انتخاب کنید' }, ...finishTypeOptions]}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  }
                />

                <BottomSheetSelect
                  label="نوع قفل"
                  value={formData.claspType}
                  onChange={(e) => handleInputChange('claspType', e.target.value)}
                  options={[{ value: '', label: 'انتخاب کنید' }, ...claspTypeOptions]}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <BottomSheetSelect
                  label="نوع زنجیر"
                  value={formData.chainType}
                  onChange={(e) => handleInputChange('chainType', e.target.value)}
                  options={[{ value: '', label: 'انتخاب کنید' }, ...chainTypeOptions]}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  }
                />

                <BottomSheetSelect
                  label="نوع پشت گوشواره"
                  value={formData.earringBackingType}
                  onChange={(e) => handleInputChange('earringBackingType', e.target.value)}
                  options={[{ value: '', label: 'انتخاب کنید' }, ...earringBackingTypeOptions]}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  }
                />
              </div>

              <Textarea
                label="جزئیات سنگ‌ها"
                value={formData.stoneDetails}
                onChange={(e) => handleInputChange('stoneDetails', e.target.value)}
                placeholder="نگین الماس 0.5 قیراط..."
                rows={2}
              />
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout 
      title="افزودن محصول جدید"
      showBackButton
      onBack={() => navigate('/products')}
      showBottomNav={false}
    >
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Header with Progress */}
        <Card shadow="medium" className="animate-slide-up">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-large text-white">
              {getStepIcon()}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{getStepTitle()}</h2>
            <p className="text-sm text-gray-600">مرحله {currentStep} از {totalSteps}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">پیشرفت</span>
              <span className="text-xs font-medium text-primary-600">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ${
                  index + 1 <= currentStep 
                    ? 'bg-primary-500 text-white shadow-md' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {index + 1 < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {index === 0 && 'کلی'}
                  {index === 1 && 'طلا'}
                  {index === 2 && 'قیمت'}
                  {index === 3 && 'ابعاد'}
                  {index === 4 && 'اضافی'}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Step Content */}
        <form onSubmit={handleSubmit}>
          {getStepContent()}
        </form>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pb-6">
          {currentStep > 1 && (
            <Button
              onClick={handlePrevStep}
              variant="outline"
              size="md"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            >
              قبلی
            </Button>
          )}
          
          <div className="flex-1">
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNextStep}
                fullWidth
                size="md"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                بعدی
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                fullWidth
                size="md"
                loading={loading}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                ایجاد محصول
              </Button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AddProductPage;