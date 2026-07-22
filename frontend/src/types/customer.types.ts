export type CustomerType = 'RETAIL' | 'WHOLESALE' | 'DISTRIBUTOR';
export type CustomerStatus = 'LEAD' | 'ACTIVE' | 'INACTIVE';

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string;
  gstNumber: string | null;
  type: CustomerType;
  address: string;
  status: CustomerStatus;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    followUps: number;
    challans?: number;
  };
}

export interface FollowUp {
  id: string;
  customerId: string;
  note: string;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

export interface CustomerDetail extends Customer {
  followUps: FollowUp[];
  challans: {
    id: string;
    challanNumber: string;
    totalQuantity: number;
    status: string;
    createdAt: string;
  }[];
  _count: {
    challans: number;
    followUps: number;
  };
}

export interface CreateCustomerRequest {
  name: string;
  mobile: string;
  email?: string;
  businessName: string;
  gstNumber?: string;
  type: CustomerType;
  address: string;
  status?: CustomerStatus;
  followUpDate?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  mobile?: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  type?: CustomerType;
  address?: string;
  status?: CustomerStatus;
  followUpDate?: string;
}

export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: CustomerStatus;
  type?: CustomerType;
}
