'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, Send, Shield, Loader2, Search, Lock } from 'lucide-react';
import { apiClient } from '../../lib/api';

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
  
  // Estados
  const [step, setStep] = useState(1); // 1: Buscar, 2: Monto/Pass
  const [phone, setPhone] = useState('');
  const [destOptions, setDestOptions] = useState<string[]>([]);
  const [destName, setDestName] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  
  const [amount, setAmount] = useState('');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Reset al cerrar
  useEffect(() => {
    if (!isOpen) {
        setStep(1);
        setPhone('');
        setAmount('');
        setPassword('');
        setError(null);
        setSuccess(false);
    }
  }, [isOpen]);

  // PASO 1: Buscar en Directorio
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (phone.length < 9) {
        setError("Celular inválido");
        setLoading(false);
        return;
    }

    try {
        const data: any = await apiClient.get(`/p2p/directory/${phone}`);
        
        if (!data.options || data.options.length === 0) {
            setError("Este número no tiene billeteras asociadas.");
            setLoading(false);
            return;
        }

        setDestName(data.name || "Usuario");
        setDestOptions(data.options);
        setSelectedApp(data.options[0]); // Seleccionar el primero por defecto
        setStep(2); // Avanzar

    } catch (err: any) {
        setError("Error al buscar destinatario.");
    } finally {
        setLoading(false);
    }
  };

  // PASO 2: Enviar Dinero
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const amountVal = parseFloat(amount);
    if (isNaN(amountVal) || amountVal <= 0) {
      setError("Monto inválido.");
      setLoading(false);
      return;
    }
    if (!password) {
      setError("Ingresa tu contraseña.");
      setLoading(false);
      return;
    }

    try {
      const idempotencyKey = uuidv4();

      // Payload compatible con el Gateway (inyecta user_id)
      const payload = {
        to_bank: selectedApp,
        destination_phone_number: phone,
        amount: amountVal,
        description: description || "Transferencia Externa",
        confirmationPassword: password // <--- ¡LA CLAVE!
      };

      await apiClient.request('/ledger/transfer-central', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-100 dark:bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            Transferencia Interbancaria
          </h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">¡Enviado!</h3>
              <p className="text-slate-500">Tu dinero está en camino.</p>
            </div>
          ) : step === 1 ? (
            // --- FORMULARIO PASO 1: BUSCAR ---
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Celular del Destinatario
                </label>
                <div className="relative">
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g,''))}
                        className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                        placeholder="999 000 111"
                        maxLength={9}
                    />
                    <Search className="absolute right-3 top-3.5 text-slate-400 w-5 h-5" />
                </div>
              </div>
              {error && <p className="text-rose-500 text-sm text-center">{error}</p>}
              <button 
                disabled={loading || phone.length < 9}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold disabled:opacity-50 flex justify-center"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Buscar Destino"}
              </button>
            </form>
          ) : (
            // --- FORMULARIO PASO 2: DATOS ---
            <form onSubmit={handleTransfer} className="space-y-4 animate-in fade-in slide-in-from-right-4">
              
              {/* Info Destinatario */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Enviando a</p>
                    <p className="font-bold text-slate-800 dark:text-white">{destName}</p>
                    <p className="text-xs text-slate-500">{phone}</p>
                </div>
                <button type="button" onClick={() => setStep(1)} className="text-xs text-blue-500 underline">Cambiar</button>
              </div>

              {/* Selector de Banco */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Destino</label>
                <select 
                    value={selectedApp}
                    onChange={(e) => setSelectedApp(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                >
                    {destOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Monto (S/)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-lg"
                    placeholder="0.00"
                />
              </div>

              {/* Contraseña (Seguridad) */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Confirma con tu contraseña</label>
                <div className="relative">
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl"
                        placeholder="••••••••"
                    />
                    <Lock className="absolute left-3 top-3.5 text-slate-400 w-4 h-4" />
                </div>
              </div>

              {error && <p className="text-rose-500 text-sm text-center bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg">{error}</p>}

              <button 
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold disabled:opacity-50 flex justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <> <Shield size={18}/> Confirmar Envío </>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}