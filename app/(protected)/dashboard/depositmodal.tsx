'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, TrendingUp, DollarSign, Clock, Shield, User } from 'lucide-react';
import { apiClient } from '../../lib/api'; // Ruta corregida

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanSuccess: () => void;
}

export default function LoanModal({ isOpen, onClose, onLoanSuccess }: LoanModalProps) {
  const [amount, setAmount] = useState('');
  const [dni, setDni] = useState(''); // NUEVO: Estado para DNI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Por favor, ingresa un monto válido.');
      setLoading(false);
      return;
    }

    if (depositAmount > 500) {
      setError('El monto máximo permitido es S/ 500.00');
      setLoading(false);
      return;
    }

    // NUEVO: Validación simple de DNI en frontend
    if (!dni || dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError('Por favor, ingresa un DNI válido de 8 dígitos.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      // NUEVO: Enviamos 'dni' junto con 'amount'
      await apiClient.post('/request-loan', { 
        amount: depositAmount,
        dni: dni 
      });

      console.log('Préstamo exitoso');
      onLoanSuccess();
      onClose();
      setAmount('');
      setDni(''); // Limpiamos DNI también

    } catch (err: any) {
      setError(err.message || 'Error al procesar el préstamo');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-sky-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Solicitar Préstamo</h2>
                <p className="text-sky-100 text-sm">Validación con RENIEC en tiempo real</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLoanRequest} className="p-6">
          <div className="space-y-4">
            
            {/* NUEVO: Campo DNI */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                DNI (Requerido)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  maxLength={8}
                  required
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))} // Solo permite números
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
                  placeholder="Ingresa tu DNI"
                />
              </div>
            </div>

            {/* Campo Monto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monto a Solicitar (S/)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="500"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400"
                  placeholder="0.00"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">Se aplicará un interés del 5%</p>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 p-4 rounded-xl text-rose-700 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium">
                Cancelar
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl font-medium shadow-lg flex justify-center gap-2">
                {loading ? 'Validando...' : 'Solicitar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}