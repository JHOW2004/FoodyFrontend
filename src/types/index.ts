export type OrderStatus = 'RECEBIDO' | 'EM_PREPARO' | 'SAIU_PARA_ENTREGA' | 'ENTREGUE' | 'CANCELADO';

export interface User {
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: string;
}

export interface OrderItem {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subTotal?: number;
}

export interface OrderStatusHistory {
  id: number;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  description: string;
  updatedBy: string;
  createdAt: string;
}

export interface Order {
  id: number;
  customerName: string;
  deliveryAddress: string;
  status: OrderStatus;
  totalPrice: number;
  items: OrderItem[];
  history?: OrderStatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderPayload {
  customerName: string;
  deliveryAddress: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
}

export interface UpdateOrderPayload {
  customerName: string;
  deliveryAddress: string;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}
