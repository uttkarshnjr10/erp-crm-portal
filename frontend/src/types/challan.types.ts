export type ChallanStatus = 'DRAFT' | 'CONFIRMED' | 'CANCELLED';

export interface ChallanItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  unitPrice: string;
  quantity: number;
  subtotal: number;
}

export interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  totalQuantity: number;
  status: ChallanStatus;
  createdAt: string;
  updatedAt: string;
  customer: {
    id: string;
    name: string;
    mobile: string;
    businessName?: string;
    gstNumber?: string | null;
  };
  createdBy: {
    id: string;
    name: string;
    email?: string;
    role?: string;
  };
  _count?: {
    items: number;
  };
}

export interface ChallanDetail extends Challan {
  items: ChallanItem[];
  totalAmount: number;
}

export interface CreateChallanItemRequest {
  productId: string;
  quantity: number;
}

export interface CreateChallanRequest {
  customerId: string;
  items: CreateChallanItemRequest[];
  status?: ChallanStatus;
}

export interface ChallanQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
}

export interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  totalChallans: number;
  confirmedChallans: number;
  draftChallans: number;
  cancelledChallans: number;
  recentChallans: {
    id: string;
    challanNumber: string;
    totalQuantity: number;
    status: ChallanStatus;
    createdAt: string;
    customer: {
      id: string;
      name: string;
    };
  }[];
}
