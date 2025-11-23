'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Para redirigir al login
// 👇 Importaciones corregidas (3 niveles hacia arriba)
import { apiClient } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

interface PrivacySettings {
  profileVisibility: string;
  dataSharing: boolean;
  personalizedAds: boolean;
}

export default function PrivacySettings() {
  // 👇 Inicializamos los hooks aquí
  const { showNotification } = useNotification();
  const router = useRouter();

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    // Evitamos error de hidratación verificando window
    if (typeof window !== 'undefined') {
      const savedPrivacy = localStorage.getItem('privacySettings');
      return savedPrivacy ? JSON.parse(savedPrivacy) : {
        profileVisibility: 'friends',
        dataSharing: false,
        personalizedAds: false,
      };
    }
    return {
      profileVisibility: 'friends',
      dataSharing: false,
      personalizedAds: false,
    };
  });

  // Guardar configuración cuando cambie
  useEffect(() => {
    localStorage.setItem('privacySettings', JSON.stringify(privacySettings));
  }, [privacySettings]);

  const handlePrivacyChange = (setting: string, value: string | boolean) => {
    setPrivacySettings((prev: PrivacySettings) => ({
      ...prev,
      [setting]: value,
    }));
  };

  const handleExportData = () => {
    // Simular exportación de datos
    const userData = {
      profile: localStorage.getItem('notificationPreferences'),
      privacy: localStorage.getItem('privacySettings'),
      exportedAt: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pixel-money-data-${new Date().getTime()}.json`;
    link.click();
    
    showNotification('Datos exportados exitosamente', 'success'); // Usamos notificación bonita
  };

  // 👇 AQUÍ ESTÁ LA LÓGICA NUEVA PARA ELIMINAR CUENTA
  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Estás SEGURO? Esta acción eliminará tu cuenta permanentemente. Si tienes deudas, no podrás hacerlo.')) {
      return;
    }

    try {
      // Llamamos al endpoint de eliminación (que verifica la deuda en el backend)
      await apiClient.delete('/auth/me');
      
      // Si tiene éxito:
      showNotification('Cuenta eliminada. Lamentamos verte partir.', 'success');
      localStorage.clear(); // Borrar token y datos
      router.push('/login'); // Mandar al login
      
    } catch (err: any) {
      // Aquí atrapamos el error si tienes deuda (mensaje rojo)
      showNotification(err.message || 'Error al eliminar cuenta', 'error');
    }
  };

  
  return (
  <div className="space-y-6">
    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Privacidad</h2>

    {/* Visibilidad del Perfil */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4">Visibilidad del Perfil</h3>
      <div className="space-y-3">
        {[
          { value: 'public', label: 'Público', description: 'Cualquiera puede ver tu perfil' },
          { value: 'friends', label: 'Solo Amigos', description: 'Solo tus amigos pueden ver tu perfil' },
          { value: 'private', label: 'Privado', description: 'Solo tú puedes ver tu perfil' },
        ].map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={option.value}
              name="profileVisibility"
              value={option.value}
              checked={privacySettings.profileVisibility === option.value}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <label htmlFor={option.value} className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-200">
              <span className="font-medium">{option.label}</span>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{option.description}</p>
            </label>
          </div>
        ))}
      </div>
    </div>

    {/* Compartir Datos */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Compartir Datos Anónimos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ayúdanos a mejorar el servicio compartiendo datos de uso anónimos
          </p>
        </div>
        <button
          onClick={() => handlePrivacyChange('dataSharing', !privacySettings.dataSharing)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
            privacySettings.dataSharing ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              privacySettings.dataSharing ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>

    {/* Publicidad Personalizada */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Publicidad Personalizada</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrar anuncios relevantes basados en tu actividad
          </p>
        </div>
        <button
          onClick={() => handlePrivacyChange('personalizedAds', !privacySettings.personalizedAds)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${
            privacySettings.personalizedAds ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
              privacySettings.personalizedAds ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>

    {/* Exportar Datos */}
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">Exportar Mis Datos</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Descarga una copia de toda tu información</p>
        </div>
        <button 
          onClick={handleExportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Exportar Datos
        </button>
      </div>
    </div>

    {/* Eliminar Cuenta */}
    <div className="bg-red-50 dark:bg-red-800 rounded-lg p-6 border border-red-200 dark:border-red-700 transition-all duration-300 hover:bg-red-100 dark:hover:bg-red-700">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-red-800 dark:text-red-300">Eliminar Cuenta</h3>
          <p className="text-sm text-red-600 dark:text-red-400">Esta acción no se puede deshacer</p>
        </div>
        <button 
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
        >
          Eliminar Cuenta
        </button>
      </div>
    </div>
  </div>
);

}