import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Textarea from '../components/common/Textarea';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productService } from '../services/products';
import { categoryService } from '../services/categories';
import { mediaService } from '../services/media';
import { useToast } from '../components/common/Toast';

const EditProductPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchCategories();
      fetchMedia();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productService.getById(id);
      setProduct(data);
      
      setFormData({
        categoryId: data.category?.id || '',
        name: data.name || '',
        productCode: data.productCode || '',
        description: data.description || '',
        weightGrams: data.weightGrams || '',
        karat: data.karat || 18,
        goldType: data.goldType || 'yellow',
        laborChargeType: data.laborChargeType || 'percentage',
        laborChargeValue: data.laborChargeValue || '',
        sellerProfitPercentage: data.sellerProfitPercentage || 7,
        vatPercentage: data.vatPercentage || 9,
        condition: data.condition || 'new',
        dimensionsMm: {
          length: data.specifications?.dimensions?.length || '',
          width: data.specifications?.dimensions?.width || '',
          height: data.specifications?.dimensions?.height || '',
          diameter: data.specifications?.dimensions?.diameter || '',
        },
        ringSize: data.specifications?.ringSize || '',
        isSizable: data.specifications?.isSizable || false,
        hallmarkCode: data.specifications?.hallmarkCode || '',
        manufacturerBrand: data.specifications?.manufacturerBrand || '',
        collectionName: data.specifications?.collectionName || '',
        finishType: data.specifications?.finishType || '',
        claspType: data.specifications?.claspType || '',
        chainType: data.specifications?.chainType || '',
        earringBackingType: data.specifications?.earringBackingType || '',
        stoneDetails: data.specifications?.stoneDetails || '',
      });
    } catch (error) {
      showError('خطا در بارگذاری محصول');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMedia = async () => {
    try {
      const data = await mediaService.getProductMedia(id);
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadLoading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      formData.append('primaryIndex', 0);

      await mediaService.uploadProductMedia(id, formData);
      showSuccess('تصاویر با موفقیت آپلود شدند');
      fetchMedia();
    } catch (error) {
      showError('خطا در آپلود تصاویر');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('آیا از حذف این تصویر اطمینان دارید؟')) {
      return;
    }

    try {
      const updatedMedia = media.filter(m => m.id !== mediaId);
      const mediaOrder = updatedMedia.map((m, index) => ({
        id: m.id,
        isPrimary: index === 0
      }));

      await mediaService.updateMediaOrder(id, mediaOrder);
      showSuccess('تصویر حذف شد');
      fetchMedia();
    } catch (error) {
      showError('خطا در حذف تصویر');
    }
  };

  const handleSetPrimaryImage = async (mediaId) => {
    try {
      const mediaOrder = media.map(m => ({
        id: m.id,
        isPrimary: m.id === mediaId
      }));

      await mediaService.updateMediaOrder(id, mediaOrder);
      showSuccess('تصویر اصلی تغییر کرد');
      fetchMedia();
    } catch (error) {
      showError('خطا در تنظیم تصویر اصلی');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryId) {
      newErrors.categoryId = 'انتخاب دسته‌بندی الزامی است';
    }
    if (!formData.name?.trim()) {
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

    setSaveLoading(true);
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

      await productService.update(id, productData);
      showSuccess('محصول با موفقیت بروزرسانی شد');
      navigate('/products');
    } catch (error) {
      showError(error.response?.data?.message || 'خطا در بروزرسانی محصول');
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

  if (loading) {
    return (
      <Layout title="ویرایش محصول" showBackButton onBack={() => navigate('/products')} showBottomNav={false}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }));

  return (
    <Layout 
      title="ویرایش محصول"
      showBackButton
      onBack={() => navigate('/products')}
      showBottomNav={false}
    >
      <div className="p-4">
        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">تصاویر محصول</h3>
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadLoading}
                />
                <div className="flex items-center space-x-2 space-x-reverse text-primary-500 text-sm">
                  {uploadLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  )}
                  <span>{uploadLoading ? 'در حال آپلود...' : 'افزودن تصویر'}</span>
                </div>
              </label>
            </div>

            {media.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.mediaUrl}
                      alt={item.altText || 'تصویر محصول'}
                      className={`w-full h-32 object-cover rounded-lg ${
                        item.isPrimary ? 'ring-2 ring-primary-500' : ''
                      }`}
                    />
                    {item.isPrimary && (
                      <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs px-2 py-1 rounded">
                        اصلی
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2 space-x-reverse">
                      {!item.isPrimary && (
                        <button
                          onClick={() => handleSetPrimaryImage(item.id)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-primary-500"
                          title="انتخاب به عنوان تصویر اصلی"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMedia(item.id)}
                        className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500"
                        title="حذف تصویر"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                </svg>
                <p className="text-sm">هنوز تصویری آپلود نشده</p>
              </div>
            )}
          </Card>

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
                    options={[
                      { value: 8, label: '8 عیار' },
                      { value: 14, label: '14 عیار' },
                      { value: 18, label: '18 عیار' },
                      { value: 21, label: '21 عیار' },
                      { value: 24, label: '24 عیار' },
                    ]}
                  />
                </div>

                <Select
                  label="نوع طلا"
                  value={formData.goldType}
                  onChange={(e) => handleInputChange('goldType', e.target.value)}
                  options={[
                    { value: 'yellow', label: 'طلای زرد' },
                    { value: 'white', label: 'طلای سفید' },
                    { value: 'rose_gold', label: 'طلای رز' },
                  ]}
                />

                <Select
                  label="وضعیت"
                  value={formData.condition}
                  onChange={(e) => handleInputChange('condition', e.target.value)}
                  options={[
                    { value: 'new', label: 'نو' },
                    { value: 'second_hand', label: 'دست دوم' },
                  ]}
                />
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
      </div>
    </Layout>
  );
};

export default EditProductPage;