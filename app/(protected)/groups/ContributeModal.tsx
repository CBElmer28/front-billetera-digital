'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, DollarSign, Users, Gift, Shield, TrendingUp } from 'lucide-react';
import { apiClient } from '../../lib/api'; // 👈 Importar

interface ContributeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContributeSuccess: () => void;
  group: { id: number; name: string };
}

export default function ContributeModal({ isOpen, onClose, onContributeSuccess, group }: ContributeModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const contributeAmount = parseFloat(amount);
    if (isNaN(contributeAmount) || contributeAmount <= 0) {
      setError('Ingresa un monto válido.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      // Usamos apiClient.post pasando el header de idempotencia en opciones
      await apiClient.request('/ledger/contribute', {
        method: 'POST',
        body: JSON.stringify({
          amount: contributeAmount,
          group_id: group.id
        }),
        headers: {
          'Idempotency-Key': idempotencyKey // Header especial
        }
      });

      console.log('Aporte exitoso');
      onContributeSuccess();
      onClose();
      setAmount('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
 
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-sky-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Aportar al Grupo</h2>
                <p className="text-emerald-100 text-sm">Fortalece las finanzas del grupo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Información del Grupo */}
        <div className="p-6 border-b border-sky-100 dark:border-slate-700">
          <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estás aportando a</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Beneficios del Aporte */}
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Tu aporte crece el fondo común</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Todos los miembros se benefician del crecimiento</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Campo de Monto */}
            <div>
              <label htmlFor="amount_contribute" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Monto a Aportar (S/)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="amount_contribute"
                  name="amount_contribute"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:focus:ring-emerald-400 dark:focus:border-emerald-400 transition-all duration-200"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">PEN</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Ingresa el monto que deseas aportar al fondo del grupo
              </p>
            </div>

            {/* Información de Seguridad */}
            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
              <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <span>Tu aporte se transferirá inmediatamente al fondo común del grupo y quedará registrado en el historial.</span>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 rounded-xl font-medium shadow-lg shadow-emerald-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Gift className="w-4 h-4" />
                    Confirmar Aporte
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Informativo */}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 px-6 py-4 border-t border-emerald-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            • Transacción inmediata • Historial registrado • Fondo común fortalecido •
          </p>
        </div>
      </div>
    </div>
  );
}