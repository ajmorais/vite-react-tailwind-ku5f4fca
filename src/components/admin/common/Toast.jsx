import React from 'react';
import { AlertTriangle, CheckCircle, Bell } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-xl text-white font-bold flex items-center space-x-3 animate-fadeIn ${
      toast.type === 'error' ? 'bg-red-600' : toast.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    }`}>
      {toast.type === 'error' && <AlertTriangle size={20} />}
      {toast.type === 'success' && <CheckCircle size={20} />}
      {toast.type === 'info' && <Bell size={20} />}
      <span>{toast.message}</span>
    </div>
  );
}
