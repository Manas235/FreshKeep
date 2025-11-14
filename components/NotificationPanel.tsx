import React from 'react';
import { Alert } from '../types';
import { AlertTriangleIcon, BellIcon } from './Icons';

interface NotificationPanelProps {
  isOpen: boolean;
  notifications: Alert[];
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, notifications, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-stone-100 z-50 overflow-hidden animate-fade-in-up origin-top-right ring-1 ring-black/5">
      <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
        <h3 className="font-semibold text-stone-800 flex items-center gap-2 text-sm uppercase tracking-wide">
          <BellIcon className="w-4 h-4 text-stone-500" />
          Notifications
        </h3>
        <span className="bg-teal-100 text-teal-700 text-xs font-bold px-2 py-0.5 rounded-full">
          {notifications.length}
        </span>
      </div>
      
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <p className="text-sm">No new alerts</p>
            <p className="text-xs mt-1 opacity-70">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {notifications.map(notification => (
              <div key={notification.id} className={`p-4 hover:bg-stone-50 transition-colors relative group ${notification.type === 'danger' ? 'bg-red-50/30' : ''}`}>
                <div className="flex gap-3 items-start">
                   <div className={`mt-0.5 flex-shrink-0 ${notification.type === 'danger' ? 'text-red-500' : 'text-amber-500'}`}>
                     <AlertTriangleIcon className="w-4 h-4" />
                   </div>
                   <div className="flex-1">
                     <p className={`text-sm leading-snug ${notification.type === 'danger' ? 'text-red-800 font-medium' : 'text-stone-700'}`}>
                       {notification.message}
                     </p>
                     <p className="text-xs text-stone-400 mt-1.5 font-medium">
                       {new Date(notification.date).toLocaleDateString()}
                     </p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;