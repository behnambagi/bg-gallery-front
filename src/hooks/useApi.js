import { useState, useCallback } from 'react';
import { useToast } from '../components/common/Toast';

const useApi = (apiFunction, showSuccessToast = true, showErrorToast = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSuccess, showError } = useToast();

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await apiFunction(...args);
      setData(result);
      
      if (showSuccessToast && result?.message) {
        showSuccess(result.message);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'خطایی رخ داد';
      setError(errorMessage);
      
      if (showErrorToast) {
        showError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, showSuccessToast, showErrorToast, showSuccess, showError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

export default useApi;