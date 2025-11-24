'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';
import InviteModal from './InviteModal';
import { FaUsers, FaPlus, FaClock, FaCheck, FaTimes, FaGift, FaShare } from 'react-icons/fa';
// Importamos el icono decorativo de Lucide para el título
import { Users as UsersIcon } from 'lucide-react'; 

import { apiClient } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';
import { usePolling } from '../../../hooks/usePolling';

interface GroupMember {
  user_id: number;
  role: 'leader' | 'member';
  group_id: number;
  status: 'pending' | 'active';
}

interface Group {
  id: number;
  name: string;
  leader_user_id: number;
  created_at: string;
  members: GroupMember[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const { showNotification } = useNotification();

  const fetchGroups = async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      const data = await apiClient.get('/groups/me');
      setGroups(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err); 
      if (!isAutoRefresh) showNotification(err.message || 'Error al cargar grupos', 'error');
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  // Hook de Polling
  usePolling(fetchGroups, 5000);

  useEffect(() => {
    const storedUserId = localStorage.getItem('pixel-user-id');
    if (storedUserId) setMyUserId(parseInt(storedUserId, 10));
  }, []);

  const handleAcceptInvite = async (groupId: number) => {
    try {
      await apiClient.post(`/groups/me/accept/${groupId}`, {});
      showNotification('¡Invitación aceptada!', 'success');
      fetchGroups(false); 
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleRejectInvite = async (groupId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres rechazar esta invitación?")) return;
    try {
      await apiClient.delete(`/groups/me/reject/${groupId}`);
      showNotification('Invitación rechazada', 'info');
      fetchGroups(false);
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* 1. HEADER MEJORADO (Estilo Premium) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            {/* Icono Decorativo */}
            <div className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500/10 to-indigo-500/10 border border-sky-200 dark:border-sky-900/50">
               <UsersIcon className="w-7 h-7 text-sky-600 dark:text-sky-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-400">
                Mis Grupos
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Gestiona tus comunidades financieras y fondos comunes
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-sky-500/20 transition-all transform hover:scale-105"
          >
            <FaPlus /> Crear Grupo
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && groups.length === 0 && (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FaUsers size={32} />
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200">No tienes grupos aún</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Crea uno nuevo para empezar a ahorrar con amigos o espera a recibir una invitación.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-sky-500 hover:text-sky-600 font-medium hover:underline">
              Crear mi primer grupo
            </button>
          </div>
        )}

        {/* Grid de Grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {groups.map((group) => {
            const myMembership = group.members.find(m => m.user_id === myUserId);
            const myStatus = myMembership?.status || 'active';
            const isLeader = myMembership?.role === 'leader';
            const activeCount = group.members.filter(m => m.status === 'active').length;

            const CardContent = () => (
              <div className={`h-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col
                ${myStatus === 'pending' 
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10' 
                  : 'border-slate-100 dark:border-slate-700 hover:shadow-lg hover:-translate-y-1 hover:border-sky-200 dark:hover:border-sky-800'
                }`}>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{group.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {isLeader && <span className="text-[10px] uppercase tracking-wider bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 px-2 py-1 rounded-md font-bold">Líder</span>}
                      {myStatus === 'pending' && <span className="text-[10px] uppercase tracking-wider bg-amber-100 text-amber-700 px-2 py-1 rounded-md font-bold flex items-center gap-1"><FaClock size={10}/> Invitación</span>}
                    </div>
                  </div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md transform rotate-3
                    ${myStatus === 'pending' ? 'bg-amber-400' : 'bg-gradient-to-br from-sky-400 to-blue-600'}`}>
                    <FaUsers size={20} />
                  </div>
                </div>

                <div className="flex-1 mt-2">
                  {myStatus === 'active' ? (
                    <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex -space-x-2">
                        {/* Avatares simulados */}
                        {[...Array(Math.min(activeCount, 3))].map((_, i) => (
                          <div key={i} className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 border-2 border-white dark:border-slate-800"></div>
                        ))}
                      </div>
                      <span><span className="font-bold text-slate-700 dark:text-slate-200">{activeCount}</span> Miembros</span>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-100/50 p-2 rounded-lg">Te han invitado a unirte a este grupo.</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-3">
                  {myStatus === 'pending' ? (
                    <>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleAcceptInvite(group.id); }}
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium flex justify-center items-center gap-2 transition-colors shadow-sm"
                      >
                        <FaCheck size={12} /> Aceptar
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleRejectInvite(group.id); }}
                        className="flex-1 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                      >
                        <FaTimes size={12} /> Rechazar
                      </button>
                    </>
                  ) : (
                    <>
                      {isLeader && (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedGroup(group); setIsInviteModalOpen(true); }}
                          className="flex-1 py-2.5 bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                        >
                          <FaShare size={12} /> Invitar
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedGroup(group); setIsContributeModalOpen(true); }}
                        className="flex-1 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl text-sm font-medium transition-colors flex justify-center items-center gap-2"
                      >
                        <FaGift size={12} /> Aportar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );

            return (
              <div key={group.id} className="h-full">
                {myStatus === 'active' ? (
                  <Link href={`/groups/${group.id}`} className="block h-full">
                    <CardContent />
                  </Link>
                ) : (
                  <div className="h-full cursor-default">
                    <CardContent />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MODALES */}
      <CreateGroupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGroupCreated={() => fetchGroups(false)}
      />

      {selectedGroup && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          group={selectedGroup}
          onContributeSuccess={() => fetchGroups(false)}
        />
      )}

      {selectedGroup && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          group={selectedGroup}
          onInviteSuccess={() => fetchGroups(false)}
        />
      )}
    </div>
  );
}