'use client';

import { X, CheckCircle2, Calendar, Clock, Hash, Building, User } from 'lucide-react';
import { getTransactionDetails } from '../../lib/transactionUtils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
}

export default function TransactionModal({ isOpen, onClose, transaction }: TransactionModalProps) {
  if (!isOpen || !transaction) return null;

  const { title, isPositive, details } = getTransactionDetails(transaction);
  const dateObj = new Date(transaction.created_at);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 scale-100 animate-in zoom-in-95 duration-200">
        
        {/* Header con botón cerrar */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Contenido Principal */}
        <div className="px-8 pb-8 text-center">
          
          {/* Icono Gigante */}
          <div className="flex justify-center mb-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <CheckCircle2 size={40} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{title}</h2>
          <p className="text-sm text-slate-500 mb-6">{transaction.status === 'COMPLETED' ? 'Operación Exitosa' : transaction.status}</p>

          {/* El Monto Grande */}
          <div className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
            <span className="text-xl align-top text-slate-400 mr-1">S/</span>
            {Math.abs(transaction.amount).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
          </div>

          {/* Tabla de Detalles */}
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 space-y-4 text-sm">
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={16} /> <span>Fecha</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={16} /> <span>Hora</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {dateObj.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <Building size={16} /> <span>Banco / App</span>
              </div>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {details.bankName}
              </span>
            </div>

            {details.counterparty && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <User size={16} /> <span>Destino / Origen</span>
                </div>
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                  {details.counterparty}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-slate-500">
                <Hash size={16} /> <span>ID Transacción</span>
              </div>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 truncate max-w-[120px]" title={transaction.id}>
                {transaction.id.split('-')[0]}...
              </span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}