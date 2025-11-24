'use client';

import { ArrowLeftRight } from 'lucide-react';
import SmartTransferCard from '../../components/transactions/SmartTransferCard';

export default function TransactionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER MEJORADO */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
            Transacciones
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Envía dinero de forma rápida y segura a cualquier destino
          </p>
        </div>

        {/* Icono decorativo sutil a la derecha */}
        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200 dark:border-blue-900/50">
           <ArrowLeftRight className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
      </div>

      {/* Tarjeta Inteligente */}
      <SmartTransferCard />

    </div>
  );
}