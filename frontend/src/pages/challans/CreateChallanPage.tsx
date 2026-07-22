import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { customersApi } from '../../api/customers.api';
import { productsApi } from '../../api/products.api';
import { challansApi } from '../../api/challans.api';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api.types';
import { ChallanStatus } from '../../types/challan.types';

export default function CreateChallanPage() {
  const navigate = useNavigate();
  
  const [customerId, setCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  
  const [items, setItems] = useState<Array<{
    productId: string;
    productName: string;
    productSku: string;
    unitPrice: number;
    currentStock: number;
    quantity: number;
  }>>([]);

  const { data: customersData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers', 'active'],
    queryFn: () => customersApi.list({ limit: 100, status: 'ACTIVE' }).then(r => r.data.data)
  });

  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products', 'active'],
    queryFn: () => productsApi.list({ limit: 100 }).then(r => r.data.data)
  });

  const createMutation = useMutation({
    mutationFn: (status: ChallanStatus) => challansApi.create({
      customerId,
      status,
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    }),
    onSuccess: (res) => {
      toast.success(`Challan ${res.data.data.challanNumber} created!`);
      navigate('/challans');
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.error || 'Failed to create challan');
    }
  });

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const product = productsData?.items.find(p => p.id === selectedProductId);
    if (!product) return;
    
    if (items.some(i => i.productId === selectedProductId)) {
      toast.error('Product already added');
      return;
    }
    
    setItems([...items, {
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      unitPrice: parseFloat(product.unitPrice),
      currentStock: product.currentStock,
      quantity: 1
    }]);
    setSelectedProductId('');
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setItems(items.map(item => 
      item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ));
  };

  const handleRemoveProduct = (productId: string) => {
    setItems(items.filter(item => item.productId !== productId));
  };

  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);
  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0), [items]);

  const isValid = customerId && items.length > 0;
  const hasInsufficientStock = items.some(item => item.quantity > item.currentStock);

  if (isLoadingCustomers || isLoadingProducts) return <LoadingSpinner />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/challans')} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Create New Challan</h1>
          <p className="text-sm text-slate-500 mt-0.5">Draft a new delivery challan</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">1. Select Customer</h2>
        </CardHeader>
        <CardContent>
          <Select
            options={customersData?.items.map(c => ({ value: c.id, label: `${c.name} (${c.businessName})` })) || []}
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Select a customer..."
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">2. Add Products</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Select
                options={productsData?.items.filter(p => !items.some(i => i.productId === p.id)).map(p => ({ 
                  value: p.id, 
                  label: `${p.name} - ${p.sku} (Stock: ${p.currentStock})` 
                })) || []}
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                placeholder="Select a product to add..."
              />
            </div>
            <Button onClick={handleAddProduct} disabled={!selectedProductId}>
              <Plus size={16} /> Add
            </Button>
          </div>

          {items.length > 0 && (
            <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 w-32">Quantity</th>
                    <th className="px-4 py-3">Subtotal</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {items.map(item => {
                    const isOverStock = item.quantity > item.currentStock;
                    return (
                      <tr key={item.productId} className={isOverStock ? 'bg-red-50/30' : ''}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-900">{item.productName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500">{item.productSku}</span>
                            <span className="text-xs text-slate-400">| Stock: {item.currentStock}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <Input 
                              type="number" 
                              min="1" 
                              value={item.quantity || ''} 
                              onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 0)}
                              className="w-full h-8 px-2 text-center"
                            />
                            {isOverStock && (
                              <span className="flex items-center gap-1 text-[10px] text-red-600 font-medium">
                                <AlertTriangle size={10} /> Exceeds stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono font-medium">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <button 
                            onClick={() => handleRemoveProduct(item.productId)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-50 font-medium">
                  <tr>
                    <td colSpan={2} className="px-4 py-3 text-right">Total:</td>
                    <td className="px-4 py-3 font-mono">{totalQuantity} units</td>
                    <td colSpan={2} className="px-4 py-3 font-mono text-blue-600">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3 pt-2">
        <Button 
          variant="secondary" 
          disabled={!isValid || createMutation.isPending} 
          onClick={() => createMutation.mutate('DRAFT')}
        >
          Save as Draft
        </Button>
        <Button 
          variant="primary" 
          disabled={!isValid || hasInsufficientStock || createMutation.isPending} 
          onClick={() => createMutation.mutate('CONFIRMED')}
        >
          Confirm Challan
        </Button>
      </div>
    </div>
  );
}
