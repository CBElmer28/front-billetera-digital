'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  CreditCard, 
  Users, 
  Settings, 
  LogOut, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User 
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api'; // Asegúrate de usar tu cliente API

interface UserData {
  name: string;
  email: string;
  age?: number;
  phone?: string;
  avatar?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data: any = await apiClient.get('/auth/me');
        setUser({ 
          name: data.name, 
          email: data.email,
          age: data.age,
          phone: data.phone,
          avatar: data.avatar
        });
      } catch (error) {
        console.error("Error loading sidebar user", error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    // Confirmación nativa del navegador (Simple y efectiva)
    if (window.confirm("¿Estás seguro de que quieres cerrar sesión?")) {
      localStorage.removeItem("pixel-token");
      localStorage.removeItem("pixel-user-id");
      router.push("/"); // Redirigir al login
    }
  };

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/transactions', label: 'Transacciones', icon: <CreditCard size={20} /> },
    { href: '/groups', label: 'Grupos', icon: <Users size={20} /> },
    { href: '/configuracion', label: 'Configuración', icon: <Settings size={20} /> },
  ];

  const NavContent = () => (
    <>
      {/* 1. HEADER (Logo) */}
      <div className="p-6 pb-4">
        <div className={`flex items-center justify-between transition-all duration-300 ${collapsed ? 'justify-center' : ''}`}>
          {!collapsed ? (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">PM</span>
              </div>
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-wide">
                Pixel Money
              </span>
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

      {/* 2. PERFIL DE USUARIO (Compacto) */}
      <div className={`px-4 mb-6 transition-all duration-300 ${collapsed ? 'px-2' : ''}`}>
        <div className={`bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl p-3 flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
            {user?.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full" /> : <User size={18} />}
          </div>
          
          {!collapsed && user && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user.name.split(' ')[0]}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Cuenta Activa</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. NAVEGACIÓN PRINCIPAL (Sin flex-1 para no empujar todo abajo) */}
      <nav className="px-4 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center p-3 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <div className={`transition-transform duration-200 ${!collapsed ? 'mr-3' : ''}`}>
                {link.icon}
              </div>
              {!collapsed && (
                <span className="font-medium text-sm">{link.label}</span>
              )}
            </Link>
          );
        })}

        {/* 4. BOTÓN DE CERRAR SESIÓN (Integrado aquí mismo) */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 group ${
              collapsed ? 'justify-center' : ''
            } text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600`}
          >
            <div className={`transition-transform duration-200 ${!collapsed ? 'mr-3' : ''}`}>
              <LogOut size={20} />
            </div>
            {!collapsed && (
              <span className="font-medium text-sm">Cerrar sesión</span>
            )}
          </button>
        </div>
      </nav>

      {/* 5. FOOTER (Solo el botón de contraer, pegado al fondo) */}
      <div className="mt-auto p-4 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center justify-center w-full p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : (
            <div className="flex items-center gap-2 text-xs font-medium">
              <ChevronLeft size={14} />
              <span>Contraer menú</span>
            </div>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-72'
      }`}>
        <NavContent />
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      } w-72`}>
        <NavContent />
      </aside>

      {/* Overlay Mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Trigger Mobile */}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700"
        >
          <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      )}
    </>
  );
}