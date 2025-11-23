'use client';

import { useState } from 'react';

const AVAILABLE_APPS = [
  { id: 'LUCA', name: 'Billetera Luca' },
  { id: 'PLAY MONEY', name: 'Play Money' },
  { id: 'YAPE', name: 'Yape' },
  { id: 'PLIN', name: 'Plin' },
  { id: 'BCP', name: 'Banco BCP' },
  { id: 'INTERBANK', name: 'Interbank' },
];

interface ExternalTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserIdentifier: string; 
}

export default function ExternalTransferModal({ 
  isOpen, 
  onClose, 
  currentUserIdentifier 
}: ExternalTransferModalProps) {
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    toIdentifier: '',
    toAppName: AVAILABLE_APPS[0].id, // Por defecto LUCA
    amount: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.toIdentifier || formData.toIdentifier.length < 9) {
      setError("El identificador debe tener al menos 9 caracteres.");
      setLoading(false);
      return;
    }
    
    const amountVal = parseFloat(formData.amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError("El monto debe ser mayor a 0.");
      setLoading(false);
      return;
    }

    try {
      // Generamos ID único para la transacción (Requisito de la API)
      const uniqueTxId = `TX${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const payload = {
        fromIdentifier: currentUserIdentifier,
        toIdentifier: formData.toIdentifier,
        toAppName: formData.toAppName,
        amount: amountVal,
        externalTransactionId: uniqueTxId
      };

      console.log("🚀 Enviando a API Central:", payload);

      // URL de la API Centralizada
      const API_URL = 'https://centralized-wallet-api-production.up.railway.app/api/v1/sendTransfer';
      const userToken = typeof window !== 'undefined' ? localStorage.getItem('pixel-token') : '';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-token': 'pixel-token',       // Header requerido
          'Authorization': `Bearer ${userToken}` // Token del usuario
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.message || data.detail || "Error desconocido";
        if (Array.isArray(errorMessage)) {
             errorMessage = errorMessage.map((err: any) => `${err.msg}`).join(', ');
        }
        throw new Error(errorMessage);
      }

      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        onClose();
        window.location.reload(); // Recarga la página
      }, 2000);

    } catch (err: any) {
      console.error("Error API:", err);
      setError(err.message || "Ocurrió un error al conectar con la API Central.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#121212] border border-gray-800 w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-[#1a1a1a] px-6 py-4 flex justify-between items-center border-b border-gray-800">
          <h3 className="text-lg font-bold text-white tracking-tight">Transferencia Externa</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full">✕</button>
        </div>

        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-white mb-2">¡Envío Exitoso!</h4>
              <p className="text-gray-400">Transferencia realizada correctamente.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Destino</label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="relative">
                    <select
                      name="toAppName"
                      value={formData.toAppName}
                      onChange={handleChange}
                      className="w-full appearance-none bg-[#1E1E1E] border border-gray-700 text-white rounded-lg px-4 py-3 pr-8 focus:border-green-500 outline-none transition-all"
                    >
                      {AVAILABLE_APPS.map((app) => (
                        <option key={app.id} value={app.id}>{app.name}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  <input
                    type="text"
                    name="toIdentifier"
                    placeholder="Celular / ID del destinatario"
                    value={formData.toIdentifier}
                    onChange={handleChange}
                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white rounded-lg p-3 focus:border-green-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium">Monto</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">S/</span>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full bg-[#1E1E1E] border border-gray-700 text-white rounded-lg p-3 pl-10 text-lg font-medium focus:border-green-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 rounded-lg transition-all disabled:opacity-50 mt-2 shadow-lg shadow-green-900/20 flex justify-center items-center gap-2"
              >
                {loading ? 'Procesando...' : 'Confirmar Envío'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}