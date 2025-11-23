'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationToastProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
  duration?: number;
}

export default function NotificationToast({ 
  message, 
  type, 
  onClose, 
  duration = 5000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  const styles = {
    success: 'bg-green-500 border-green-600 text-white',
    error: 'bg-red-500 border-red-600 text-white',
    warning: 'bg-yellow-500 border-yellow-600 text-white',
    info: 'bg-blue-500 border-blue-600 text-white',
  };

  return (
    <div className={`
      fixed top-4 right-4 z-50 max-w-sm w-full
      transform transition-all duration-300 ease-in-out
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      ${styles[type]}
      rounded-xl shadow-2xl border-2 p-4
    `}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {icons[type]}
          <p className="font-medium text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}