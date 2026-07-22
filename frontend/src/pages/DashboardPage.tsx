import { useQuery } from '@tanstack/react-query';
import { Users, Package, FileText, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../api/dashboard.api';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/Badge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { formatDate, getGreeting } from '../utils/format';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data.data),
  });

  if (isLoading || !data) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            {getGreeting()}, {user?.name}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">Here&apos;s what&apos;s happening today</p>
        </div>
        <StatusBadge status={user?.role || ''} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.totalCustomers} icon={Users} color="blue" />
        <StatCard label="Active Products" value={data.totalProducts} icon={Package} color="green" />
        <StatCard label="Total Challans" value={data.totalChallans} icon={FileText} color="yellow" />
        <StatCard label="Low Stock Items" value={data.lowStockProducts} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-900">Recent Challans</h3>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Challan #</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Customer</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentChallans.map((challan) => (
                  <tr
                    key={challan.id}
                    onClick={() => navigate(`/challans`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-2.5 text-sm font-mono font-medium text-blue-600">{challan.challanNumber}</td>
                    <td className="px-4 py-2.5 text-sm text-slate-700">{challan.customer.name}</td>
                    <td className="px-4 py-2.5"><StatusBadge status={challan.status} /></td>
                    <td className="px-4 py-2.5 text-sm text-slate-500">{formatDate(challan.createdAt)}</td>
                  </tr>
                ))}
                {data.recentChallans.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-400">No challans yet</td></tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-900">Challan Summary</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Draft</span>
              <span className="text-lg font-mono font-semibold text-amber-600">{data.draftChallans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Confirmed</span>
              <span className="text-lg font-mono font-semibold text-emerald-600">{data.confirmedChallans}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Cancelled</span>
              <span className="text-lg font-mono font-semibold text-red-600">{data.cancelledChallans}</span>
            </div>
            <hr className="border-slate-100" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-500">Active Customers</span>
              <span className="text-lg font-mono font-semibold text-blue-600">{data.activeCustomers}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
