import React, { useState, useEffect, useCallback } from 'react';
import { fetchClients, saveClient, deleteClient } from './services/clientService';
import MapComponent from './components/MapComponent';
import ClientForm from './components/ClientForm';
import ConfirmModal from './components/ConfirmModal';
import { Client, NotificationState } from './types';
import { 
  PlusIcon, SearchIcon, PhoneIcon, Building2Icon, 
  NavigationIcon, Edit2Icon, Trash2Icon, MapPinIcon 
} from './components/Icons';

function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    idToDelete: string | null;
    isDeleting: boolean;
  }>({ isOpen: false, idToDelete: null, isDeleting: false });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper to ensure we always display a readable string error
  const extractErrorText = (e: any): string => {
    if (e instanceof Error) return e.message;
    if (typeof e === 'string') return e;
    
    if (typeof e === 'object' && e !== null) {
      // Try common properties
      const msg = e.message || e.error_description || e.details;
      if (msg && typeof msg === 'string') return msg;

      try {
        const json = JSON.stringify(e);
        if (json !== '{}' && json !== '[]') return json;
      } catch {
        // ignore
      }
    }
    return "Error desconocido (sin detalles)";
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
    } catch (e: any) { 
      const msg = extractErrorText(e);
      showNotification('error', 'Error cargando datos: ' + msg);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async (clientData: Client) => {
    try {
      await saveClient(clientData);
      await loadData();
      showNotification('success', clientData.ID ? 'Cliente actualizado' : 'Cliente creado');
    } catch (e: any) {
      const msg = extractErrorText(e);
      showNotification('error', msg);
      throw e;
    }
  };

  const requestDelete = (id: string) => {
    setConfirmModal({ isOpen: true, idToDelete: id, isDeleting: false });
  };

  const confirmDelete = async () => {
    const id = confirmModal.idToDelete;
    if (!id) return;
    
    setConfirmModal(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteClient(id);
      setClients(prev => prev.filter(c => c.ID !== id));
      showNotification('success', 'Cliente eliminado');
      setConfirmModal({ isOpen: false, idToDelete: null, isDeleting: false });
    } catch (e: any) {
      const msg = extractErrorText(e);
      showNotification('error', 'Error al eliminar: ' + msg);
      setConfirmModal(prev => ({ ...prev, isDeleting: false }));
      loadData();
    }
  };

  const filteredClients = clients.filter(c => {
    const nombre = String(c.Nombre || '').toLowerCase();
    const empresa = String(c.Empresa || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    return nombre.includes(term) || empresa.includes(term);
  });

  return (
    <div className="min-h-screen pb-20 relative">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">CRM Clientes</h1>
            <p className="text-slate-500 text-xs sm:text-sm">Gestión simple y geolocalizada</p>
          </div>
          <button 
            onClick={() => { setEditingClient(null); setIsModalOpen(true); }} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
          >
            <PlusIcon className="w-5 h-5" /> 
            <span className="hidden sm:inline">Nuevo</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8 relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Buscar por nombre o empresa..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all" 
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Contacto</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Empresa</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500 animate-pulse">Cargando datos...</td></tr>
                ) : filteredClients.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-10 text-center text-slate-500">No se encontraron clientes.</td></tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.ID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shadow-sm">
                            {(client.Nombre || '?').toString().charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-900">{client.Nombre}</div>
                            <div className="text-xs text-slate-500 md:hidden">{client.Teléfono}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-600 flex items-center gap-1">
                            <PhoneIcon className="w-3 h-3 text-slate-400"/> {client.Teléfono}
                          </span>
                          <span className="text-xs text-slate-400 mt-0.5">{client.Email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Building2Icon className="w-4 h-4 text-slate-400"/> {client.Empresa || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${client.Estado === 'Activo' ? 'bg-green-100 text-green-700 border border-green-200' : 
                            client.Estado === 'Inactivo' ? 'bg-red-100 text-red-700 border border-red-200' : 
                            'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                          {client.Estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {client.Lat && client.Lng && (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&destination=${client.Lat},${client.Lng}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-lg transition-colors" 
                              title="Navegar"
                            >
                              <NavigationIcon className="w-4 h-4" />
                            </a>
                          )}
                          <button 
                            onClick={() => { setEditingClient(client); setIsModalOpen(true); }} 
                            className="text-amber-500 hover:text-amber-700 hover:bg-amber-50 p-2 rounded-lg transition-colors" 
                            title="Editar"
                          >
                            <Edit2Icon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => requestDelete(client.ID!)} 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors" 
                            title="Eliminar"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <MapPinIcon className="w-6 h-6 text-blue-500"/> Mapa de Clientes
        </h2>
        <MapComponent 
          clients={clients} 
          tempLocation={editingClient?.Lat && editingClient?.Lng ? { lat: editingClient.Lat, lng: editingClient.Lng } : null} 
        />
      </main>

      <ClientForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSave} 
        initialData={editingClient}
        onShowNotification={showNotification}
      />

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title="¿Eliminar cliente?"
        message="Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar este registro permanentemente?"
        onClose={() => setConfirmModal({ isOpen: false, idToDelete: null, isDeleting: false })}
        onConfirm={confirmDelete}
        isDeleting={confirmModal.isDeleting}
      />

      {notification && (
        <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 z-[70] animate-fade-in ${notification.type === 'success' ? 'bg-white border-l-4 border-emerald-500' : 'bg-white border-l-4 border-red-500'}`}>
          <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
          <span className="font-medium text-slate-700">{notification.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;