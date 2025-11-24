'use client';

import { useState, useEffect } from "react";
import { Bell, Menu, CheckCheck } from "lucide-react";
import ThemeSwitch from "./ThemeSwitch";
import { apiClient } from "../lib/api";
import { usePolling } from "../../hooks/usePolling";
import { generateNotificationsFromTransactions, NotificationItem } from "../lib/notificationUtils";

interface User {
  name: string;
  email: string;
  age?: number;
  phone?: string;
  avatar?: string;
}

export default function AppHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estado visual para el contador
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchHeaderData = async () => {
    try {
      // Cargar Usuario
      const userData: any = await apiClient.get("/auth/me");
      setUser({ 
        name: userData.name, 
        email: userData.email,
        age: userData.age,
        phone: userData.phone,
        avatar: userData.avatar 
      });

      // Cargar Transacciones
      const txData: any = await apiClient.get("/ledger/transactions/me");
      const txs = Array.isArray(txData) ? txData : [];
      
      // 👇 LÓGICA ROBUSTA: Leer siempre del disco
      const savedWatermark = localStorage.getItem('last_notification_watermark');
      const currentWatermark = savedWatermark ? parseInt(savedWatermark) : 0;
      
      // Generamos notificaciones comparando timestamps del servidor
      const generatedNotifs = generateNotificationsFromTransactions(txs, currentWatermark);
      
      // Solo actualizamos si el menú está CERRADO para evitar saltos
      if (!showNotifications) {
        setNotifications(generatedNotifs);
        setUnreadCount(generatedNotifs.filter(n => !n.read).length);
      }

    } catch (error) {
      console.error("Error polling header data", error);
    }
  };

  usePolling(fetchHeaderData, 5000);

  // Carga inicial
  useEffect(() => {
    fetchHeaderData();
  }, []);

  // 👇 AQUÍ ESTÁ EL ARREGLO DE LA SINCRONIZACIÓN
  const handleOpenNotifications = () => {
    const isOpen = !showNotifications;
    setShowNotifications(isOpen);

    if (isOpen && notifications.length > 0) {
      // 1. Encontramos la fecha de la transacción MÁS RECIENTE de la lista
      // Usamos el tiempo de la transacción, NO el de tu computadora (Date.now())
      const latestTxTime = Math.max(...notifications.map(n => n.timestamp));
      
      // 2. Guardamos esa fecha como "Marca de agua"
      // "He visto todo hasta la fecha X"
      localStorage.setItem('last_notification_watermark', latestTxTime.toString());

      // 3. Visualmente marcamos todo como leído
      const readNotifs = notifications.map(n => ({ ...n, read: true }));
      setNotifications(readNotifs);
      setUnreadCount(0);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm sticky top-0 z-40">
        {/* Menú Hamburguesa y Logo */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="lg:hidden flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">PM</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Pixel Money</span>
          </div>
        </div>

        <div className="flex-1"></div>

        {/* Acciones */}
        <div className="flex items-center space-x-3">
          <ThemeSwitch />

          {/* Campana */}
          <div className="relative">
            <button
              onClick={handleOpenNotifications}
              className={`p-2 rounded-xl transition-all duration-300 relative
                ${showNotifications ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'}
              `}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Panel */}
            {showNotifications && (
              <div className="absolute right-0 top-14 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden">
                
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">Notificaciones</h3>
                  {unreadCount === 0 && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCheck size={14} /> Leídas
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors relative group
                          ${!notification.read ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''}
                        `}
                      >
                        <div className="flex gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.colorClass}`}>
                            <notification.icon size={20} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm font-semibold ${!notification.read ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>
                                {notification.title}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                {notification.time}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                        
                        {/* Punto azul solo si no leída */}
                        {!notification.read && (
                          <div className="absolute top-4 right-2 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No tienes notificaciones recientes.</p>
                    </div>
                  )}
                </div>
                
                <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-medium">
                    Historial de actividad
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}