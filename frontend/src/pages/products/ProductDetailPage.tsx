import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { productsApi } from '../../api/products.api';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDateTime } from '../../utils/format';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movPage, setMovPage] = useState(1);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const { data: movements } = useQuery({
    queryKey: ['stock-movements', id, movPage],
    queryFn: () => productsApi.getStockMovements(id!, { page: movPage, limit: 10 }).then((r) => r.data.data),
    enabled: !!id,
  });

  if (isLoading || !product) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft size={16} /> Back to Products
      </button>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{product.name}</h2>
            <p className="text-sm font-mono text-slate-500">{product.sku}</p>
          </div>
          <div className="flex items-center gap-2">
            {product.isLowStock && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
                <AlertTriangle size={12} /> Low Stock
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-slate-500">Category</span><p className="font-medium mt-0.5">{product.category.name}</p></div>
            <div><span className="text-slate-500">Unit Price</span><p className="font-mono font-medium mt-0.5">{formatCurrency(product.unitPrice)}</p></div>
            <div><span className="text-slate-500">Current Stock</span><p className={`font-mono font-medium mt-0.5 ${product.isLowStock ? 'text-red-600' : ''}`}>{product.currentStock}</p></div>
            <div><span className="text-slate-500">Min Alert</span><p className="font-mono font-medium mt-0.5">{product.minStockAlert}</p></div>
            <div><span className="text-slate-500">Location</span><p className="font-medium mt-0.5">{product.location || '—'}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="text-sm font-semibold text-slate-900">Stock Movement History</h3></CardHeader>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Quantity</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Reason</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements?.items.map((m) => (
                <tr key={m.id}>
                  <td className="px-4 py-2.5 text-sm text-slate-600">{formatDateTime(m.createdAt)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={m.movementType} /></td>
                  <td className="px-4 py-2.5 font-mono text-sm font-medium">{m.quantity}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-600">{m.reason}</td>
                  <td className="px-4 py-2.5 text-sm text-slate-600">{m.createdBy.name}</td>
                </tr>
              ))}
              {(!movements || movements.items.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400">No movements</td></tr>
              )}
            </tbody>
          </table>
          {movements && (
            <div className="px-4">
              <Pagination page={movements.page} totalPages={movements.totalPages} total={movements.total} onPageChange={setMovPage} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
