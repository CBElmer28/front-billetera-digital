'use client';

import { useState } from 'react';
import { X, Users, Plus, Shield, UserCheck, Sparkles } from 'lucide-react';
import { apiClient } from '../../lib/api'; 

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({ isOpen, onClose, onGroupCreated }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!groupName.trim() || groupName.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      setLoading(false);
      return;
    }

    try {
      // Llamada limpia al backend
      const data = await apiClient.post('/groups', { 
        name: groupName.trim() 
      });

      console.log('Grupo creado:', data);
      onGroupCreated();
      onClose();
      setGroupName('');

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
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Crear Nuevo Grupo</h2>
                <p className="text-purple-100 text-sm">Comienza una nueva colaboración</p>
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

        {/* Beneficios de Crear Grupo */}
        <div className="p-6 border-b border-sky-100 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Serás el líder</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Administrador</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Puedes invitar</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Miembros</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-3 rounded-xl">
            <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Como líder, podrás gestionar miembros y aprobar retiros</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Campo de Nombre del Grupo */}
            <div>
              <label htmlFor="groupName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Nombre del Grupo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="groupName"
                  name="groupName"
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:focus:ring-purple-400 dark:focus:border-purple-400 transition-all duration-200"
                  placeholder="Ej: Ahorros Vacaciones, Junta Fin de Semana, Proyecto Familiar..."
                  maxLength={50}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Elige un nombre descriptivo para tu grupo
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {groupName.length}/50
                </p>
              </div>
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
                disabled={loading || !groupName.trim()}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl font-medium shadow-lg shadow-purple-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Grupo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Informativo */}
        <div className="bg-purple-50 dark:bg-purple-900/10 px-6 py-4 border-t border-purple-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            • Gestión colaborativa • Finanzas transparentes • Control total como líder •
          </p>
        </div>
      </div>
    </div>
  );
}