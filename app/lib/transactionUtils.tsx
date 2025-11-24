import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Building2, 
  Users, 
  DollarSign,
  RefreshCcw,
  Gift
} from 'lucide-react';

export const getTransactionDetails = (tx: any) => {
  let meta: any = {};
  try {
    meta = typeof tx.metadata === 'string' ? JSON.parse(tx.metadata) : tx.metadata || {};
  } catch (e) {
    console.error("Error parsing metadata", e);
  }

  // Lógica para determinar si es ingreso (+) o egreso (-)
  // NOTA: CONTRIBUTION_RECEIVED es positivo para el grupo
  const isPositive = 
    tx.type.includes('DEPOSIT') || 
    tx.type.includes('RECEIVED') || 
    tx.type === 'LOAN_DISBURSEMENT' ||
    tx.type === 'CONTRIBUTION_RECEIVED'; // <--- AGREGADO

  let title = 'Transacción';
  let subtitle = '';
  let icon = <DollarSign />;
  let counterparty = 'Pixel Money'; 
  let bankName = 'Pixel Money';

  switch (tx.type) {
    // ... (Casos anteriores P2P, TRANSFER, DEPOSIT se mantienen igual) ...
    case 'P2P_SENT':
      const destName = meta.destination_name || meta.destination_phone_number || 'Contacto';
      title = `Envío a ${destName}`;
      subtitle = 'Transferencia Pixel Money';
      icon = <ArrowUpRight className="text-rose-500" />;
      counterparty = destName;
      break;
    case 'P2P_RECEIVED':
      // Intentamos obtener el nombre del sender desde los metadatos
      // Si no existe (transacciones viejas), ponemos "Usuario Pixel Money"
      const senderName = meta.sender_name || 'Usuario Pixel Money';
      
      title = `Recibido de ${senderName}`;
      subtitle = 'Transferencia Pixel Money'; // Dejamos claro que es interna
      icon = <ArrowDownLeft className="text-emerald-500" />;
      
      // Información extra para el modal de detalle
      bankName = 'Pixel Money';
      counterparty = senderName;
      break;
    case 'TRANSFER_SENT':
      bankName = meta.to_app || 'Banco Externo';
      title = `Envío a ${bankName}`;
      subtitle = `Destino: ${meta.destination || 'Externo'}`;
      icon = <Building2 className="text-rose-500" />;
      break;
    case 'DEPOSIT':
      if (tx.source_wallet_type === 'CENTRAL_API') {
        title = `Recibido de ${meta.from_user || 'Desconocido'}`;
        subtitle = `Desde ${meta.from_app || 'Banco Externo'}`;
        icon = <Building2 className="text-emerald-500" />;
      } else {
        title = 'Depósito en Efectivo';
        subtitle = 'Carga de saldo';
        icon = <Wallet className="text-emerald-500" />;
      }
      break;

    // --- NUEVOS CASOS PARA GRUPOS ---

    case 'CONTRIBUTION_SENT': // Vista del Usuario (salida)
      title = 'Aporte a Grupo';
      subtitle = 'Enviado al fondo común';
      icon = <Gift className="text-rose-500" />;
      break;

    case 'CONTRIBUTION_RECEIVED': // Vista del Grupo (entrada)
      title = 'Aporte Recibido'; 
      subtitle = 'Ingreso al fondo común';
      icon = <Gift className="text-emerald-500" />;
      break;
      
    case 'GROUP_WITHDRAWAL': 
       // Este es tricky: Para el usuario es entrada (+), para el grupo es salida (-)
       // La lógica de isPositive arriba lo maneja según contexto, pero aquí definimos textos
       title = 'Retiro de Fondos';
       subtitle = 'Salida de dinero aprobada';
       icon = <Users className="text-rose-500" />;
       break;

    // ... (LOAN se mantiene igual) ...
    case 'LOAN_DISBURSEMENT':
      title = 'Préstamo Recibido';
      subtitle = 'Desembolso aprobado';
      icon = <DollarSign className="text-emerald-500" />;
      break;
    case 'LOAN_PAYMENT':
      title = 'Pago de Préstamo';
      subtitle = 'Cuota pagada';
      icon = <RefreshCcw className="text-rose-500" />;
      break;

    default:
      title = tx.type.replace(/_/g, ' ');
      subtitle = new Date(tx.created_at).toLocaleDateString();
  }

  return {
    title,
    subtitle,
    icon,
    isPositive,
    amountColor: isPositive ? 'text-emerald-500' : 'text-rose-500',
    details: {
      bankName,
      counterparty,
      metadata: meta
    }
  };
};