export type MovementType = 'IN' | 'OUT';

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  _count: {
    products: number;
  };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  categoryId: string;
  unitPrice: string;
  currentStock: number;
  minStockAlert: number;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  isLowStock: boolean;
  category: {
    id: string;
    name: string;
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  quantity: number;
  movementType: MovementType;
  reason: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface ProductDetail extends Product {
  stockMovements: StockMovement[];
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  categoryId: string;
  unitPrice: number;
  currentStock?: number;
  minStockAlert?: number;
  location?: string;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  unitPrice?: number;
  minStockAlert?: number;
  location?: string;
}

export interface AdjustStockRequest {
  quantity: number;
  movementType: MovementType;
  reason: string;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  lowStock?: boolean;
}
