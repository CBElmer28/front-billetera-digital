'use client';

import { useState } from 'react';
import { apiClient } from '../../lib/api'; // 👈 Importar

export default function SecuritySettings() {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    if (error) setError(null);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.confirm_password) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }
    if (passwordData.new_password.length < 8) {
      setError('Mínimo 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      // 👇 Usamos apiClient.post
      await apiClient.post('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password
      });

      setSuccess('Contraseña cambiada correctamente');
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
        setSuccess(null);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Seguridad</h2>

      {/* Mensajes */}
      {error && <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">{error}</div>}
      {success && <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">{success}</div>}

      {/* Cambio de Contraseña */}
      <div className="p-6 border border-slate-200 dark:border-slate-700 rounded-xl">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium text-slate-800 dark:text-white">Contraseña</h3>
            <p className="text-sm text-slate-500">Mantén tu cuenta segura</p>
          </div>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Cambiar
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4 max-w-md">
            {/* Inputs igual que antes pero con estilos limpios */}
            <input
              type="password"
              name="current_password"
              placeholder="Contraseña Actual"
              value={passwordData.current_password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600"
              required
            />
            <input
              type="password"
              name="new_password"
              placeholder="Nueva Contraseña"
              value={passwordData.new_password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600"
              required
            />
            <input
              type="password"
              name="confirm_password"
              placeholder="Confirmar Nueva Contraseña"
              value={passwordData.confirm_password}
              onChange={handlePasswordChange}
              className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-600"
              required
            />
            <div className="flex gap-2">
              <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button type="button" onClick={() => setShowChangePassword(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300">
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}