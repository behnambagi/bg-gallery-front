import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import BottomSheetSelect from '../components/common/BottomSheetSelect';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { productService } from '../services/products';
import { categoryService } from '../services/categories';
import { useToast } from '../components/common/Toast';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchQuery, selectedCategory, sortBy, sortOrder]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        page: 1,
        limit: 50,
        sortBy,
        sortOrder,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      const data = await productService.getMyProducts(params);
      setProducts(data.products);
    } catch (error) {
      showError('خطا در بارگذاری محصولات');
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

  const handleMarkAsSold = async (productId) => {
    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }));
      await productService.markAsSold(productId);
      showSuccess('محصول به عنوان فروخته شده علامت‌گذاری شد');
      fetchProducts();
    } catch (error) {
      showError('خطا در علامت‌گذاری محصول');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      return;
    }

    try {
      setActionLoading(prev => ({ ...prev, [productId]: true }));
      await productService.delete(productId);
      showSuccess('محصول با موفقیت حذف شد');
      fetchProducts();
    } catch (error) {
      showError('خطا در حذف محصول');
    } finally {
      setActionLoading(prev => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="sm">موجود</Badge>;
      case 'sold':
        return <Badge variant="default" size="sm">فروخته شده</Badge>;
      case 'inactive':
        return <Badge variant="warning" size="sm">غیرفعال</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  const formatPrice = (calculatedPrice) => {
    if (!calculatedPrice?.totalPrice) return 'نامشخص';
    return new Intl.NumberFormat('fa-IR').format(calculatedPrice.totalPrice) + ' تومان';
  };

  const categoryOptions = [
    { value: '', label: 'همه دسته‌بندی‌ها' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name }))
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'جدیدترین' },
    { value: 'name', label: 'نام محصول' },
    { value: 'weightGrams', label: 'وزن' },
  ];

  const headerActions = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: () => navigate('/products/add'),
      variant: 'primary'
    }
  ];

  if (loading) {
    return (
      <Layout title="محصولات من" headerActions={headerActions}>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="محصولات من" headerActions={headerActions}>
      <div className="p-4 space-y-6 animate-fade-in">
        {/* Minimal Search and Filters */}
        <div className="flex gap-3 animate-slide-up">
          <div className="flex-1">
            <Input
              placeholder="جستجو..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center space-x-2 space-x-reverse"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">فیلتر</span>
            {(selectedCategory || sortBy !== 'createdAt') && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <Card shadow="medium" className="animate-scale-in">
            <div className="grid grid-cols-2 gap-3">
              <BottomSheetSelect
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categoryOptions}
                placeholder="دسته‌بندی"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                }
              />
              
              <BottomSheetSelect
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                placeholder="مرتب‌سازی"
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                }
              />
            </div>
            
            {(selectedCategory || sortBy !== 'createdAt') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setSortBy('createdAt');
                  }}
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors"
                >
                  پاک کردن فیلترها
                </button>
              </div>
            )}
          </Card>
        )}

        {products.length === 0 ? (
          <Card className="text-center py-16 animate-scale-in" shadow="medium">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mx-auto mb-4 flex items-center justify-center transform rotate-3">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="absolute -top-2 -right-2 w-4 h-4 bg-gold-400 rounded-full animate-bounce-subtle" />
              <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-primary-400 rounded-full animate-bounce-subtle" style={{animationDelay: '0.5s'}} />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {searchQuery || selectedCategory ? 'محصولی یافت نشد' : 'هنوز محصولی ندارید'}
            </h3>
            <p className="text-gray-600 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
              {searchQuery || selectedCategory 
                ? 'با فیلترهای انتخاب شده محصولی یافت نشد. فیلترها را تغییر دهید یا محصول جدید اضافه کنید' 
                : 'شروع کنید و اولین محصول طلا و جواهر خود را به مجموعه اضافه کنید'
              }
            </p>
            
            <div className="space-y-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/products/add')}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                {searchQuery || selectedCategory ? 'افزودن محصول جدید' : 'افزودن اولین محصول'}
              </Button>
              
              {(searchQuery || selectedCategory) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                >
                  پاک کردن فیلترها
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-sm font-bold text-gray-900">{products.length} محصول</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-600">یافت شد</span>
              </div>
              <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-gold-500 rounded-full" />
            </div>
            
            <div className="space-y-3">
              {products.map((product, index) => (
                <Card 
                  key={product.id} 
                  padding="sm" 
                  hover 
                  shadow="medium"
                  className="group animate-slide-up overflow-hidden"
                  style={{animationDelay: `${index * 0.05}s`}}
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    <div className="flex-shrink-0 relative">
                      <div className="relative overflow-hidden rounded-2xl">
                        {product.media?.find(m => m.isPrimary)?.mediaUrl ? (
                          <img
                            src={product.media.find(m => m.isPrimary).mediaUrl}
                            alt={product.name}
                            className="w-20 h-20 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center transition-colors duration-300 group-hover:from-primary-100 group-hover:to-primary-200">
                            <svg className="w-8 h-8 text-gray-400 transition-colors duration-300 group-hover:text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        
                        <div className="absolute top-2 right-2">
                          {getStatusBadge(product.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 truncate group-hover:text-primary-600 transition-colors duration-300">
                            {product.name}
                          </h3>
                          
                          {product.productCode && (
                            <p className="text-xs text-gray-500 mt-1 font-medium">
                              کد: {product.productCode}
                            </p>
                          )}
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-600">
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16l3-3m-3 3l-3-3" />
                                </svg>
                                <span className="font-medium">{product.weightGrams} گرم</span>
                              </div>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="font-medium">{product.karat} عیار</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <p className="text-lg font-bold text-primary-600">
                                {formatPrice(product.calculatedPrice)}
                              </p>
                              
                              <div className="flex items-center space-x-2 space-x-reverse">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/products/edit/${product.id}`);
                                  }}
                                  className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
                                  title="ویرایش محصول"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                {product.status === 'active' && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkAsSold(product.id);
                                    }}
                                    disabled={actionLoading[product.id]}
                                    className="p-2 text-gray-400 hover:text-success-500 hover:bg-success-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="علامت‌گذاری به عنوان فروخته شده"
                                  >
                                    {actionLoading[product.id] ? (
                                      <LoadingSpinner size="sm" />
                                    ) : (
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </button>
                                )}
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteProduct(product.id);
                                  }}
                                  disabled={actionLoading[product.id]}
                                  className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="حذف محصول"
                                >
                                  {actionLoading[product.id] ? (
                                    <LoadingSpinner size="sm" />
                                  ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-50/0 via-primary-50/50 to-gold-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;
