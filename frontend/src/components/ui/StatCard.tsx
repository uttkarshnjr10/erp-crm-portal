import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-500' },
  green: { bg: 'bg-emerald-50', icon: 'text-emerald-500' },
  yellow: { bg: 'bg-amber-50', icon: 'text-amber-500' },
  red: { bg: 'bg-red-50', icon: 'text-red-500' },
};

export function StatCard({ label, value, icon: Icon, color }: StatCardProps) {
  const colors = colorMap[color];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`p-3 rounded-lg ${colors.bg}`}>
        <Icon size={22} className={colors.icon} />
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold font-mono text-slate-900 mt-0.5">{value.toLocaleString('en-IN')}</p>
      </div>
    </div>
  );
}
