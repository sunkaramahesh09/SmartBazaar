import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Store, ShoppingBag,
  Warehouse, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const NAV = [
  { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
  { to: '/admin/products',   label: 'Products',   icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/stores',     label: 'Stores',     icon: Store },
  { to: '/admin/orders',     label: 'Orders',     icon: ShoppingBag },
  { to: '/admin/inventory',  label: 'Inventory',  icon: Warehouse },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} flex-shrink-0 bg-gray-900 flex flex-col transition-all duration-300 relative`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-base">V</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-white font-bold text-sm leading-tight">Smart Bazaar</p>
              <p className="text-primary-light text-xs">Admin Panel</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-1 transition-all duration-200 group
                ${isActive
                  ? 'bg-primary text-white shadow-glow-primary'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`
              }>
              <Icon size={19} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-800 p-4">
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs">Administrator</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2.5 text-gray-400 hover:text-red-400 transition-colors text-sm w-full px-2 py-1.5 rounded-lg hover:bg-gray-800">
            <LogOut size={16} className="flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3 top-20 w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-primary transition-colors z-10">
          {collapsed ? <ChevronRight size={13} /> : <ChevronRight size={13} className="rotate-180" />}
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 page-enter">{children}</div>
      </main>
    </div>
  );
}
