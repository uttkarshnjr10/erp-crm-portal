import React from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T) => string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
}

export function Table<T>({ columns, data, rowKey, onRowClick, rowClassName }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.map((item) => (
            <tr
              key={rowKey(item)}
              onClick={() => onRowClick?.(item)}
              className={`${onRowClick ? 'cursor-pointer hover:bg-slate-50' : ''} transition-colors ${rowClassName?.(item) || ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 text-sm text-slate-700 ${col.className || ''}`}>
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
