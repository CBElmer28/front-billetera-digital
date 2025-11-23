'use client';

import { useState, useEffect } from 'react';
import {Info} from 'lucide-react';

export default function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      transactions: true,
      security: true,
      promotions: false,
    },
    push: {
      transactions: true,
      security: true,
      promotions: false,
    },
    sms: {
      transactions: false,
      security: true,
      promotions: false,
    },
  });

  // Cargar preferencias guardadas
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationPreferences');
    if (savedNotifications) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Guardar preferencias cuando cambien
  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(notifications));
  }, [notifications]);

  const toggleNotification = (type: string, category: string) => {
    setNotifications(prev => ({
      ...prev,
      [type]: {
        ...prev[type as keyof typeof notifications],
        [category]: !prev[type as keyof typeof notifications][category as keyof typeof notifications.email],
      },
    }));
  };

  const getCategoryLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      transactions: 'Transacciones',
      security: 'Seguridad',
      promotions: 'Promociones'
    };
    return labels[key] || key;
  };


return (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notificaciones</h2>

    {/* Notificaciones por Email */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notificaciones por Email</h3>
      <div className="space-y-3">
        {Object.entries(notifications.email).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 dark:text-gray-200">{getCategoryLabel(key)}</span>
            <button
              onClick={() => toggleNotification('email', key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Notificaciones Push */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notificaciones Push</h3>
      <div className="space-y-3">
        {Object.entries(notifications.push).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 dark:text-gray-200">{getCategoryLabel(key)}</span>
            <button
              onClick={() => toggleNotification('push', key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

    {/* Notificaciones SMS */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Notificaciones SMS</h3>
      <div className="space-y-3">
        {Object.entries(notifications.sms).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-gray-800 dark:text-gray-200">{getCategoryLabel(key)}</span>
            <button
              onClick={() => toggleNotification('sms', key)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
                value ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4 flex items-start gap-2">
      <Info className="w-5 h-5 text-blue-700 dark:text-blue-400 mt-0.5" />
      <p className="text-blue-700 dark:text-blue-300 text-sm">
        Las preferencias de notificación se guardan localmente en tu dispositivo.
      </p>
    </div>
  </div>
);
}