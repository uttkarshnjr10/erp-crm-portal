import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, AlertTriangle } from 'lucide-react';
import { productsApi, categoriesApi } from '../../api/products.api';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { Product, CreateProductRequest, AdjustStockRequest } from '../../types/product.types';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table } from '../../components/ui/Table';

import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency } from '../../utils/format';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api.types';

export default function ProductsPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModal, setStockModal] = useState<Product | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, debouncedSearch, categoryFilter, lowStockOnly],
    queryFn: () =>
      productsApi.list({
        page, limit: 10,
        search: debouncedSearch || undefined,
        categoryId: categoryFilter || undefined,
        lowStock: lowStockOnly || undefined,
      }).then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductRequest>();

  const createMutation = useMutation({
    mutationFn: (d: CreateProductRequest) =>
      editingProduct ? productsApi.update(editingProduct.id, d) : productsApi.create(d),
    onSuccess: () => {
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      closeModal();
    },
    onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.error || 'Error'),
  });

  const { register: regStock, handleSubmit: submitStock, reset: resetStock, formState: { errors: stockErrors } } = useForm<AdjustStockRequest>();

  const stockMutation = useMutation({
    mutationFn: (d: AdjustStockRequest) => productsApi.adjustStock(stockModal!.id, d),
    onSuccess: () => {
      toast.success('Stock adjusted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setStockModal(null);
      resetStock();
    },
    onError: (err: AxiosError<ApiError>) => toast.error(err.response?.data?.error || 'Error'),
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      reset({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId,
        unitPrice: parseFloat(product.unitPrice),
        minStockAlert: product.minStockAlert,
        location: product.location || '',
      });
    } else {
      setEditingProduct(null);
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingProduct(null); reset(); };

  const columns = [
    { key: 'name', header: 'Product', render: (p: Product) => (
      <div>
        <p className="font-medium text-slate-900">{p.name}</p>
        <p className="text-xs font-mono text-slate-500">{p.sku}</p>
      </div>
    )},
    { key: 'category', header: 'Category', render: (p: Product) => <span className="text-sm">{p.category.name}</span> },
    { key: 'stock', header: 'Stock', render: (p: Product) => (
      <div className="flex items-center gap-1.5">
        <span className={`font-mono font-medium ${p.isLowStock ? 'text-red-600' : 'text-slate-900'}`}>{p.currentStock}</span>
        {p.isLowStock && <AlertTriangle size={14} className="text-red-500" />}
      </div>
    )},
    { key: 'minAlert', header: 'Min Alert', render: (p: Product) => <span className="font-mono text-sm text-slate-500">{p.minStockAlert}</span> },
    { key: 'price', header: 'Unit Price', render: (p: Product) => <span className="font-mono text-sm">{formatCurrency(p.unitPrice)}</span> },
    { key: 'actions', header: '', render: (p: Product) => (
      <div className="flex gap-1">
        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/products/${p.id}`); }}>View</Button>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <>
            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setStockModal(p); resetStock(); }}>Stock</Button>
            <Button variant="ghost" onClick={(e) => { e.stopPropagation(); openModal(p); }}>Edit</Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-72"><SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search products..." /></div>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="">All Categories</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={lowStockOnly} onChange={(e) => { setLowStockOnly(e.target.checked); setPage(1); }} className="rounded border-slate-300 text-blue-500 focus:ring-blue-500" />
            Low Stock Only
          </label>
        </div>
        {hasRole('ADMIN', 'WAREHOUSE') && (
          <Button onClick={() => openModal()}><Plus size={16} /> Add Product</Button>
        )}
      </div>

      {isLoading ? <LoadingSpinner /> : !data || data.items.length === 0 ? (
        <EmptyState message="No products found" />
      ) : (
        <>
          <Table columns={columns} data={data.items} rowKey={(p) => p.id} onRowClick={(p) => navigate(`/products/${p.id}`)}
            rowClassName={(p) => p.isLowStock ? 'bg-red-50/50' : ''} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Edit Product' : 'Add Product'} size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="SKU *" error={errors.sku?.message} disabled={!!editingProduct}
              {...register('sku', { required: 'Required' })} />
            <Select label="Category *" options={categories?.map((c) => ({ value: c.id, label: c.name })) || []}
              placeholder="Select..." error={errors.categoryId?.message}
              {...register('categoryId', { required: 'Required' })} />
            <Input label="Unit Price *" type="number" step="0.01" error={errors.unitPrice?.message}
              {...register('unitPrice', { required: 'Required', valueAsNumber: true, min: { value: 0.01, message: 'Must be positive' } })} />
            {!editingProduct && (
              <Input label="Initial Stock" type="number" {...register('currentStock', { valueAsNumber: true })} />
            )}
            <Input label="Min Stock Alert" type="number" {...register('minStockAlert', { valueAsNumber: true })} />
            <Input label="Location" {...register('location')} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>{editingProduct ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!stockModal} onClose={() => setStockModal(null)} title={`Adjust Stock — ${stockModal?.name || ''}`}>
        <form onSubmit={submitStock((d) => stockMutation.mutate(d))} className="space-y-4">
          <p className="text-sm text-slate-500">Current stock: <span className="font-mono font-semibold text-slate-900">{stockModal?.currentStock}</span></p>
          <Select label="Movement Type" options={[{ value: 'IN', label: 'Stock In' }, { value: 'OUT', label: 'Stock Out' }]}
            error={stockErrors.movementType?.message} {...regStock('movementType', { required: 'Required' })} />
          <Input label="Quantity *" type="number" error={stockErrors.quantity?.message}
            {...regStock('quantity', { required: 'Required', valueAsNumber: true, min: { value: 1, message: 'Min 1' } })} />
          <Input label="Reason *" error={stockErrors.reason?.message} {...regStock('reason', { required: 'Required' })} />
          <div className="flex justify-end gap-3 pt-4 border-t"><Button variant="secondary" type="button" onClick={() => setStockModal(null)}>Cancel</Button>
            <Button type="submit" isLoading={stockMutation.isPending}>Adjust Stock</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
