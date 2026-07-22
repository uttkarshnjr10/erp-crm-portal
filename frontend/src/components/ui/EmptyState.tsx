import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  description?: string;
}

export function EmptyState({ message = 'No data found', description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-full bg-slate-100 mb-4">
        <Inbox size={32} className="text-slate-400" />
      </div>
      <h3 className="text-sm font-medium text-slate-900">{message}</h3>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
  );
}
