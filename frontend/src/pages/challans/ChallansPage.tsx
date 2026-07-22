import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { challansApi } from '../../api/challans.api';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { Challan, ChallanStatus } from '../../types/challan.types';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api.types';

const statusTabs: { label: string; value: ChallanStatus | '' }[] = [
  { label: 'All', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function ChallansPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | ''>('');
  const [confirmDialog, setConfirmDialog] = useState<{ challan: Challan; action: 'CONFIRMED' | 'CANCELLED' } | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['challans', page, debouncedSearch, statusFilter],
    queryFn: () =>
      challansApi.list({
        page, limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
      }).then((r) => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ChallanStatus }) =>
      challansApi.updateStatus(id, status),
    onSuccess: (_, vars) => {
      toast.success(`Challan ${vars.status === 'CONFIRMED' ? 'confirmed' : 'cancelled'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['challans'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setConfirmDialog(null);
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.error || 'Failed to update status');
      setConfirmDialog(null);
    },
  });

  const columns = [
    { key: 'challanNumber', header: 'Challan #', render: (c: Challan) => (
      <span className="font-mono font-medium text-blue-600">{c.challanNumber}</span>
    )},
    { key: 'customer', header: 'Customer', render: (c: Challan) => (
      <div>
        <p className="font-medium text-slate-900">{c.customer.name}</p>
        <p className="text-xs font-mono text-slate-500">{c.customer.mobile}</p>
      </div>
    )},
    { key: 'items', header: 'Items', render: (c: Challan) => <span className="font-mono">{c._count?.items ?? '—'}</span> },
    { key: 'qty', header: 'Total Qty', render: (c: Challan) => <span className="font-mono">{c.totalQuantity}</span> },
    { key: 'status', header: 'Status', render: (c: Challan) => <StatusBadge status={c.status} /> },
    { key: 'date', header: 'Date', render: (c: Challan) => <span className="text-sm text-slate-500">{formatDate(c.createdAt)}</span> },
    { key: 'actions', header: '', render: (c: Challan) => (
      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
        {c.status === 'DRAFT' && hasRole('ADMIN', 'SALES') && (
          <Button variant="ghost" onClick={() => setConfirmDialog({ challan: c, action: 'CONFIRMED' })}>Confirm</Button>
        )}
        {(c.status === 'DRAFT' || c.status === 'CONFIRMED') && hasRole('ADMIN', 'SALES') && (
          <Button variant="ghost" className="text-red-600" onClick={() => setConfirmDialog({ challan: c, action: 'CANCELLED' })}>Cancel</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-72">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search challan number..." />
          </div>
          <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  statusFilter === tab.value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={() => navigate('/challans/create')}><Plus size={16} /> Create Challan</Button>
        )}
      </div>

      {isLoading ? <LoadingSpinner /> : !data || data.items.length === 0 ? (
        <EmptyState message="No challans found" />
      ) : (
        <>
          <Table columns={columns} data={data.items} rowKey={(c) => c.id} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!confirmDialog} onClose={() => setConfirmDialog(null)} title="Confirm Action" size="sm">
        {confirmDialog && (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to <span className="font-semibold">{confirmDialog.action === 'CONFIRMED' ? 'confirm' : 'cancel'}</span>{' '}
              challan <span className="font-mono font-semibold">{confirmDialog.challan.challanNumber}</span>?
            </p>
            {confirmDialog.action === 'CONFIRMED' && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                This will deduct stock for all items in this challan.
              </p>
            )}
            {confirmDialog.action === 'CANCELLED' && confirmDialog.challan.status === 'CONFIRMED' && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                This will restore stock for all items in this challan.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setConfirmDialog(null)}>No, keep it</Button>
              <Button
                variant={confirmDialog.action === 'CANCELLED' ? 'danger' : 'primary'}
                isLoading={statusMutation.isPending}
                onClick={() => statusMutation.mutate({ id: confirmDialog.challan.id, status: confirmDialog.action })}
              >
                Yes, {confirmDialog.action === 'CONFIRMED' ? 'confirm' : 'cancel'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
