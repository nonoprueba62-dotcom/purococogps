import React from 'react';
import { AlertTriangleIcon } from './Icons';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message, isDeleting }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center gap-3 mb-4 text-amber-500">
          <AlertTriangleIcon className="w-8 h-8" />
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg shadow-red-500/30 transition-colors flex items-center gap-2 disabled:opacity-70">
            {isDeleting ? 'Eliminando...' : 'Confirmar Eliminación'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;