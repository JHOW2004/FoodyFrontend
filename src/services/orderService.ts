import { api } from './api';
import type {
  Order,
  CreateOrderPayload,
  UpdateOrderStatusPayload,
  UpdateOrderPayload,
  OrderStatusHistory,
} from '../types';

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  create: async (payload: CreateOrderPayload): Promise<Order> => {
    const response = await api.post<Order>('/orders', payload);
    return response.data;
  },

  updateStatus: async (id: number, payload: UpdateOrderStatusPayload): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, payload);
    return response.data;
  },

  update: async (id: number, payload: UpdateOrderPayload): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}`, payload);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  },

  getHistory: async (id: number): Promise<OrderStatusHistory[]> => {
    const response = await api.get<OrderStatusHistory[]>(`/orders/${id}/history`);
    return response.data;
  },
};
