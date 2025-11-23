'use client';
import { useState, useEffect } from 'react';
import P2PTransferModal from './P2PTransferModal';
import ExternalTransferModal from './ExternalTransferModal';
import { FaArrowUp, FaArrowDown, FaExchangeAlt, FaHistory, FaPaperPlane, FaUniversity } from 'react-icons/fa';
import { useNotification } from '../../contexts/NotificationContext';
import { apiClient } from '../../lib/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  created_at: string;
  status: string;
  source_wallet_id: string;
  destination_wallet_id: string;
}

const typeLabels: Record<string, string> = {
  DEPOSIT: 'Recarga (Simulada)',
  P2P_SENT: 'Transferencia Enviada',
  P2P_RECEIVED: 'Transferencia Recibida',
  CONTRIBUTION_SENT: 'Aporte a Grupo',
  TRANSFER: 'Retiro (a banco)',
  LOAN_DISBURSEMENT: 'Préstamo Recibido',
  LOAN_PAYMENT: 'Pago de Préstamo',
};

const statusLabels: Record<string, string> = {
  COMPLETED: 'Completada',
  PENDING: 'Pendiente',
  FAILED_FUNDS: 'Fondos Insuficientes',
  FAILED_RECIPIENT: 'Destinatario Falló',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Estados nuevos para la Transferencia Externa
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [userIdentifier, setUserIdentifier] = useState<string>("");
  const [loadingUser, setLoadingUser] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get('/ledger/transactions/me');
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      showNotification('Error cargando historial', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();

    // Obtener usuario para transferencia externa
    apiClient.get('/auth/me')
      .then((data: any) => {
        if (data?.phone_number) setUserIdentifier(data.phone_number);
      })
      .catch(err => console.error("Error cargando usuario:", err))
      .finally(() => setLoadingUser(false));
  }, []);

  const handleTransferSuccess = () => {
    fetchTransactions();
    showNotification('¡Transferencia exitosa!', 'success');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center mb-8 pt-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-sky-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-500/25 mb-6">
            <FaExchangeAlt className="text-white text-2xl" />
          </div>
          <h1 className="text-4xl font-light text-slate-800 dark:text-slate-100 tracking-tight mb-3">
            Transferencias
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Gestiona tus movimientos financieros de forma segura y transparente
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Sección de nueva transferencia */}
          <div className="xl:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-sky-100 dark:border-slate-700 hover-lift transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FaPaperPlane className="text-white text-sm" />
                </div>
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                  Nueva Operación
                </h2>
              </div>
              
              <div className="space-y-4">
                {/* P2P Transfer (Existente) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">Interna (Pixel a Pixel)</p>
                    <P2PTransferModal onTransferSuccess={handleTransferSuccess} />
                </div>

                {/* BOTÓN EXTERNO (NUEVO) */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 font-medium">Externa (Bancos/Apps)</p>
                    <button
                        onClick={() => setShowExternalModal(true)}
                        disabled={loadingUser || !userIdentifier} 
                        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-3 px-4 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <FaUniversity />
                        <span>
                            {loadingUser ? 'Cargando...' : 'Probar Transferencia Externa'}
                        </span>
                    </button>
                </div>
              </div>

            </div>
          </div>

          {/* Historial de transacciones */}
          <div className="xl:col-span-2">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-sky-100 dark:border-slate-700 overflow-hidden hover-lift transition-all duration-300">
              <div className="p-6 border-b border-sky-100 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <FaHistory className="text-white text-sm" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
                        Historial de Transacciones
                      </h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Todos tus movimientos recientes
                      </p>
                    </div>
                  </div>
                  <span className="bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm px-3 py-1.5 rounded-full font-medium border border-sky-200 dark:border-sky-800">
                    {transactions.length} movimientos
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto scrollbar-minimal">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-sky-500/5 to-blue-600/5 border-b border-sky-100 dark:border-slate-700">
                    <tr>
                      <th className="p-4 font-medium text-slate-700 dark:text-slate-300 text-left text-sm uppercase tracking-wide">Fecha</th>
                      <th className="p-4 font-medium text-slate-700 dark:text-slate-300 text-left text-sm uppercase tracking-wide">Tipo</th>
                      <th className="p-4 font-medium text-slate-700 dark:text-slate-300 text-left text-sm uppercase tracking-wide">Monto</th>
                      <th className="p-4 font-medium text-slate-700 dark:text-slate-300 text-left text-sm uppercase tracking-wide">Detalle</th>
                      <th className="p-4 font-medium text-slate-700 dark:text-slate-300 text-left text-sm uppercase tracking-wide">Estado</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-500"></div>
                            <span className="text-slate-500 dark:text-slate-400">Cargando transacciones...</span>
                          </div>
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center">
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                              <FaExchangeAlt className="text-slate-400 text-xl" />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No hay transacciones</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      transactions.map((tx) => {
                        const isNegative = tx.type.includes("SENT") || tx.type.includes("TRANSFER");
                        let description = "—";
                        if (tx.type === "P2P_SENT") description = `A ID: ${tx.destination_wallet_id}`;
                        else if (tx.type === "P2P_RECEIVED") description = `De ID: ${tx.source_wallet_id}`;
                        else if (tx.type === "TRANSFER") description = "Externo";

                        const statusText = statusLabels[tx.status] || tx.status;
                        const statusColor = statusText === "Completada" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800";

                        return (
                          <tr key={tx.id} className="hover:bg-sky-50/50 dark:hover:bg-sky-900/10 transition-all duration-200 group">
                            <td className="p-4">
                              <div className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(tx.created_at).toLocaleDateString("es-PE")}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium text-slate-700 dark:text-slate-200">
                                  {typeLabels[tx.type] || tx.type}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className={`font-semibold text-lg ${isNegative ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                                {isNegative ? "-" : "+"} S/ {tx.amount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="text-slate-600 dark:text-slate-300 text-sm font-medium">
                                {description}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${statusColor}`}>
                                {statusText}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ExternalTransferModal 
        isOpen={showExternalModal} 
        onClose={() => setShowExternalModal(false)}
        currentUserIdentifier={userIdentifier}
      />
    </main>
  );
}