'use client';

import { useState } from 'react';
import { User, Lock, Bell, Eye, Settings } from 'lucide-react';
import UserProfileSection from './UserProfileSection';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { apiClient } from '../../lib/api';
import { usePolling } from '../../../hooks/usePolling';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  avatar?: string;
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    setError(null);
    try {
      const data: any = await apiClient.get('/auth/me');
      setUserData(data);
    } catch (err: any) {
      console.error(err);
      if (!isAutoRefresh) setError('No se pudo cargar la información del usuario.');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  // Mantenemos los datos frescos
  usePolling(fetchUserData, 10000);

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: <User className="w-5 h-5" />, description: 'Datos personales' },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock className="w-5 h-5" />, description: 'Contraseña y acceso' },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-5 h-5" />, description: 'Alertas y avisos' },
    { id: 'privacidad', label: 'Privacidad', icon: <Eye className="w-5 h-5" />, description: 'Control de datos' },
  ];

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 animate-in fade-in duration-500">
      <div className="max-w-6xl mx-auto">
        
        {/* 1. HEADER MEJORADO */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
              Configuración de Cuenta
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus preferencias y seguridad
            </p>
          </div>

          {/* 2. TARJETA DE IDENTIDAD "HERO" */}
          {userData && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 min-w-[280px]">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-500/20">
                {userData.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-white text-sm">{userData.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{userData.email}</p>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full mt-1 inline-block font-medium">
                  Cuenta Verificada
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 3. SIDEBAR DE NAVEGACIÓN ESTILIZADO */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-700 sticky top-24">
              <div className="space-y-1">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700 group-hover:bg-white dark:group-hover:bg-slate-600'} transition-colors`}>
                        {tab.icon}
                      </div>
                      <div>
                        <span className={`font-semibold text-sm block ${isActive ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                          {tab.label}
                        </span>
                        <span className={`text-xs block ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                          {tab.description}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {activeTab === 'perfil' && userData && (
                <UserProfileSection userData={userData} onUpdate={() => fetchUserData(false)} />
              )}
              {activeTab === 'seguridad' && <SecuritySettings />}
              {activeTab === 'notificaciones' && <NotificationSettings />}
              {activeTab === 'privacidad' && <PrivacySettings />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}