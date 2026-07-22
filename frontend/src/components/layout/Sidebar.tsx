import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { StatusBadge } from '../ui/Badge';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/challans', label: 'Challans', icon: FileText },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 text-slate-400 flex flex-col z-40">
      <div className="px-5 py-5 border-b border-slate-800">
        <h1 className="text-lg font-bold text-white tracking-tight">ERP Portal</h1>
        <p className="text-xs text-slate-500 mt-0.5">Operations Management</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-800">
        {user && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-slate-200 truncate">{user.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
            <div className="mt-1.5">
              <StatusBadge status={user.role} />
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
