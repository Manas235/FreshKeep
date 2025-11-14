import React from 'react';
import { Alert, AlertType } from '../types';
import { AlertTriangleIcon, BellIcon, LeafIcon } from './Icons';

const AlertBanner: React.FC<{ alert: Alert, onClose: () => void }> = ({ alert, onClose }) => {
  const styles: Record<AlertType, string> = {
    danger: 'bg-red-50 text-red-800 border-red-200 shadow-red-100',
    warning: 'bg-orange-50 text-orange-800 border-orange-200 shadow-orange-100',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-100',
    info: 'bg-blue-50 text-blue-800 border-blue-200 shadow-blue-100',
  };

  const icon = {
    danger: <AlertTriangleIcon className="w-5 h-5" />,
    warning: <AlertTriangleIcon className="w-5 h-5" />,
    success: <LeafIcon className="w-5 h-5" />,
    info: <BellIcon className="w-5 h-5" />,
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border shadow-sm w-full max-w-md transition-all duration-300 animate-fade-in-up ${styles[alert.type]}`}>
      <div className="flex items-center gap-3">
        {icon[alert.type]}
        <p className="text-sm font-medium">{alert.message}</p>
      </div>
      <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 transition-opacity p-1">
        &times;
      </button>
    </div>
  );
};

export default AlertBanner;