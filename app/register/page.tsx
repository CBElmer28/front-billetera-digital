'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Phone, ArrowRight, Smartphone, Loader2, FileBadge } from 'lucide-react'; // Importar FileBadge para DNI
import { apiClient } from '../lib/api'; 
import { useNotification } from '../contexts/NotificationContext';

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    dni: '',        // <--- CAMBIO: Usamos DNI
    email: '',
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validar que DNI y Teléfono sean solo números
    if ((name === 'dni' || name === 'phone_number') && !/^\d*$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validaciones Frontend
    if (formData.dni.length !== 8) {
        showNotification('El DNI debe tener 8 dígitos exactos', 'warning');
        setLoading(false);
        return;
    }
    if (formData.phone_number.length !== 9) {
        showNotification('El celular debe tener 9 dígitos', 'warning');
        setLoading(false);
        return;
    }

    try {
      // Enviamos al backend (El backend se encarga de buscar el nombre en RENIEC)
      const response = await apiClient.post('/auth/register', formData);
      
      // Mostramos el nombre que encontró el sistema
      const userName = response.name || 'Usuario';
      showNotification(`¡Bienvenido ${userName}! Cuenta creada.`, 'success');
      
      router.push('/login'); 

    } catch (err: any) {
      // Mensajes de error amigables
      let msg = err.message;
      if (msg.includes('already registered')) msg = 'Este DNI, correo o celular ya está registrado.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-400">Ingresa tu DNI para validar tu identidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* DNI (Reemplaza al Nombre) */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FileBadge className="h-5 w-5 text-slate-500" />
            </div>
            <input
              name="dni"
              type="text"
              required
              placeholder="DNI (8 dígitos)"
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.dni}
              onChange={handleChange}
              maxLength={8}
            />
          </div>

          {/* Email */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-500" />
            </div>
            <input
              name="email"
              type="email"
              required
              placeholder="Correo Electrónico"
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Celular */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-slate-500" />
            </div>
            <input
              name="phone_number"
              type="tel"
              required
              placeholder="Número de Celular"
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.phone_number}
              onChange={handleChange}
              maxLength={9}
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-500" />
            </div>
            <input
              name="password"
              type="password"
              required
              placeholder="Contraseña"
              className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Registrarse'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}