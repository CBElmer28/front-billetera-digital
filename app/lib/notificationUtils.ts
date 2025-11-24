import { 
  ArrowDownLeft, 
  Wallet, 
  DollarSign, 
  Users,
  ArrowUpRight
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
  colorClass: string;
  timestamp: number; // Para ordenar
}

export const generateNotificationsFromTransactions = (transactions: any[], lastReadTime: number): NotificationItem[] => {
  // 1. Filtramos solo las relevantes (últimas 10)
  const relevantTxs = transactions.slice(0, 10);

  return relevantTxs.map((tx) => {
    const txDate = new Date(tx.created_at);
    const isUnread = txDate.getTime() > lastReadTime;
    
    // Parsear metadata
    let meta: any = {};
    try { meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata || {}; } catch (e) {}

    let title = 'Movimiento';
    let message = '';
    let icon = Wallet;
    let colorClass = 'bg-slate-100 text-slate-600';

    // LOGICA DE TIPOS
    switch (tx.type) {
      case 'P2P_RECEIVED':
        title = '¡Dinero Recibido!';
        const sender = meta.sender_name || 'Alguien';
        message = `${sender} te envió S/ ${tx.amount.toFixed(2)}`;
        icon = ArrowDownLeft;
        colorClass = 'bg-emerald-100 text-emerald-600';
        break;

      case 'DEPOSIT':
        title = 'Depósito Exitoso';
        message = `Tu recarga de S/ ${tx.amount.toFixed(2)} se completó.`;
        icon = Wallet;
        colorClass = 'bg-blue-100 text-blue-600';
        break;

      case 'LOAN_DISBURSEMENT':
        title = 'Préstamo Aprobado';
        message = `Recibiste S/ ${tx.amount.toFixed(2)} del banco.`;
        icon = DollarSign;
        colorClass = 'bg-purple-100 text-purple-600';
        break;

      case 'CONTRIBUTION_RECEIVED':
        title = 'Aporte a Grupo';
        message = `Un miembro aportó S/ ${tx.amount.toFixed(2)}.`;
        icon = Users;
        colorClass = 'bg-sky-100 text-sky-600';
        break;
        
      case 'TRANSFER_SENT':
      case 'P2P_SENT':
        title = 'Transferencia Enviada';
        message = `Enviaste S/ ${tx.amount.toFixed(2)} exitosamente.`;
        icon = ArrowUpRight;
        colorClass = 'bg-slate-100 text-slate-500';
        break;

      default:
        title = 'Nueva Actividad';
        message = `Movimiento por S/ ${tx.amount.toFixed(2)}`;
    }

    return {
      id: tx.id,
      title,
      message,
      time: getTimeAgo(txDate),
      read: !isUnread,
      icon,
      colorClass,
      timestamp: txDate.getTime()
    };
  });
};

// Helper para "Hace 5 min"
function getTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " años";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " meses";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " días";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " horas";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " min";
  return "Hace un momento";
}