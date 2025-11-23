'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";

interface User {
  name: string;
  email: string;
  age?: number;
  phone?: string;
  avatar?: string;
}

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pixel-token");
    if (!token) return;

    fetch("http://localhost:8080/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject("Unauthorized")))
      .then((data) => setUser({ 
        name: data.name, 
        email: data.email,
        age: data.age,
        phone: data.phone,
        avatar: data.avatar 
      }))
      .catch(() => {});
  }, []);

  const notifications = [
    { id: 1, title: "Pago recibido", message: "Has recibido S/ 150.00", time: "2 min ago", read: false },
    { id: 2, title: "Transferencia exitosa", message: "Transferencia a Juan completada", time: "1 hora ago", read: true },
    { id: 3, title: "Nueva función", message: "Préstamos disponibles ahora", time: "2 horas ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
        {/* Menú Hamburguesa y Logo */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* Logo para móvil */}
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Pixel Money</span>
          </div>
        </div>

        {/* Barra de búsqueda - Solo en desktop */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full max-w-sm">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar transacciones, contactos..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Acciones de usuario */}
        <div className="flex items-center space-x-3">
          {/* Modo oscuro */}
          <ThemeSwitch />

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
              <Bell size={20} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Panel de notificaciones */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-fade-in">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Notificaciones</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                            {notification.title}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                        {notification.time}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="w-full text-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay para mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}