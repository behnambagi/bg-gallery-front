import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
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
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
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
      setProducts(data);
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
    { value: 'created_at', label: 'جدیدترین' },
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
      onClick: () => navigate('/products/new'),
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
      <div className="p-4 space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="جستجو در محصولات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
              placeholder="دسته‌بندی"
            />
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
              placeholder="مرتب‌سازی"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">محصولی یافت نشد</h3>
            <p className="text-gray-600 text-sm mb-6">
              {searchQuery || selectedCategory 
                ? 'با فیلترهای انتخاب شده محصولی یافت نشد' 
                : 'هنوز محصولی اضافه نکرده‌اید'
              }
            </p>
            <Button
              variant="primary"
              onClick={() => navigate('/products/new')}
            >
              افزودن اولین محصول
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <Card key={product.id} padding="sm">
                <div className="flex items-start space-x-3 space-x-reverse">
                  <div className="flex-shrink-0">
                    {product.media?.find(m => m.isPrimary)?.mediaUrl ? (
                      <img
                        src={product.media.find(m => m.isPrimary).mediaUrl}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </h3>
                        {product.productCode && (
                          <p className="text-xs text-gray-500 mt-1">
                            کد: {product.productCode}
                          </p>
                        )}
                        <div className="flex items-center space-x-2 space-x-reverse mt-2">
                          {getStatusBadge(product.status)}
                          <span className="text-xs text-gray-500">
                            {product.weightGrams} گرم • {product.karat} عیار
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1">
                        <p className="text-sm font-semibold text-primary-600">
                          {formatPrice(product.calculatedPrice)}
                        </p>
                        
                        <div className="flex items-center space-x-1 space-x-reverse">
                          <button
                            onClick={() => navigate(`/products/${product.id}/edit`)}
                            className="p-1.5 text-gray-400 hover:text-primary-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          
                          {product.status === 'active' && (
                            <button
                              onClick={() => handleMarkAsSold(product.id)}
                              disabled={actionLoading[product.id]}
                              className="p-1.5 text-gray-400 hover:text-green-500 transition-colors disabled:opacity-50"
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
                            onClick={() => handleDeleteProduct(product.id)}
                            disabled={actionLoading[product.id]}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
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
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductsPage;