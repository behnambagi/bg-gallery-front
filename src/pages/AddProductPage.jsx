import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'انتخاب دسته‌بندی الزامی است';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'نام محصول الزامی است';
    }
    if (!formData.weightGrams || formData.weightGrams <= 0) {
      newErrors.weightGrams = 'وزن محصول الزامی است';
    }
    if (!formData.laborChargeValue || formData.laborChargeValue <= 0) {
      newErrors.laborChargeValue = 'مقدار اجرت الزامی است';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      navigate(`/products/${response.id}/edit`);
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

  return (
    <Layout 
      title="افزودن محصول جدید"
      showBackButton
      onBack={() => navigate('/products')}
      showBottomNav={false}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">اطلاعات اصلی</h3>
            <div className="space-y-4">
              <Select
                label="دسته‌بندی"
                value={formData.categoryId}
                onChange={(e) => handleInputChange('categoryId', e.target.value)}
                options={categoryOptions}
                error={errors.categoryId}
                required
              />

              <Input
                label="نام محصول"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="مثال: انگشتر طلا زرد"
                error={errors.name}
                required
              />

              <Input
                label="کد محصول"
                value={formData.productCode}
                onChange={(e) => handleInputChange('productCode', e.target.value)}
                placeholder="مثال: RNG001"
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

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">مشخصات طلا</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="وزن (گرم)"
                  type="number"
                  step="0.1"
                  value={formData.weightGrams}
                  onChange={(e) => handleInputChange('weightGrams', e.target.value)}
                  placeholder="5.2"
                  error={errors.weightGrams}
                  required
                />

                <Select
                  label="عیار"
                  value={formData.karat}
                  onChange={(e) => handleInputChange('karat', e.target.value)}
                  options={karatOptions}
                />
              </div>

              <Select
                label="نوع طلا"
                value={formData.goldType}
                onChange={(e) => handleInputChange('goldType', e.target.value)}
                options={goldTypeOptions}
              />

              <Select
                label="وضعیت"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                options={conditionOptions}
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">قیمت‌گذاری</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="نوع اجرت"
                  value={formData.laborChargeType}
                  onChange={(e) => handleInputChange('laborChargeType', e.target.value)}
                  options={laborChargeTypeOptions}
                />

                <Input
                  label={`مقدار اجرت ${formData.laborChargeType === 'percentage' ? '(درصد)' : '(تومان)'}`}
                  type="number"
                  step="0.1"
                  value={formData.laborChargeValue}
                  onChange={(e) => handleInputChange('laborChargeValue', e.target.value)}
                  placeholder="15.5"
                  error={errors.laborChargeValue}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="سود فروشنده (%)"
                  type="number"
                  step="0.1"
                  value={formData.sellerProfitPercentage}
                  onChange={(e) => handleInputChange('sellerProfitPercentage', e.target.value)}
                  placeholder="7"
                />

                <Input
                  label="مالیات (%)"
                  type="number"
                  step="0.1"
                  value={formData.vatPercentage}
                  onChange={(e) => handleInputChange('vatPercentage', e.target.value)}
                  placeholder="9"
                />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">ابعاد و مشخصات فیزیکی</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="طول (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.length}
                  onChange={(e) => handleInputChange('dimensionsMm.length', e.target.value)}
                  placeholder="25.5"
                />

                <Input
                  label="عرض (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.width}
                  onChange={(e) => handleInputChange('dimensionsMm.width', e.target.value)}
                  placeholder="15.2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="ارتفاع (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.height}
                  onChange={(e) => handleInputChange('dimensionsMm.height', e.target.value)}
                  placeholder="5.1"
                />

                <Input
                  label="قطر (میلی‌متر)"
                  type="number"
                  step="0.1"
                  value={formData.dimensionsMm.diameter}
                  onChange={(e) => handleInputChange('dimensionsMm.diameter', e.target.value)}
                  placeholder="20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="سایز انگشتر"
                  value={formData.ringSize}
                  onChange={(e) => handleInputChange('ringSize', e.target.value)}
                  placeholder="7"
                />

                <div className="flex items-center pt-8">
                  <input
                    type="checkbox"
                    id="isSizable"
                    checked={formData.isSizable}
                    onChange={(e) => handleInputChange('isSizable', e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="isSizable" className="mr-2 text-sm text-gray-700">
                    قابل تغییر سایز
                  </label>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">مشخصات اضافی</h3>
            <div className="space-y-4">
              <Input
                label="کد انگ"
                value={formData.hallmarkCode}
                onChange={(e) => handleInputChange('hallmarkCode', e.target.value)}
                placeholder="HM123"
              />

              <Input
                label="برند سازنده"
                value={formData.manufacturerBrand}
                onChange={(e) => handleInputChange('manufacturerBrand', e.target.value)}
                placeholder="برند طلا"
              />

              <Input
                label="نام کلکسیون"
                value={formData.collectionName}
                onChange={(e) => handleInputChange('collectionName', e.target.value)}
                placeholder="کلکسیون بهار"
              />

              <Select
                label="نوع پرداخت"
                value={formData.finishType}
                onChange={(e) => handleInputChange('finishType', e.target.value)}
                options={[
                  { value: '', label: 'انتخاب کنید' },
                  ...finishTypeOptions
                ]}
              />

              <Textarea
                label="جزئیات سنگ‌ها"
                value={formData.stoneDetails}
                onChange={(e) => handleInputChange('stoneDetails', e.target.value)}
                placeholder="نگین الماس 0.5 قیراط..."
                rows={2}
              />
            </div>
          </Card>

          <div className="pb-4">
            <Button
              type="submit"
              fullWidth
              loading={loading}
              size="lg"
            >
              افزودن محصول
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddProductPage;