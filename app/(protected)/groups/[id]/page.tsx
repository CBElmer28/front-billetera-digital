'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RequestWithdrawalModal from './RequestWithdrawalModal';
import LeaderWithdrawalModal from './LeaderWithdrawalModal';
import { FaUsers, FaUserShield, FaHistory, FaArrowLeft, FaSignOutAlt, FaTrash, FaMoneyBillWave,FaGift, FaUserPlus } from 'react-icons/fa';
import { apiClient } from '../../../lib/api'; // Asegúrate que la ruta sea correcta

// --- DEFINICIÓN DE TIPOS (Para que TypeScript no se queje) ---
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

  // 👇 AQUÍ ESTÁ LA MAGIA: Usamos <GroupDetails | null> en lugar de <any>
  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [balance, setBalance] = useState<any | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLeader, setIsLeader] = useState(false);
  
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isLeaderWithdrawalModalOpen, setIsLeaderWithdrawalModalOpen] = useState(false);

  const myUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('pixel-user-id') || '0') : 0;

  const fetchGroupData = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
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
      setError(err.message || 'Error cargando el grupo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroupData(); }, [groupId]);

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

  if (loading && !group) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
    </div>
  );

  if (error && !group) return <div className="p-6 text-center text-rose-600">Error: {error}</div>;
  if (!group || !balance) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/groups" className="p-2 bg-slate-100 rounded-lg"><FaArrowLeft /></Link>
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
                  <button onClick={() => setIsRequestModalOpen(true)} className="w-full py-2 bg-sky-500 text-white rounded-lg">Solicitar Retiro</button>
                ) : (
                  <button onClick={() => setIsLeaderWithdrawalModalOpen(true)} className="w-full py-2 bg-blue-600 text-white rounded-lg">Retiro de Líder</button>
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

            {/* HISTORIAL */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-slate-700 dark:text-white mb-4">Historial del Grupo</h3>
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between text-sm border-b border-slate-100 pb-2 last:border-0">
                    <span className="text-slate-600">{tx.type}</span>
                    <span className={tx.type.includes('RECEIVED') || tx.type === 'DEPOSIT' ? 'text-emerald-600' : 'text-slate-800'}>
                      S/ {tx.amount}
                    </span>
                  </div>
                ))}
                {transactions.length === 0 && <p className="text-slate-400 text-sm">Sin movimientos</p>}
              </div>
            </div>

          </div>
        </div>

        {/* MODALES */}
        <RequestWithdrawalModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          group={{ id: group.id, name: group.name }}
          onRequestSuccess={fetchGroupData}
        />
        <LeaderWithdrawalModal
          isOpen={isLeaderWithdrawalModalOpen}
          onClose={() => setIsLeaderWithdrawalModalOpen(false)}
          group={{ id: group.id, name: group.name }}
          onWithdrawalSuccess={fetchGroupData}
        />

      </div>
    </div>
  );
}