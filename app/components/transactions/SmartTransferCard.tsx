'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Search, Send, Shield, Loader2, CheckCircle2, AlertCircle, Building2, User } from 'lucide-react';
import { apiClient } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

export default function SmartTransferCard() {
  const { showNotification } = useNotification();
  
  // --- Estados del Flujo ---
  const [step, setStep] = useState(1); // 1: Buscar, 2: Datos y Confirmar
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- Datos del Paso 1 (Búsqueda) ---
  const [phoneQuery, setPhoneQuery] = useState('');

  // --- Datos del Paso 2 (Resultado y Envío) ---
  const [destName, setDestName] = useState('');
  const [destPhone, setDestPhone] = useState('');
  const [availableBanks, setAvailableBanks] = useState<string[]>([]);
  
  const [selectedBank, setSelectedBank] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [password, setPassword] = useState('');

  // --- LÓGICA PASO 1: BUSCAR ---
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (phoneQuery.length < 9) {
      setError("Ingresa un número de celular válido (9 dígitos).");
      return;
    }
    setLoading(true);

    try {
      // Consultamos el directorio inteligente del Gateway
      const data: any = await apiClient.get(`/p2p/directory/${phoneQuery}`);
      
      if (!data.options || data.options.length === 0) {
        setError("Este número no tiene cuentas asociadas en ningún banco aliado.");
        setLoading(false);
        return;
      }

      // Guardamos resultados y avanzamos
      setDestName(data.name || "Usuario");
      setDestPhone(data.phone);
      setAvailableBanks(data.options);
      setSelectedBank(data.options[0]); // Seleccionar el primero por defecto
      setStep(2);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al buscar el destinatario.");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA PASO 2: TRANSFERIR ---
  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountVal = parseFloat(amount);

    // Validaciones
    if (isNaN(amountVal) || amountVal <= 0) return setError("Ingresa un monto válido.");
    if (!password) return setError("Debes ingresar tu contraseña para confirmar.");
    if (!selectedBank) return setError("Selecciona un banco destino.");

    setLoading(true);

    try {
      const idempotencyKey = uuidv4();

      // Payload exacto que espera el Gateway (incluyendo la contraseña)
      const payload = {
        to_bank: selectedBank,
        destination_phone_number: destPhone,
        amount: amountVal,
        description: description || "Transferencia",
        confirmationPassword: password 
      };

      // Usamos SIEMPRE el endpoint centralizado del Gateway.
      // Él sabrá si es interno (Pixel) o externo (Luca) basado en 'to_bank'.
      await apiClient.request('/ledger/transfer-central', {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Idempotency-Key': idempotencyKey }
      });

      setSuccess(true);
      showNotification('Transferencia realizada con éxito', 'success');
      // Resetear formulario después de 3s
      setTimeout(() => {
        resetForm();
      }, 3000);

    } catch (err: any) {
      // Si el error es de contraseña, el backend devuelve 401 y el apiClient lanza el error.
      setError(err.message || "Error al realizar la transferencia.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setPhoneQuery('');
    setAmount('');
    setPassword('');
    setDescription('');
    setSuccess(false);
    setError(null);
  };

  // --- RENDERIZADO ---
  
  if (success) {
    return (
      <div className="bg-slate-800 rounded-2xl p-8 text-center border border-slate-700 shadow-xl animate-in fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-500/10 z-0 pointer-events-none"></div>
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 z-10 relative">
          <CheckCircle2 size={40} />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">¡Transferencia Exitosa!</h3>
        <p className="text-slate-400 relative z-10">Has enviado S/ {parseFloat(amount).toFixed(2)} a {destName}.</p>
        <button onClick={resetForm} className="mt-8 text-blue-400 hover:text-blue-300 text-sm font-semibold relative z-10">
          Hacer otra transferencia
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
      {/* Header de la tarjeta */}
      <div className="bg-slate-800/50 p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-blue-500/20 p-2 rounded-lg text-blue-500">
            <Send size={24} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-white">Enviar Dinero</h2>
            <p className="text-sm text-slate-400">Transfiere a Pixel Money o bancos aliados</p>
        </div>
      </div>

      <div className="p-6 relative">
        {/* Indicador de Pasos */}
        {step === 2 && (
            <button onClick={() => setStep(1)} className="absolute top-6 right-6 text-sm text-blue-400 hover:underline z-10">
                ← Volver a buscar
            </button>
        )}

        {error && (
          <div className="mb-6 bg-rose-500/10 border border-rose-500/50 text-rose-500 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 1 ? (
          // --- FORMULARIO PASO 1: BUSCAR ---
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2 pl-1">
                Número de Celular del Destinatario
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-5 pr-12 py-4 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium transition-all"
                  placeholder="999 000 111"
                  maxLength={9}
                  autoFocus
                />
                <Search className="absolute right-4 top-4.5 text-slate-500 w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 mt-2 pl-1">Buscaremos en todos los bancos asociados.</p>
            </div>

            <button
              type="submit"
              disabled={loading || phoneQuery.length < 9}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:hover:bg-blue-600 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Buscar Destinatario <Search size={20}/></>}
            </button>
          </form>
        ) : (
          // --- FORMULARIO PASO 2: DATOS Y CONFIRMAR ---
          <form onSubmit={handleTransfer} className="space-y-6 animate-in slide-in-from-right-4">
            
            {/* Resumen del Destinatario */}
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 flex items-start gap-4">
                <div className="bg-slate-700/50 p-3 rounded-full">
                    <User className="text-slate-300" size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">{destName}</h3>
                    <p className="text-slate-400">{destPhone}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Selector de Banco */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 pl-1">Banco Destino</label>
                  <div className="relative">
                      <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                      >
                          {availableBanks.map(bank => (
                              <option key={bank} value={bank} className="bg-slate-800">{bank}</option>
                          ))}
                      </select>
                      <Building2 className="absolute left-4 top-3.5 text-slate-500 w-5 h-5 pointer-events-none" />
                  </div>
                </div>

                {/* Monto */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 pl-1">Monto a enviar</label>
                  <div className="relative">
                      <span className="absolute left-4 top-3.5 text-slate-400 font-bold">S/</span>
                      <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xl font-bold"
                          placeholder="0.00"
                          step="0.01"
                      />
                  </div>
                </div>
            </div>

            {/* Descripción Opcional */}
            <div>
               <label className="block text-sm font-medium text-slate-300 mb-2 pl-1">Nota (Opcional)</label>
               <input
                   type="text"
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="Ej: Pago de cena"
               />
            </div>

            {/* Contraseña de Seguridad */}
            <div className="pt-4 border-t border-slate-700">
              <label className="block text-sm font-medium text-slate-300 mb-3 pl-1 flex items-center gap-2">
                <Shield size={16} className="text-emerald-500" /> Confirma con tu contraseña
              </label>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-emerald-500/30 rounded-xl text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Ingresa tu contraseña para autorizar"
              />
              <p className="text-xs text-slate-500 mt-2 pl-1">Requerido por seguridad para validar la operación.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Confirmar y Enviar <Send size={20} /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}