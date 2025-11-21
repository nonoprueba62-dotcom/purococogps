export interface Client {
  ID?: string;
  Nombre: string;
  Teléfono: string;
  Email: string;
  Empresa: string;
  Cédula: string;
  Dirección: string;
  Categoría: string;
  Estado: string;
  Notas: string;
  Lat: number | null;
  Lng: number | null;
}

export type NotificationType = 'success' | 'error' | null;

export interface NotificationState {
  type: 'success' | 'error';
  message: string;
}