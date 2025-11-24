'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { FaWallet, FaArrowUp, FaArrowDown } from 'react-icons/fa6';
import { TbPigMoney, TbSend } from 'react-icons/tb';
import { useNotification } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api';
import LoanModal from './depositmodal';
import { getTransactionDetails } from '../../lib/transactionUtils'; // Importar utilidades
import TransactionModal from '../../components/transactions/TransactionModal'; // Importar modal

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
  metadata?: string;
}

export default function DashboardPage() {
  const [balance, setBalance] = useState<number>(0);
  const [dailyBalance, setDailyBalance] = useState<DailyBalance[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const { showNotification } = useNotification();
  const [accountData, setAccountData] = useState<any>(null);
  
  // Estado para el modal de detalle
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Función optimizada para polling
  const fetchData = async (isAutoRefresh = false) => {
    if (!isAutoRefresh) setLoading(true);
    
    try {
      const [balanceData, dailyData, txData] = await Promise.all([
        apiClient.get('/balance/me'),
        apiClient.get('/ledger/analytics/daily_balance/me'),
        apiClient.get('/ledger/transactions/me')
      ]);

      setBalance(balanceData.balance ?? 0);
      setAccountData(balanceData);
      
      const parsedDaily = Array.isArray(dailyData) ? dailyData : dailyData?.daily_balance || [];
      setDailyBalance(parsedDaily);
      
      setTransactions(Array.isArray(txData) ? txData : []);

    } catch (err: any) {
      console.error('Error fetching dashboard data', err);
      if (!isAutoRefresh) showNotification(err.message, 'error');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  // Polling manual con setInterval (puedes usar el hook usePolling si prefieres, aquí lo dejo directo para este archivo)
  useEffect(() => {
    fetchData();
    const intervalId = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLoanSuccess = () => {
    fetchData(false);
    showNotification('¡Préstamo solicitado exitosamente!', 'success');
  };

  // Cálculos
  const ingresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('DEPOSIT') || tx.type.includes('RECEIVED') || tx.type === 'LOAN_DISBURSEMENT'))
    .reduce((acc, tx) => acc + tx.amount, 0);
  
  const egresos = transactions
    .filter(tx => tx.status === 'COMPLETED' && (tx.type.includes('SENT') || tx.type.includes('WITHDRAWAL') || tx.type === 'TRANSFER' || tx.type === 'LOAN_PAYMENT'))
    .reduce((acc, tx) => acc + tx.amount, 0);

  // FILTRO DE 7 DÍAS PARA EL GRÁFICO
  const weeklyData = dailyBalance.slice(-7);

  if (loading && balance === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 animate-in fade-in duration-500">
      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onLoanSuccess={handleLoanSuccess}
      />

      {/* Modal de Detalle de Transacción */}
      <TransactionModal 
        isOpen={!!selectedTx} 
        onClose={() => setSelectedTx(null)} 
        transaction={selectedTx} 
      />

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Mejorado */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
              Dashboard Financiero
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Resumen de tu actividad y estado de cuenta
            </p>
          </div>
          
          <div className="hidden md:block">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
              Estado: Activo
            </span>
          </div>
        </div>

        {/* Tarjeta Saldo Principal */}
        <div className="bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/20">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FaWallet className="text-3xl" />
            </div>
            <div>
              <p className="text-blue-100 font-medium">Saldo Disponible</p>
              <p className="text-4xl font-bold transition-all duration-500">
                S/ {balance.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Alerta de Deuda (Condicional) */}
        {accountData?.loan && accountData.loan.status === 'active' && (
          <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 text-white shadow-xl flex justify-between items-center animate-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <FaWallet className="text-2xl" />
              </div>
              <div>
                <p className="text-orange-100 text-sm font-medium">Deuda Pendiente</p>
                <p className="text-3xl font-bold">S/ {accountData.loan.outstanding_balance}</p>
              </div>
            </div>
            <button 
              onClick={async () => {
                if(!confirm("¿Pagar deuda completa con tu saldo?")) return;
                try {
                  await apiClient.post('/pay-loan', {});
                  fetchData(false);
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

        {/* --- NUEVA GRILLA UNIFICADA (Botones + Stats) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Botón 1: Pedir Préstamo */}
          <button 
            onClick={() => setIsLoanModalOpen(true)} 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 group flex flex-col items-center gap-3"
          >
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform duration-300">
              <TbPigMoney className="text-2xl" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">Pedir Préstamo</span>
          </button>

          {/* Botón 2: Transferir */}
          <Link 
            href="/transactions" 
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700 group flex flex-col items-center gap-3"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 group-hover:scale-110 transition-transform duration-300">
              <TbSend className="text-2xl" />
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-200">Transferir</span>
          </Link>

          {/* Stat 1: Ingresos (Estilizado para encajar) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                    <FaArrowUp size={12} />
                </div>
                Ingresos
             </div>
             <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +S/ {ingresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
             </p>
          </div>

          {/* Stat 2: Egresos (Estilizado para encajar) */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center gap-2">
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="p-1.5 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600">
                    <FaArrowDown size={12} />
                </div>
                Egresos
             </div>
             <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                -S/ {egresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
             </p>
          </div>
          
        </div>

        {/* --- GRÁFICO FULL WIDTH (7 DÍAS) --- */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Evolución de Saldo</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 font-medium">
                Últimos 7 días
            </span>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                    dataKey="date" 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => new Date(val).toLocaleDateString('es-PE', {weekday: 'short'})} 
                />
                <YAxis 
                    tickFormatter={(val) => `S/${val}`} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8'}}
                />
                <Tooltip 
                  formatter={(val: number) => [`S/ ${val.toLocaleString('es-PE')}`, 'Saldo']}
                  contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                />
                <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="#0ea5e9" 
                    strokeWidth={3}
                    fill="url(#colorBalance)" 
                    animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historial Reciente */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">Movimientos Recientes</h3>
          <div className="space-y-3">
            {transactions.slice(0, 5).map((tx) => {
              // Usamos la utilidad profesional
              const { title, subtitle, icon, amountColor, isPositive } = getTransactionDetails(tx);
              
              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedTx(tx)} 
                  className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-600 group-hover:scale-110 transition-transform`}>
                      {icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {subtitle}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className={`font-bold text-base ${amountColor}`}>
                      {isPositive ? '+' : '-'} S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                      {tx.status === 'COMPLETED' ? 'Exitoso' : tx.status}
                    </p>
                  </div>
                </div>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p>No tienes movimientos recientes.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}