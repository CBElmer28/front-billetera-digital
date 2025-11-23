'use client';

import { useState, useEffect } from 'react';
import { X, Phone, UserPlus, Users, Shield, Mail, CheckCircle, Loader2, UserCheck } from 'lucide-react';
import { apiClient } from '../../lib/api';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
  group: { id: number; name: string }; 
}

export default function InviteModal({
  isOpen,
  onClose,
  onInviteSuccess,
  group
}: InviteModalProps) {

  const [phoneToInvite, setPhoneToInvite] = useState(''); 
  const [inviteeName, setInviteeName] = useState<string | null>(null); // NUEVO: Nombre
  const [isChecking, setIsChecking] = useState(false); // NUEVO: Cargando nombre
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // EFECTO: Buscar nombre automáticamente
  useEffect(() => {
    const cleanPhone = phoneToInvite.replace(/\D/g, '');
    
    if (cleanPhone.length < 9) {
      setInviteeName(null);
      setError(null);
      return;
    }

    if (cleanPhone.length === 9) {
      const checkUser = async () => {
        setIsChecking(true);
        setError(null);
        try {
          // Reusamos el endpoint que creamos para P2P
          const data: any = await apiClient.get(`/p2p/check/${cleanPhone}`);
          setInviteeName(data.name);
        } catch (err: any) {
          setInviteeName(null);
          if (err.message.includes('404')) {
            setError('Usuario no encontrado en Pixel Money.');
          }
        } finally {
          setIsChecking(false);
        }
      };
      const timeoutId = setTimeout(checkUser, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [phoneToInvite]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const cleanPhone = phoneToInvite.replace(/\D/g, '');
    
    if (!inviteeName) {
      setError('Debes ingresar un usuario válido.');
      setLoading(false);
      return;
    }

    try {
      await apiClient.post(`/groups/${group.id}/invite`, {
        phone_number_to_invite: cleanPhone
      });

      setSuccess(true);
      setTimeout(() => {
        onInviteSuccess();
        onClose();
        setPhoneToInvite('');
        setInviteeName(null);
        setSuccess(false);
      }, 1500);

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
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Invitar Miembro</h2>
                <p className="text-amber-100 text-sm">Amplía tu comunidad</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info Grupo */}
        <div className="p-6 border-b border-sky-100 dark:border-slate-700">
          <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estás invitando a</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Mensaje Éxito */}
        {success && (
          <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">¡Invitación enviada!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">El usuario recibirá una notificación</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Número de Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="tel"
                  value={phoneToInvite}
                  onChange={(e) => setPhoneToInvite(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 transition-all duration-200"
                  placeholder="987654321"
                  maxLength={9}
                  disabled={loading || success}
                />
              </div>
              
              {/* CONFIRMACIÓN DE NOMBRE */}
              <div className="mt-2 h-6">
                {isChecking && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando usuario...
                  </div>
                )}
                {inviteeName && !isChecking && (
                  <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
                    <UserCheck className="w-4 h-4" /> Invitar a: {inviteeName}
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} disabled={loading || success} className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success || !inviteeName}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl font-medium shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><UserPlus className="w-4 h-4" /> Invitar</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}