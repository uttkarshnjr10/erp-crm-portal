import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/customers': 'Customers',
  '/products': 'Products',
  '/challans': 'Challans',
  '/challans/create': 'Create Challan',
};

export function Header() {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');
  const title = pageTitles[location.pathname] || pageTitles[basePath] || 'Page';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-6 sticky top-0 z-30">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </header>
  );
}
