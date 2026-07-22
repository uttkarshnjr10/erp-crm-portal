import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200'} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  ),
);

Input.displayName = 'Input';
