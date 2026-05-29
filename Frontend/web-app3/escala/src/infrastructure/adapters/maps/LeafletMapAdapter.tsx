'use client';

import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapProps, GeoPoint } from '@/core/domain/models/map.model';
import { useEffect } from 'react';

// Fix for default Leaflet icons in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function MapEvents({ onSelect }: { onSelect?: (point: GeoPoint) => void }) {
  useMapEvents({
    click(e) {
      if (onSelect) {
        onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export default function LeafletMapAdapter({
  center,
  zoom = 15,
  markers = [],
  geofence,
  onPositionSelect,
  className = "h-[300px] w-full rounded-xl",
  interactive = true
}: MapProps) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      className={className}
      scrollWheelZoom={interactive}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((marker, idx) => (
        <Marker key={idx} position={[marker.position.lat, marker.position.lng]}>
          {marker.title && (
            <Popup>
              <strong>{marker.title}</strong>
              {marker.description && <p>{marker.description}</p>}
            </Popup>
          )}
        </Marker>
      ))}

      {geofence && (
        <Circle
          center={[geofence.center.lat, geofence.center.lng]}
          radius={geofence.radius}
          pathOptions={{ 
            fillColor: geofence.color || '#3b82f6', 
            color: geofence.color || '#3b82f6',
            fillOpacity: 0.2 
          }}
        />
      )}

      {interactive && <MapEvents onSelect={onPositionSelect} />}
    </MapContainer>
  );
}
