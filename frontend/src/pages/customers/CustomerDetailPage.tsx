import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { customersApi } from '../../api/customers.api';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { Card, CardHeader, CardContent } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, formatDateTime } from '../../utils/format';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [note, setNote] = useState('');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!).then((r) => r.data.data),
    enabled: !!id,
  });

  const addFollowUp = useMutation({
    mutationFn: (noteText: string) => customersApi.addFollowUp(id!, noteText),
    onSuccess: () => {
      toast.success('Follow-up added');
      setNote('');
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
    },
    onError: () => toast.error('Failed to add follow-up'),
  });

  if (isLoading || !customer) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/customers')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft size={16} /> Back to Customers
      </button>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{customer.name}</h2>
            <p className="text-sm text-slate-500">{customer.businessName}</p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={customer.type} />
            <StatusBadge status={customer.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-slate-500">Mobile</span><p className="font-mono font-medium mt-0.5">{customer.mobile}</p></div>
            <div><span className="text-slate-500">Email</span><p className="font-medium mt-0.5">{customer.email || '—'}</p></div>
            <div><span className="text-slate-500">GST Number</span><p className="font-mono font-medium mt-0.5">{customer.gstNumber || '—'}</p></div>
            <div><span className="text-slate-500">Address</span><p className="font-medium mt-0.5">{customer.address}</p></div>
            <div><span className="text-slate-500">Follow-up Date</span><p className="font-medium mt-0.5">{customer.followUpDate ? formatDate(customer.followUpDate) : '—'}</p></div>
            <div><span className="text-slate-500">Created</span><p className="font-medium mt-0.5">{formatDate(customer.createdAt)}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><h3 className="text-sm font-semibold text-slate-900">Follow-up History ({customer._count.followUps})</h3></CardHeader>
            <CardContent className="space-y-0 p-0">
              {hasRole('ADMIN', 'SALES') && (
                <div className="p-4 border-b border-slate-100">
                  <div className="flex gap-2">
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Add a follow-up note (min 5 characters)..."
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                    <Button
                      onClick={() => addFollowUp.mutate(note)}
                      disabled={note.trim().length < 5}
                      isLoading={addFollowUp.isPending}
                      className="self-end"
                    >
                      <Send size={14} />
                    </Button>
                  </div>
                </div>
              )}
              <div className="divide-y divide-slate-100">
                {customer.followUps.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-400">No follow-ups yet</p>
                ) : (
                  customer.followUps.map((f) => (
                    <div key={f.id} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-blue-600">{f.createdBy.name}</span>
                        <span className="text-xs text-slate-400">{formatDateTime(f.createdAt)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{f.note}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><h3 className="text-sm font-semibold text-slate-900">Recent Challans ({customer._count.challans})</h3></CardHeader>
          <CardContent className="p-0">
            {customer.challans.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-400">No challans</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {customer.challans.map((ch) => (
                  <div key={ch.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-mono font-medium text-slate-900">{ch.challanNumber}</p>
                      <p className="text-xs text-slate-500">{formatDate(ch.createdAt)}</p>
                    </div>
                    <StatusBadge status={ch.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
