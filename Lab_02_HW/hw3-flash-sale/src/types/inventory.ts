
export type InventoryStatus =
  | 'available'
  | 'reserved'
  | 'expired'
  | 'sold_out';

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface InventoryState {
  productId: string;
  availableStock: number;
  reservedStock: number;
  soldStock: number;
  version: number;
}

export interface InventoryReservation {
  id: string;
  productId: string;
  userId: string;
  quantity: number;
  status: 'reserved' | 'expired' | 'cancelled' | 'checked_out';
  createdAt: number;
  expiresAt: number;
}
