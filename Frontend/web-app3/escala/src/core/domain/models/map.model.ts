export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface MapMarker {
  position: GeoPoint;
  title?: string;
  description?: string;
}

export interface GeofencingOptions {
  center: GeoPoint;
  radius: number; // In meters
  color?: string;
}

export interface MapProps {
  center: GeoPoint;
  zoom?: number;
  markers?: MapMarker[];
  geofence?: GeofencingOptions;
  onPositionSelect?: (point: GeoPoint) => void;
  className?: string;
  interactive?: boolean;
}
