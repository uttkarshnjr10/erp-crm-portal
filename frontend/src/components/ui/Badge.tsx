interface BadgeProps {
  children: React.ReactNode;
  color?: 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'slate';
}

const colorClasses: Record<string, string> = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  purple: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  slate: 'bg-slate-50 text-slate-700 ring-slate-600/20',
};

export function Badge({ children, color = 'slate' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClasses[color]}`}
    >
      {children}
    </span>
  );
}

type StatusValue = string;

const statusColorMap: Record<StatusValue, 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'slate'> = {
  ACTIVE: 'green',
  CONFIRMED: 'green',
  IN: 'green',
  LEAD: 'yellow',
  DRAFT: 'yellow',
  INACTIVE: 'red',
  CANCELLED: 'red',
  OUT: 'red',
  WHOLESALE: 'blue',
  DISTRIBUTOR: 'purple',
  RETAIL: 'slate',
  ADMIN: 'purple',
  SALES: 'blue',
  WAREHOUSE: 'yellow',
  ACCOUNTS: 'green',
};

export function StatusBadge({ status }: { status: string }) {
  const color = statusColorMap[status] || 'slate';
  return <Badge color={color}>{status}</Badge>;
}
