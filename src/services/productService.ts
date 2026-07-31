import type { CreateProductPayload, Product, ProductCategory } from '../types';
import { api } from './api';

export const productService = {
  getAll: async (availableOnly = true): Promise<Product[]> => {
    const response = await api.get<Product[]>('/products', {
      params: { availableOnly },
    });
    return response.data;
  },

  getByCategory: async (category: ProductCategory): Promise<Product[]> => {
    const response = await api.get<Product[]>(`/products/category/${category}`);
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const response = await api.post<Product>('/products', payload);
    return response.data;
  },

  update: async (id: number, payload: CreateProductPayload): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
