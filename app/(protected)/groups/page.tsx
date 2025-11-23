'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CreateGroupModal from './CreateGroupModal';
import ContributeModal from './ContributeModal';
import InviteModal from './InviteModal';
import { FaUsers, FaPlus, FaClock, FaCheck, FaTimes, FaGift, FaShare } from 'react-icons/fa';
// 👇 IMPORTACIONES CORREGIDAS (3 niveles arriba)
import { apiClient } from '../../lib/api';
import { useNotification } from '../../contexts/NotificationContext';

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
  
  // Modales de acción rápida
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const [myUserId, setMyUserId] = useState<number | null>(null);
  const { showNotification } = useNotification();

  // --- 1. Cargar Grupos ---
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get('/groups/me');
      // Asegurar que data es un array
      setGroups(Array.isArray(data) ? data : []);
    } catch (err: any) {
      showNotification(err.message || 'Error al cargar grupos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('pixel-user-id');
    if (storedUserId) setMyUserId(parseInt(storedUserId, 10));
    fetchGroups();
  }, []);

  // --- 2. Aceptar Invitación ---
  const handleAcceptInvite = async (groupId: number) => {
    try {
      await apiClient.post(`/groups/me/accept/${groupId}`, {});
      showNotification('¡Invitación aceptada!', 'success');
      fetchGroups(); 
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // --- 3. Rechazar Invitación ---
  const handleRejectInvite = async (groupId: number) => {
    if (!window.confirm("¿Estás seguro de que quieres rechazar esta invitación?")) return;
    try {
      await apiClient.delete(`/groups/me/reject/${groupId}`);
      showNotification('Invitación rechazada', 'info');
      fetchGroups();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Mis Grupos</h1>
            <p className="text-slate-500">Gestiona tus comunidades financieras</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-medium shadow-lg shadow-sky-500/20 transition-all"
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
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <FaUsers size={32} />
            </div>
            <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200">No tienes grupos aún</h3>
            <p className="text-slate-500 mb-6">Crea uno nuevo o espera a ser invitado.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-sky-500 hover:underline">
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

            // CONTENIDO DE LA TARJETA
            const CardContent = () => (
              <div className={`h-full bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border transition-all duration-300 flex flex-col
                ${myStatus === 'pending' 
                  ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10' 
                  : 'border-slate-100 dark:border-slate-700 hover:shadow-md hover:border-sky-200 dark:hover:border-sky-800'
                }`}>
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">{group.name}</h3>
                    <div className="flex gap-2 mt-2">
                      {isLeader && <span className="text-xs bg-sky-100 text-sky-700 px-2 py-1 rounded-full font-medium">Líder</span>}
                      {myStatus === 'pending' && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1"><FaClock size={10}/> Invitación</span>}
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm
                    ${myStatus === 'pending' ? 'bg-amber-400' : 'bg-gradient-to-br from-sky-400 to-blue-600'}`}>
                    <FaUsers />
                  </div>
                </div>

                <div className="flex-1">
                  {myStatus === 'active' ? (
                    <div className="flex gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <div><span className="font-bold text-slate-700 dark:text-slate-200">{activeCount}</span> Miembros</div>
                      <div>•</div>
                      <div>Creado el {new Date(group.created_at).toLocaleDateString()}</div>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700 dark:text-amber-400">Te han invitado a unirte a este grupo.</p>
                  )}
                </div>

                {/* ACCIONES */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                  {myStatus === 'pending' ? (
                    <>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleAcceptInvite(group.id); }}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                      >
                        <FaCheck size={12} /> Aceptar
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); handleRejectInvite(group.id); }}
                        className="flex-1 py-2 bg-white border border-rose-200 text-rose-500 hover:bg-rose-50 rounded-lg text-sm font-medium flex justify-center items-center gap-2 transition-colors"
                      >
                        <FaTimes size={12} /> Rechazar
                      </button>
                    </>
                  ) : (
                    <>
                      {isLeader && (
                        <button 
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedGroup(group); setIsInviteModalOpen(true); }}
                          className="flex-1 py-2 bg-sky-50 dark:bg-slate-700 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
                        >
                          <FaShare size={12} /> Invitar
                        </button>
                      )}
                      <button 
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedGroup(group); setIsContributeModalOpen(true); }}
                        className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2"
                      >
                        <FaGift size={12} /> Aportar
                      </button>
                    </>
                  )}
                </div>
              </div>
            );

            // LINK CONDICIONAL
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
        onGroupCreated={fetchGroups}
      />

      {selectedGroup && (
        <ContributeModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          group={selectedGroup}
          onContributeSuccess={fetchGroups}
        />
      )}

      {selectedGroup && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          group={selectedGroup}
          onInviteSuccess={fetchGroups}
        />
      )}
    </div>
  );
}