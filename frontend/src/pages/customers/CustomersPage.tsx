import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { customersApi } from '../../api/customers.api';
import { useAuth } from '../../hooks/useAuth';
import { useDebounce } from '../../hooks/useDebounce';
import { Customer, CreateCustomerRequest, CustomerStatus, CustomerType } from '../../types/customer.types';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { Table } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/Badge';
import { Pagination } from '../../components/ui/Pagination';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { ApiError } from '../../types/api.types';

export default function CustomersPage() {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, debouncedSearch, statusFilter, typeFilter],
    queryFn: () =>
      customersApi.list({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: (statusFilter as CustomerStatus) || undefined,
        type: (typeFilter as CustomerType) || undefined,
      }).then((r) => r.data.data),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateCustomerRequest>();

  const createMutation = useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      editingCustomer
        ? customersApi.update(editingCustomer.id, data)
        : customersApi.create(data),
    onSuccess: () => {
      toast.success(editingCustomer ? 'Customer updated' : 'Customer created');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      closeModal();
    },
    onError: (err: AxiosError<ApiError>) => {
      toast.error(err.response?.data?.error || 'Something went wrong');
    },
  });

  const openModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      reset({
        name: customer.name,
        mobile: customer.mobile,
        email: customer.email || '',
        businessName: customer.businessName,
        gstNumber: customer.gstNumber || '',
        type: customer.type,
        address: customer.address,
        status: customer.status,
      });
    } else {
      setEditingCustomer(null);
      reset({ status: 'LEAD', type: 'RETAIL' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    reset();
  };

  const columns = [
    { key: 'name', header: 'Name', render: (c: Customer) => (
      <div>
        <p className="font-medium text-slate-900">{c.name}</p>
        <p className="text-xs text-slate-500">{c.businessName}</p>
      </div>
    )},
    { key: 'mobile', header: 'Mobile', render: (c: Customer) => <span className="font-mono text-sm">{c.mobile}</span> },
    { key: 'type', header: 'Type', render: (c: Customer) => <StatusBadge status={c.type} /> },
    { key: 'status', header: 'Status', render: (c: Customer) => <StatusBadge status={c.status} /> },
    { key: 'followUpDate', header: 'Follow-up', render: (c: Customer) => (
      <span className="text-sm text-slate-500">{c.followUpDate ? formatDate(c.followUpDate) : '—'}</span>
    )},
    { key: 'actions', header: '', render: (c: Customer) => (
      <div className="flex gap-2">
        <Button variant="ghost" onClick={(e) => { e.stopPropagation(); navigate(`/customers/${c.id}`); }}>View</Button>
        {hasRole('ADMIN', 'SALES') && (
          <Button variant="ghost" onClick={(e) => { e.stopPropagation(); openModal(c); }}>Edit</Button>
        )}
      </div>
    )},
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-72">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="LEAD">Lead</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
          >
            <option value="">All Types</option>
            <option value="RETAIL">Retail</option>
            <option value="WHOLESALE">Wholesale</option>
            <option value="DISTRIBUTOR">Distributor</option>
          </select>
        </div>
        {hasRole('ADMIN', 'SALES') && (
          <Button onClick={() => openModal()}>
            <Plus size={16} /> Add Customer
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : !data || data.items.length === 0 ? (
        <EmptyState message="No customers found" description="Try adjusting your search or filters" />
      ) : (
        <>
          <Table columns={columns} data={data.items} rowKey={(c) => c.id} onRowClick={(c) => navigate(`/customers/${c.id}`)} />
          <Pagination page={data.page} totalPages={data.totalPages} total={data.total} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCustomer ? 'Edit Customer' : 'Add Customer'} size="lg">
        <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name *" error={errors.name?.message} {...register('name', { required: 'Required' })} />
            <Input label="Mobile *" error={errors.mobile?.message} {...register('mobile', { required: 'Required', pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid 10-digit number' } })} />
            <Input label="Email" error={errors.email?.message} {...register('email')} />
            <Input label="Business Name *" error={errors.businessName?.message} {...register('businessName', { required: 'Required' })} />
            <Input label="GST Number" error={errors.gstNumber?.message} {...register('gstNumber')} />
            <Select label="Type *" options={[
              { value: 'RETAIL', label: 'Retail' },
              { value: 'WHOLESALE', label: 'Wholesale' },
              { value: 'DISTRIBUTOR', label: 'Distributor' },
            ]} error={errors.type?.message} {...register('type', { required: 'Required' })} />
            <Select label="Status" options={[
              { value: 'LEAD', label: 'Lead' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]} {...register('status')} />
            <Input label="Follow-up Date" type="date" {...register('followUpDate')} />
          </div>
          <Input label="Address *" error={errors.address?.message} {...register('address', { required: 'Required' })} />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              {editingCustomer ? 'Update' : 'Create'} Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
