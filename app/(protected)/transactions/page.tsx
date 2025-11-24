'use client';

import { ArrowLeftRight } from 'lucide-react';
import SmartTransferCard from '../../components/transactions/SmartTransferCard';

export default function TransactionsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      
      {/* Header de la Página */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-500/20 rounded-2xl">
          <ArrowLeftRight size={32} className="text-blue-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">Transacciones</h1>
          <p className="text-slate-400">Envía dinero de forma rápida y segura.</p>
        </div>
      </div>

      {/* Aquí va la nueva tarjeta inteligente que hace TODO */}
      <SmartTransferCard />

      {/* Puedes agregar aquí abajo una tabla de "Historial Reciente" si quisieras en el futuro */}

    </div>
  );
}