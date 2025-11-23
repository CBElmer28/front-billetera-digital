'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Eye, Settings, Shield, Mail, Phone, AlertTriangle } from 'lucide-react';
import UserProfileSection from './UserProfileSection';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';
import { useNotification } from '../../contexts/NotificationContext'; // 👈 Ajusta ruta
import { apiClient } from '../../lib/api'; // 👈 Usamos apiClient

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('perfil');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 👇 ¡MIRA QUÉ LIMPIO! Una sola línea reemplaza todo el bloque anterior
      const data: any = await apiClient.get('/auth/me');
      
      setUserData(data);
      // showNotification('Datos cargados', 'success'); // Opcional
    } catch (err: any) {
      console.error(err);
      setError('No se pudo cargar la información del usuario.');
      if (err.message?.includes('401')) {
         // Si el token expiró, el apiClient o el usuario lo manejarán
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: <User className="w-5 h-5" />, description: 'Gestiona tu información personal' },
    { id: 'seguridad', label: 'Seguridad', icon: <Lock className="w-5 h-5" />, description: 'Contraseñas y autenticación' },
    { id: 'notificaciones', label: 'Notificaciones', icon: <Bell className="w-5 h-5" />, description: 'Preferencias de notificaciones' },
    { id: 'privacidad', label: 'Privacidad', icon: <Eye className="w-5 h-5" />, description: 'Controla tu privacidad' },
  ];

  if (loading && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-light text-slate-800 dark:text-white mb-4">Configuración</h1>
          
          {/* Tarjeta Usuario */}
          {userData && (
            <div className="inline-flex items-center gap-4 bg-white dark:bg-slate-800 px-6 py-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="w-10 h-10 bg-sky-500 rounded-full flex items-center justify-center text-white">
                <User />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 dark:text-white">{userData.name}</p>
                <p className="text-sm text-slate-500">{userData.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:w-64 flex-shrink-0 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left p-4 rounded-xl transition-all flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            {activeTab === 'perfil' && userData && (
              <UserProfileSection userData={userData} onUpdate={fetchUserData} />
            )}
            {activeTab === 'seguridad' && <SecuritySettings />}
            {activeTab === 'notificaciones' && <NotificationSettings />}
            {activeTab === 'privacidad' && <PrivacySettings />}
          </div>
        </div>
      </div>
    </div>
  );
}