'use client';
import { useState } from 'react';
import { X, DollarSign, FileText, Shield, Users, TrendingUp } from 'lucide-react';
import { apiClient } from '../../../lib/api';

interface LeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdrawalSuccess: () => void;
  group: { id: number; name: string };
}

export default function LeaderWithdrawalModal({ isOpen, onClose, onWithdrawalSuccess, group }: any) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post(`/groups/${group.id}/leader-withdrawal`, {
        amount: parseFloat(amount),
        reason: `Retiro de líder: ${reason}`
      });

      onWithdrawalSuccess();
      onClose();
      setAmount('');
      setReason('');
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
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Retiro de Líder</h2>
                <p className="text-sky-100 text-sm">Transferencia a tu billetera personal</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Grupo</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Campo de Monto */}
            <div>
              <label htmlFor="amount_lead" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Monto a Retirar (S/)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="amount_lead"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">PEN</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                El monto se transferirá a tu billetera personal
              </p>
            </div>

            {/* Campo de Razón */}
            <div>
              <label htmlFor="reason_lead" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Razón del Retiro (Opcional)
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <textarea
                  id="reason_lead"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 resize-none"
                  placeholder="Ej: Pago de servicios, Compra de materiales, etc."
                />
              </div>
            </div>

            {/* Información de Seguridad */}
            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
              <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <span>Esta transacción quedará registrada en el historial del grupo y será visible para todos los miembros.</span>
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
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Confirmar Retiro
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Informativo */}
        <div className="bg-sky-50 dark:bg-sky-900/10 px-6 py-4 border-t border-sky-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            • Transacción segura • Registro en historial • Aprobación inmediata •
          </p>
        </div>
      </div>
    </div>
  );
}