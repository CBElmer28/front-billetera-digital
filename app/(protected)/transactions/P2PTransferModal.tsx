'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Phone, DollarSign, Send, Shield, Zap, UserCheck, Loader2, User } from 'lucide-react';
import { apiClient } from '../../lib/api'; // Ajusta la ruta si es necesario

interface P2PTransferModalProps {
  onTransferSuccess: () => void;
}

export default function P2PTransferModal({ onTransferSuccess }: P2PTransferModalProps) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState<string | null>(null); // NUEVO: Nombre del destinatario
  const [isChecking, setIsChecking] = useState(false); // NUEVO: Cargando nombre
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Efecto: Buscar nombre cuando el teléfono tiene 9 dígitos
  useEffect(() => {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Si borra el número, borramos el nombre
    if (cleanPhone.length < 9) {
      setRecipientName(null);
      setError(null);
      return;
    }

    // Si tiene 9 dígitos, buscamos
    if (cleanPhone.length === 9) {
      const checkUser = async () => {
        setIsChecking(true);
        setError(null);
        try {
          const data: any = await apiClient.get(`/p2p/check/${cleanPhone}`);
          setRecipientName(data.name); // Guardamos el nombre
        } catch (err: any) {
          setRecipientName(null);
          // Si es 404 es que no existe, si es otro es error
          if (err.message.includes('404')) {
            setError('Este número no está registrado en Pixel Money.');
          } else {
            console.error(err);
          }
        } finally {
          setIsChecking(false);
        }
      };
      
      // Debounce pequeño para no spamear si escribe muy rápido
      const timeoutId = setTimeout(checkUser, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const transferAmount = parseFloat(amount);
    const cleanPhone = phone.replace(/\D/g, '');

    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Monto inválido.');
      setLoading(false);
      return;
    }
    
    // Validación extra: No enviar si no se encontró usuario
    if (!recipientName) {
      setError('Debes ingresar un destinatario válido.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      await apiClient.request('/ledger/transfer/p2p', {
        method: 'POST',
        body: JSON.stringify({ 
          amount: transferAmount,
          destination_phone_number: cleanPhone
        }),
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      setSuccess(true);
      setTimeout(() => {
        onTransferSuccess();
        setAmount('');
        setPhone('');
        setRecipientName(null); // Limpiar
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-sky-100 dark:border-slate-700 overflow-hidden w-full max-w-md">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Transferencia P2P</h2>
            <p className="text-sky-100 text-sm">Envía dinero a otro usuario</p>
          </div>
        </div>
      </div>

      {/* Estado de Éxito */}
      {success && (
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">¡Transferencia exitosa!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Enviado a {recipientName}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          
          {/* Campo de Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Celular del Destinatario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200"
                placeholder="Ej: 987654321"
                maxLength={9}
                required
                disabled={loading || success}
              />
            </div>
            
            {/* ZONA DE CONFIRMACIÓN DE NOMBRE (NUEVO) */}
            <div className="mt-2 h-6">
              {isChecking && (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin" /> Buscando usuario...
                </div>
              )}
              {recipientName && !isChecking && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
                  <UserCheck className="w-4 h-4" /> Destinatario: {recipientName}
                </div>
              )}
            </div>
          </div>

          {/* Campo de Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Monto a Transferir (S/)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400"
                placeholder="0.00"
                required
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
              <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botón de Envío - Deshabilitado si no hay nombre */}
          <button
            type="submit"
            disabled={loading || success || !phone.trim() || !amount.trim() || !recipientName}
            className="w-full py-3.5 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Procesando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> Enviar a {recipientName?.split(' ')[0] || '...'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}