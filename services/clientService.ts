import { Client } from '../types';

// ------------------------------------------------------------------
// CONFIGURACIÓN: URL DE GOOGLE APPS SCRIPT
// ------------------------------------------------------------------
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxCRkxrZfl_13X2A8wAm7QxJFgdtCi5WZ5ZUVt0KoZ_6HTnMgqd7Gz73EmYFjozxAo1/exec';

// Helper para errores
const getErrorMessage = (error: any): string => {
  if (!error) return 'Error desconocido';
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (typeof error === 'object') {
    const msg = error.message || error.error || error.description;
    if (msg && typeof msg === 'string') return msg;
    try { return JSON.stringify(error); } catch (e) {}
  }
  return "Error desconocido";
};

// Validar URL
const checkUrl = () => {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('INSERT_GOOGLE_SCRIPT_URL_HERE')) {
    throw new Error("⚠️ Configuración incompleta: La URL del script no es válida.");
  }
};

// Mapeo de Datos (Google Sheets Headers -> App Types)
const mapFromSheet = (data: any[]): Client[] => {
  if (!Array.isArray(data)) return [];
  return data.map(item => ({
    ID: item.id,
    Nombre: item.nombre,
    Teléfono: item.telefono,
    Email: item.email,
    Empresa: item.empresa,
    Cédula: item.cedula,
    Dirección: item.direccion,
    Categoría: item.categoria,
    Estado: item.estado,
    Notas: item.notas,
    // Convertir strings numéricos a números reales para el mapa
    Lat: item.lat ? parseFloat(item.lat) : null,
    Lng: item.lng ? parseFloat(item.lng) : null
  }));
};

// --- API METHODS ---

export const fetchClients = async (): Promise<Client[]> => {
  checkUrl();
  try {
    // GET request a la URL del script devuelve todos los datos
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const result = await response.json();
    
    if (result.status === 'error') throw new Error(result.message);
    
    return mapFromSheet(result.data);
  } catch (error: any) {
    console.error("Error fetching from Sheets:", error);
    throw new Error(getErrorMessage(error));
  }
};

export const saveClient = async (client: Client) => {
  checkUrl();
  
  // Preparar payload
  const payload = {
    action: client.ID ? 'update' : 'create',
    id: client.ID,
    data: {
      nombre: client.Nombre,
      telefono: client.Teléfono,
      email: client.Email,
      empresa: client.Empresa,
      cedula: client.Cédula,
      direccion: client.Dirección,
      categoria: client.Categoría,
      estado: client.Estado,
      notas: client.Notas,
      lat: client.Lat,
      lng: client.Lng
    }
  };

  try {
    // Google Apps Script requiere fetch con POST stringificado en body.
    // Usar text/plain evita "preflight" CORS options requests complicados
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.status === 'error') throw new Error(result.message);
    return result;
    
  } catch (error: any) {
    console.error("Error saving to Sheets:", error);
    throw new Error(getErrorMessage(error));
  }
};

export const deleteClient = async (id: string) => {
  checkUrl();
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'delete', id: id })
    });

    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    
    return { status: 'success' };
  } catch (error: any) {
    console.error("Error deleting from Sheets:", error);
    throw new Error(getErrorMessage(error));
  }
};