'use client';

import { User, Mail, Phone } from 'lucide-react';

interface UserData {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export default function UserProfileSection({ userData }: { userData: UserData; onUpdate: () => void }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
          {userData.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{userData.name}</h2>
          <p className="text-slate-500">ID de Usuario: {userData.id}</p>
        </div>
      </div>

      <div className="grid gap-4 max-w-lg">
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <Mail className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-slate-500">Correo Electrónico</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 pl-7">{userData.email}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-1">
            <Phone className="w-4 h-4 text-sky-500" />
            <span className="text-sm font-medium text-slate-500">Teléfono</span>
          </div>
          <p className="text-slate-800 dark:text-slate-200 pl-7">{userData.phone_number || 'No registrado'}</p>
        </div>
      </div>
      
      <p className="text-xs text-slate-400 italic">
        * Para actualizar tus datos personales, contacta con soporte.
      </p>
    </div>
  );
}