'use client';
import { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { FaWallet, FaArrowUp, FaArrowDown, FaChartLine, FaArrowRightArrowLeft, FaArrowTrendUp } from 'react-icons/fa6';
import { TbPigMoney, TbSend } from 'react-icons/tb';
import { useNotification } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api';
import LoanModal from './depositmodal';
import Link from 'next/link';

interface DailyBalance {
  date: string;
  balance: number;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
}

const typeLabels: Record<string, string> = {
  DEPOSIT: 'Depósito',
  P2P_SENT: 'Transferencia enviada',
  P2P_RECEIVED: 'Transferencia recibida',
  CONTRIBUTION_SENT: 'Aporte a grupo',
  WITHDRAWAL: 'Retiro',
  TRANSFER: 'Transferencia',
  LOAN_DISBURSEMENT: 'Préstamo Recibido', // ¡NUEVO!
  LOAN_PAYMENT: 'Pago de Préstamo', // ¡NUEVO!
};

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [dailyBalance, setDailyBalance] = useState<DailyBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const [accountData, setAccountData] = useState<any>(null);

  const refreshData = async () => {
    setLoading(true);
    try {
      // Usamos apiClient para llamadas limpias
      const [balanceData, dailyData, txData] = await Promise.all([
        apiClient.get('/balance/me'),
        apiClient.get('/ledger/analytics/daily_balance/me'),
        apiClient.get('/ledger/transactions/me')
      ]);

      setBalance(balanceData.balance ?? 0);

      setAccountData(balanceData);
      
      // El backend a veces devuelve array directo o un objeto, normalizamos
      const parsedDaily = Array.isArray(dailyData) ? dailyData : dailyData?.daily_balance || [];
      setDailyBalance(parsedDaily);
      
      setTransactions(Array.isArray(txData) ? txData : []);

    } catch (err: any) {
      console.error('Error fetching dashboard data', err);
      showNotification(err.message || 'Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleLoanSuccess = () => {
    refreshData();
    showNotification('¡Préstamo solicitado exitosamente!', 'success');
  };

  // Cálculos reales basados en transacciones reales
  const ingresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('DEPOSIT') || tx.type.includes('RECEIVED') || tx.type === 'LOAN_DISBURSEMENT'))
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const egresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('SENT') || tx.type.includes('WITHDRAWAL') || tx.type === 'TRANSFER' || tx.type === 'LOAN_PAYMENT'))
    .reduce((acc, tx) => acc + tx.amount, 0);

  if (loading && balance === 0) { // Solo pantalla de carga inicial
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onLoanSuccess={handleLoanSuccess}
      />

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-slate-800 dark:text-slate-100">Dashboard Financiero</h1>
        </div>

        {/* Tarjeta Saldo */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FaWallet className="text-3xl" />
            </div>
            <div>
              <p className="text-blue-100">Saldo Disponible</p>
              <p className="text-4xl font-bold">S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Deuda (Solo si existe deuda) */}
      {/* Nota: Necesitamos guardar el objeto completo 'account' en el estado, no solo 'balance' */}
      {/* 1. Agrega un estado nuevo arriba: const [accountData, setAccountData] = useState<any>(null); */}
      {/* 2. En refreshData, haz: setAccountData(balanceData); */}

      {/* Y luego renderiza esto: */}
      {/* 👇 CAMBIO CRÍTICO: Usar .loan en lugar de .active_loan */}
      {accountData?.loan && accountData.loan.status === 'active' && (
        <div className="mt-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FaWallet className="text-2xl" />
            </div>
            <div>
              <p className="text-orange-100 text-sm font-medium">Deuda con el Banco</p>
              {/* 👇 AQUÍ TAMBIÉN: .loan */}
              <p className="text-3xl font-bold">S/ {accountData.loan.outstanding_balance}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              if(!confirm("¿Pagar deuda completa con tu saldo?")) return;
              try {
                await apiClient.post('/pay-loan', {});
                refreshData(); // Recargar para quitar la tarjeta
                showNotification("¡Deuda pagada!", "success");
              } catch(e: any) {
                showNotification(e.message, "error");
              }
            }}
            className="px-6 py-2 bg-white text-orange-600 font-bold rounded-xl shadow-lg hover:bg-orange-50 transition-colors"
          >
            Pagar Ahora
          </button>
        </div>
      )}

        {/* Botones Acción */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Botón 1: Pedir Préstamo */}
          <button 
            onClick={() => setIsLoanModalOpen(true)} 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 group"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                <TbPigMoney className="text-2xl" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Pedir Préstamo</span>
            </div>
          </button>

          {/* Botón 2: Transferir (ACTIVADO con Link) */}
          <Link 
            href="/transactions" 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 group cursor-pointer"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 group-hover:scale-110 transition-transform duration-300">
                <TbSend className="text-2xl" />
              </div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Transferir</span>
            </div>
          </Link>
        </div>

        {/* Gráfico y Métricas (Limpio de falsedades) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico Histórico */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Evolución de Saldo (30 días)</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyBalance}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" hide />
                  <YAxis tickFormatter={(val) => `S/${val}`} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(val: number) => `S/ ${val.toLocaleString('es-PE')}`}
                    contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                  />
                  <Area type="monotone" dataKey="balance" stroke="#0ea5e9" fill="url(#colorBalance)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resumen Métricas Reales */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><FaArrowTrendUp /></div>
                <span className="text-slate-500 text-sm">Ingresos Totales</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">+S/ {ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-rose-100 rounded-lg text-rose-600"><FaArrowTrendUp className="rotate-180" /></div>
                <span className="text-slate-500 text-sm">Egresos Totales</span>
              </div>
              <p className="text-2xl font-bold text-rose-600">-S/ {egresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-100">Movimientos Recientes</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => {
              const isPositive = tx.type.includes('DEPOSIT') || tx.type.includes('RECEIVED') || tx.type === 'LOAN_DISBURSEMENT';
              return (
                <div key={tx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {isPositive ? <FaArrowDown /> : <FaArrowUp />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        {typeLabels[tx.type] || tx.type}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPositive ? '+' : '-'} S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <p className="text-center text-slate-500 py-4">No hay movimientos recientes.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}