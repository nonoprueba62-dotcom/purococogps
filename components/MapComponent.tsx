import React, { useEffect, useRef } from 'react';
import { Client } from '../types';

declare const L: any;

interface MapComponentProps {
  clients: Client[];
  tempLocation: { lat: number; lng: number } | null;
}

const MapComponent: React.FC<MapComponentProps> = ({ clients, tempLocation }) => {
  const mapRef = useRef<any>(null);
  const mapContainerId = 'leaflet-map-container';
  const markersRef = useRef<any[]>([]);
  const tempMarkerRef = useRef<any>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof L === 'undefined') return;

    if (!mapRef.current) {
      // Default center (Uruguay/General) or approximate
      const defaultCoords = [-32.522, -55.765]; 
      mapRef.current = L.map(mapContainerId).setView(defaultCoords, 6);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap'
      }).addTo(mapRef.current);
    }
    
    // Fix for Leaflet rendering issues in some containers
    const timer = setTimeout(() => { 
      mapRef.current?.invalidateSize(); 
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  // Handle Clients Markers
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;
    
    // Clear existing markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    // Add markers for clients
    clients.forEach(client => {
      if (client.Lat && client.Lng) {
        const marker = L.marker([client.Lat, client.Lng])
          .addTo(mapRef.current)
          .bindPopup(`
            <div style="font-family: 'Inter', sans-serif; font-size: 14px; min-width: 160px;">
              <b style="display:block; margin-bottom: 4px; font-size: 16px;">${client.Nombre}</b>
              <div style="color: #475569; margin-bottom: 4px; font-size: 12px;">${client.Teléfono}</div>
              <div style="color: #64748b; font-style: italic; margin-bottom: 10px; font-size: 12px;">${client.Dirección || ''}</div>
              <a href="https://www.google.com/maps/dir/?api=1&destination=${client.Lat},${client.Lng}" target="_blank" 
                 style="display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%; background-color: #3b82f6; color: white; padding: 8px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 12px;">
                <span>Cómo llegar</span>
              </a>
            </div>
          `);
        markersRef.current.push(marker);
      }
    });
  }, [clients]);

  // Handle Temporary/Selected Location Marker
  useEffect(() => {
    if (!mapRef.current || typeof L === 'undefined') return;

    if (tempLocation) {
      if (tempMarkerRef.current) {
        mapRef.current.removeLayer(tempMarkerRef.current);
      }
      
      tempMarkerRef.current = L.marker([tempLocation.lat, tempLocation.lng])
        .addTo(mapRef.current)
        .bindPopup("Ubicación Seleccionada")
        .openPopup();
        
      mapRef.current.setView([tempLocation.lat, tempLocation.lng], 16);
    } else if (tempMarkerRef.current) {
      mapRef.current.removeLayer(tempMarkerRef.current);
      tempMarkerRef.current = null;
    }
  }, [tempLocation]);

  if (typeof L === 'undefined') {
    return (
      <div className="w-full h-[500px] rounded-2xl shadow-lg border border-slate-200 mt-8 bg-slate-50 flex items-center justify-center text-slate-400">
        Cargando mapa (Leaflet no encontrado)...
      </div>
    );
  }

  return (
    <div 
      id={mapContainerId} 
      className="w-full h-[500px] rounded-2xl shadow-lg border border-slate-200 mt-8 z-0" 
    />
  );
};

export default MapComponent;