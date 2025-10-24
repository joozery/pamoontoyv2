import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

export const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  const fetchProducts = async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Default to 20 items for homepage, unless specified
      const defaultParams = { limit: 20, ...params };
      const response = await apiService.products.getAll({ ...defaultParams, ...newParams });
      setProducts(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (productData) => {
    try {
      const response = await apiService.products.create(productData);
      await fetchProducts(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error creating product:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to create product' 
      };
    }
  };

  const updateProduct = async (id, productData) => {
    try {
      const response = await apiService.products.update(id, productData);
      await fetchProducts(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error updating product:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update product' 
      };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await apiService.products.delete(id);
      await fetchProducts(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error deleting product:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to delete product' 
      };
    }
  };

  const uploadImages = async (productId, formData) => {
    try {
      const response = await apiService.products.uploadImages(productId, formData);
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error uploading images:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to upload images' 
      };
    }
  };

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImages,
  };
};

export const useProduct = (id) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.products.getById(id);
      setProduct(response.data.data);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  return {
    product,
    loading,
    error,
    fetchProduct,
  };
};






