'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Smartphone, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api'; // Asegúrate que la ruta sea correcta
import { useNotification } from '../contexts/NotificationContext';

export default function LoginPage() {
  const router = useRouter();
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Usamos apiClient.post (ya maneja la URL base)
      // FormData debe enviarse como URLSearchParams porque el backend espera Form-Data en el login (OAuth2 standard)
      const params = new URLSearchParams();
      params.append('username', formData.email); // OAuth2 usa 'username' para el email
      params.append('password', formData.password);

      const data: any = await apiClient.request('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });

      // Guardar token con el nombre CORRECTO
      localStorage.setItem('pixel-token', data.access_token);
      if (data.user_id) localStorage.setItem('pixel-user-id', data.user_id.toString());

      showNotification('¡Bienvenido de nuevo!', 'success');
      router.push('/dashboard');

    } catch (err: any) {
      // Aquí mostramos el error bonito en lugar de la alerta
      const mensaje = err.message === 'Incorrect email or password' 
        ? 'Correo o contraseña incorrectos.' 
        : err.message;
      showNotification(mensaje, 'error');
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
          <h1 className="text-3xl font-bold text-white mb-2">Pixel Money</h1>
          <p className="text-slate-400">Tu billetera digital segura</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Correo Electrónico</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                name="email"
                type="email"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                name="password"
                type="password"
                required
                className="block w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-slate-600 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Ingresar <ArrowRight size={20} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}