import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import { XIcon, MapPinIcon, CrosshairIcon, SaveIcon } from './Icons';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Client) => Promise<void>;
  initialData: Client | null;
  onShowNotification: (type: 'success' | 'error', message: string) => void;
}

const initialFormState: Client = {
  Nombre: '',
  Teléfono: '',
  Email: '',
  Empresa: '',
  Cédula: '',
  Dirección: '',
  Categoría: 'Cliente',
  Estado: 'Activo',
  Notas: '',
  Lat: null,
  Lng: null
};

const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSubmit, initialData, onShowNotification }) => {
  const [formData, setFormData] = useState<Client>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || initialFormState);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      onShowNotification('error', "Geolocalización no soportada por este navegador");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({ 
          ...prev, 
          Lat: pos.coords.latitude, 
          Lng: pos.coords.longitude 
        }));
        setLocating(false);
        onShowNotification('success', "Ubicación obtenida correctamente");
      },
      (err) => {
        console.error(err);
        onShowNotification('error', "No se pudo obtener ubicación. Verifique permisos.");
        setLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (e) {
      // Error is handled in the parent notification system, but we need to stop loading
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-800">
            {initialData ? 'Editar Cliente' : 'Nuevo Cliente'}
          </h2>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <XIcon className="w-6 h-6 text-slate-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Nombre completo *</label>
            <input required name="Nombre" value={formData.Nombre} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ej. Juan Pérez" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Teléfono *</label>
            <input required name="Teléfono" value={formData.Teléfono} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="+598 ..." />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input type="email" name="Email" value={formData.Email} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Empresa</label>
            <input name="Empresa" value={formData.Empresa} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Cédula</label>
            <input name="Cédula" value={formData.Cédula} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="md:col-span-2 space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPinIcon className="w-4 h-4 text-blue-500"/> Ubicación
            </label>
            <div className="flex gap-2 mb-2">
              <input name="Dirección" value={formData.Dirección} onChange={handleChange} className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Dirección" />
              <button type="button" onClick={handleGeolocation} disabled={locating} className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors">
                {locating ? '...' : <CrosshairIcon className="w-5 h-5" />} GPS
              </button>
            </div>
            <div className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg flex justify-between">
              <span>Lat: {formData.Lat ? formData.Lat.toFixed(6) : '---'}</span>
              <span>Lng: {formData.Lng ? formData.Lng.toFixed(6) : '---'}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Categoría</label>
            <select name="Categoría" value={formData.Categoría} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option>Cliente</option>
              <option>Prospecto</option>
              <option>Proveedor</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Estado</label>
            <select name="Estado" value={formData.Estado} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all">
              <option>Activo</option>
              <option>Inactivo</option>
              <option>Pendiente</option>
            </select>
          </div>
          
          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Notas</label>
            <textarea name="Notas" value={formData.Notas} onChange={handleChange} className="w-full p-3 border border-slate-200 rounded-xl min-h-[100px] focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          
          <div className="md:col-span-2 flex justify-end gap-4 mt-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={loading} className="px-6 py-3 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-70 transition-colors">
              {loading ? 'Guardando...' : <><SaveIcon className="w-5 h-5" /> Guardar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;