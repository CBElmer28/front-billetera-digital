'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, CreditCard, Users, Settings, LogOut, PieChart, Wallet, Calendar, FileText, Stethoscope, Activity, X, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';

interface User {
  name: string;
  email: string;
  age?: number;
  phone?: string;
  avatar?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pixel-token");
    if (!token) return;

    fetch("https://pixel-money.koyeb.app/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => setUser({ 
        name: data.name, 
        email: data.email,
        age: data.age,
        phone: data.phone,
        avatar: data.avatar
      }))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("pixel-token");
    localStorage.removeItem("pixel-user-id");
    router.push("/");
  };

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/transactions', label: 'Transacciones', icon: <CreditCard size={20} /> },
    { href: '/groups', label: 'Grupos', icon: <Users size={20} /> },
    { href: '/configuracion', label: 'Configuración', icon: <Settings size={20} /> },
  ];

  const NavContent = () => (
    <>
      {/* Header elegante con logo */}
      <div className="p-6 pb-4 border-b border-sky-100 dark:border-slate-700">
        <div className={`flex items-center justify-between transition-all duration-300 ${collapsed ? 'flex-col space-y-4' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3">
                 {/* Logo */}
      <div className="flex items-center space-x-3">
        <img
          src="/PixelMoneyLogoPng.png"
          alt="Pixel Money"
          className="w-10 h-10 object-contain transition-all duration-300 dark:invert"
        />
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-wide">
          Pixel Money
        </span>
      </div>

              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
          )}
          
          <button 
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-2 rounded-xl hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
      </div>

      {/* Sección de usuario integrada */}
      {user && (
        <div className={`px-6 py-6 transition-all duration-300 ${collapsed ? 'text-center px-4' : ''}`}>
          <div className={`bg-gradient-to-br from-sky-50 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 rounded-2xl p-4 shadow-sm border border-sky-100 dark:border-slate-700 ${collapsed ? 'px-3' : ''}`}>
            <div className={`flex items-center ${collapsed ? 'justify-center flex-col space-y-3' : 'space-x-4'}`}>
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user.name}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {user.age && (
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium bg-sky-100 dark:bg-sky-900/30 px-2 py-0.5 rounded-full">
                        {user.age} años
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-2 truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navegación minimalista */}
      <nav className="flex-1 px-4 space-y-2">
        <div className={`text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ${collapsed ? 'text-center' : 'px-3'}`}>
          {collapsed ? '•' : 'Navegación Principal'}
        </div>
        
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center p-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-sky-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'} ${collapsed ? '' : 'mr-3'}`}>
                {link.icon}
              </div>
              {!collapsed && (
                <span className="font-medium text-sm tracking-wide">{link.label}</span>
              )}
              {!collapsed && isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer del Sidebar */}
      <div className="p-4 border-t border-sky-100 dark:border-slate-700">
        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 text-slate-600 dark:text-slate-400 rounded-xl font-medium hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 dark:hover:text-rose-400 transition-colors group ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} className={collapsed ? '' : 'mr-3'} />
          {!collapsed && 'Cerrar sesión'}
        </button>

        {/* Botón para colapsar/expandir - Solo desktop */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full mt-3 p-2 text-slate-500 dark:text-slate-400 rounded-lg hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors text-xs font-medium"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          {!collapsed && <span className="ml-2">Contraer</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Sidebar para desktop */}
      <aside className={`hidden lg:flex bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-r border-sky-100 dark:border-slate-700 flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}>
        <NavContent />
      </aside>

      {/* Sidebar para mobile */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-r border-sky-100 dark:border-slate-700 flex-col justify-between transition-all duration-300 transform ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } w-64`}>
        <NavContent />
      </aside>

      {/* Overlay para mobile */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Botón para abrir sidebar en mobile */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-sky-100 dark:border-slate-700 flex items-center justify-center shadow-lg"
        >
          <ChevronRight size={18} className="text-slate-600 dark:text-slate-400" />
        </button>
      )}
    </>
  );
}