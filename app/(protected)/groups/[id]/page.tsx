'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestWithdrawalModal from './RequestWithdrawalModal';
import LeaderWithdrawalModal from './LeaderWithdrawalModal';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { apiClient } from '../../../lib/api';
import { usePolling } from '../../../../hooks/usePolling';

// 👇 1. IMPORTAR UTILIDADES Y MODAL
import { getTransactionDetails } from '../../../lib/transactionUtils';
import TransactionModal from '../../../components/transactions/TransactionModal';

// --- DEFINICIÓN DE TIPOS ---
interface GroupMember {
  user_id: number;
  name: string;
  role: 'leader' | 'member';
  status: 'pending' | 'active';
  internal_balance: number;
}

interface GroupDetails {
  id: number;
  name: string;
  leader_user_id: number;
  created_at: string;
  members: GroupMember[];
}

interface WithdrawalRequest {
  id: number;
  member_user_id: number;
  amount: number;
  reason: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  created_at: string;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id;

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [balance, setBalance] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLeaderWithdrawalModalOpen, setIsLeaderWithdrawalModalOpen] = useState(false);

  // 👇 2. NUEVO ESTADO PARA EL MODAL DE DETALLE
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

  const fetchGroupData = async (isAutoRefresh = false) => {
    if (!groupId) return;
    
    if (!isAutoRefresh) setLoading(true);

    try {
      const [groupData, balanceData, txData] = await Promise.all([
        apiClient.get(`/groups/${groupId}`),
        apiClient.get(`/group_balance/${groupId}`),
        apiClient.get(`/ledger/transactions/group/${groupId}`),
      ]);

      setGroup(groupData);
      setBalance(balanceData);
      setTransactions(txData);

      const amILeader = groupData.leader_user_id === myUserId;
      setIsLeader(amILeader);

      if (amILeader) {
        const requestsData = await apiClient.get(`/groups/${groupId}/withdrawal-requests`);
        setRequests(requestsData);
      }

    } catch (err: any) {
      console.error(err);
      if (!isAutoRefresh) setError(err.message || 'Error cargando el grupo');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  // Usamos el hook de Polling
  usePolling(fetchGroupData, 4000);

  // Handlers de Acciones
  const handleLeaveGroup = async () => {
    if (!window.confirm("¿Salir del grupo?")) return;
    setLoading(true);
    try {
      await apiClient.delete(`/groups/me/leave/${groupId}`);
      alert("Has salido del grupo.");
      router.push('/groups');
    } catch (err: any) {
      alert(`Error al salir:\n${err.message}`);
      setLoading(false);
    }
  };

  const handleKickMember = async (memberToKick: GroupMember) => {
    if (!window.confirm(`¿Eliminar a ${memberToKick.name}?`)) return;
    try {
      await apiClient.delete(`/groups/${groupId}/kick/${memberToKick.user_id}`);
      alert(`${memberToKick.name} eliminado.`);
      fetchGroupData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm("¿BORRAR GRUPO? Es permanente.")) return;
    try {
      await apiClient.delete(`/groups/${groupId}`);
      alert("Grupo eliminado.");
      router.push('/groups');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApproveRequest = async (requestId: number) => {
    if (!confirm("¿Aprobar retiro?")) return;
    try {
      await apiClient.post(`/groups/${groupId}/approve-withdrawal/${requestId}`, {});
      alert("Retiro Aprobado.");
      fetchGroupData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!confirm("¿Rechazar retiro?")) return;
    try {
      await apiClient.post(`/groups/${groupId}/reject-withdrawal/${requestId}`, {});
      alert("Solicitud Rechazada.");
      fetchGroupData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 👇 HELPER: Obtener nombre real del miembro basado en ID de transacción
  const getMemberName = (userId: number) => {
    if (!group) return 'Usuario';
    const member = group.members.find((m) => m.user_id === userId);
    return member ? member.name : 'Ex-miembro';
  };

  if (loading && !group) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
  );

  if (error && !group) return <div className="p-6 text-center text-rose-600">Error: {error}</div>;
  if (!group || !balance) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* MODAL DE DETALLE DE TRANSACCIÓN */}
        <TransactionModal 
            isOpen={!!selectedTx} 
            onClose={() => setSelectedTx(null)} 
            transaction={selectedTx} 
        />

        {/* HEADER */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/groups" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-200"><FaArrowLeft /></Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{group.name}</h1>
          </div>
          
          <div className="flex gap-2">
            {isLeader ? (
              <button onClick={handleDeleteGroup} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg text-sm font-medium">Borrar Grupo</button>
            ) : (
              <button onClick={handleLeaveGroup} className="px-4 py-2 bg-rose-100 text-rose-600 rounded-lg text-sm font-medium">Salir</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA: SALDO */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
              <h2 className="text-sm text-slate-500 uppercase font-bold mb-2">Saldo del Grupo</h2>
              <p className="text-3xl font-bold text-emerald-500">S/ {balance.balance}</p>
              <div className="mt-4 space-y-2">
                {!isLeader ? (
                  <button onClick={() => setIsRequestModalOpen(true)} className="w-full py-2 bg-sky-500 text-white rounded-lg font-medium">Solicitar Retiro</button>
                ) : (
                  <button onClick={() => setIsLeaderWithdrawalModalOpen(true)} className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium">Retiro de Líder</button>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: MIEMBROS Y SOLICITUDES */}
          <div className="md:col-span-2 space-y-6">
            
            {/* SOLICITUDES (SOLO LÍDER) */}
            {isLeader && requests.filter(r => r.status === 'pending').length > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
                <h3 className="font-bold text-amber-800 mb-3">Solicitudes Pendientes</h3>
                <div className="space-y-2">
                  {requests.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-slate-700">
                           {group.members.find(m => m.user_id === req.member_user_id)?.name || 'Miembro'}
                        </p>
                        <p className="text-sm text-slate-500">S/ {req.amount} - {req.reason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleApproveRequest(req.id)} className="text-xs bg-emerald-100 text-emerald-600 px-3 py-1 rounded">Aprobar</button>
                        <button onClick={() => handleRejectRequest(req.id)} className="text-xs bg-rose-100 text-rose-600 px-3 py-1 rounded">Rechazar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LISTA DE MIEMBROS */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-700 dark:text-white mb-4">Miembros ({group.members.length})</h3>
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.user_id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {member.name} {member.user_id === myUserId && '(Tú)'}
                        </p>
                        <p className={`text-xs ${member.internal_balance < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          Saldo interno: S/ {member.internal_balance}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{member.role}</span>
                      {isLeader && member.user_id !== myUserId && (
                        <button onClick={() => handleKickMember(member)} className="text-rose-500 hover:text-rose-700 text-sm">
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 👇 HISTORIAL PROFESIONAL MEJORADO 👇 */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-700 dark:text-white mb-4">Historial del Grupo</h3>
              <div className="space-y-3">
                {transactions.map((tx) => {
                  // 1. Obtener datos base de la utilidad
                  const { icon, amountColor } = getTransactionDetails(tx);
                  
                  // 2. PERSONALIZAR EL TÍTULO CON EL NOMBRE REAL
                  let customTitle = 'Movimiento';
                  // tx.user_id es quien hizo la acción
                  const actorName = getMemberName(tx.user_id); 

                  if (tx.type === 'CONTRIBUTION_RECEIVED') {
                    customTitle = `Aporte de ${actorName}`;
                  } else if (tx.type === 'GROUP_WITHDRAWAL') {
                    customTitle = `Retiro de ${actorName}`;
                  } else {
                    customTitle = tx.type.replace(/_/g, ' ');
                  }

                  // 3. Ajustar color para el grupo (Withdrawal es negativo para el grupo)
                  const groupAmountColor = tx.type === 'GROUP_WITHDRAWAL' ? 'text-rose-600' : 'text-emerald-600';
                  const symbol = tx.type === 'GROUP_WITHDRAWAL' ? '-' : '+';

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
                            {customTitle}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {new Date(tx.created_at).toLocaleDateString()} • {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`font-bold text-base ${groupAmountColor}`}>
                          {symbol} S/ {tx.amount.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide">
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {transactions.length === 0 && (
                  <p className="text-center text-slate-500 py-8 italic">
                    No hay movimientos registrados en este grupo.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* MODALES DE ACCIÓN */}
        <RequestWithdrawalModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          group={group ? { id: group.id, name: group.name } : {id:0, name:''}}
          onRequestSuccess={() => fetchGroupData(false)}
        />
        <LeaderWithdrawalModal
          isOpen={isLeaderWithdrawalModalOpen}
          onClose={() => setIsLeaderWithdrawalModalOpen(false)}
          group={group ? { id: group.id, name: group.name } : {id:0, name:''}}
          onWithdrawalSuccess={() => fetchGroupData(false)}
        />

      </div>
    </div>
  );
}