'use client';

import { useState, useEffect } from 'react';
import ExternalTransferModal from './ExternalTransferModal';

export default function TransactionsPage() {
  const [showModal, setShowModal] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState<string>(""); 
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // CONEXIÓN DIRECTA (Sin importar nada externo para evitar errores)
        const API_URL = 'https://auth-microservice-vxcl.onrender.com';
        const token = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : null;

        const response = await fetch(`${API_URL}/auth/me`, {
           headers: {
             'Content-Type': 'application/json',
             ...(token && { 'Authorization': `Bearer ${token}` }),
           }
        });
        
        if (response.ok) {
           const data = await response.json();
           if (data?.phone_number) {
               setUserIdentifier(data.phone_number);
           }
        }
      } catch (error) {
        console.error("Error identificando usuario", error);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="p-6 text-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mis Transacciones</h1>
          <p className="text-gray-400 text-sm">Gestiona tus movimientos y transferencias</p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)}
          disabled={loadingUser || !userIdentifier}
          className={`font-bold py-2.5 px-5 rounded-lg transition-all flex items-center gap-2 shadow-lg ${
            loadingUser || !userIdentifier
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20 active:scale-95'
          }`}
        >
          <span className="text-xl">💸</span> 
          <span>{loadingUser ? 'Cargando...' : 'Nueva Transferencia'}</span>
        </button>
      </div>

      <div className="bg-[#1a1a1a] p-10 rounded-xl border border-gray-800 text-gray-500 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-3xl opacity-50">
          📊
        </div>
        <p className="text-lg font-medium text-gray-300">Historial de Movimientos</p>
        <p className="text-sm max-w-sm mt-1">
          Aquí aparecerá tu lista de transacciones recientes.
        </p>
      </div>

      <ExternalTransferModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        currentUserIdentifier={userIdentifier}
      />
    </div>
  );
}