
export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'expired';

export interface Order {
  id: string;
  reservationId: string;
  userId: string;
  productId: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: number;
  completedAt: number | null;
}
