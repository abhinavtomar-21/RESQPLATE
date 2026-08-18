import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Custom Icons
const volunteerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ngoIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const VolunteerNavigation: React.FC = () => {
  // Placeholder Route (Pending real-time tracking integration)
  const start: [number, number] = [28.6300, 77.2200]; // Volunteer
  const pickup: [number, number] = [28.6200, 77.2150]; // Restaurant
  const dropoff: [number, number] = [28.6050, 77.1950]; // NGO

  const routePositions: [number, number][] = [start, pickup, dropoff];

  return (
    <div style={{ display: 'flex', gap: '20px', height: '100%' }}>
      {/* Side Panel */}
      <div style={{ width: '300px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>Active Delivery</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', color: '#16a34a' }}>Step 1: Pickup</div>
          <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0' }}>The Grand Spice (1.2 km)</p>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>Ask for Order #1042</p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontWeight: 'bold', color: '#2563eb' }}>Step 2: Drop-off</div>
          <p style={{ fontSize: '14px', color: '#4b5563', margin: '4px 0' }}>Food for All NGO (3.4 km)</p>
        </div>

        <button style={{ width: '100%', padding: '12px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Mark Pickup Complete
        </button>
      </div>

      {/* Map */}
      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden' }}>
        <MapContainer center={pickup} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={start} icon={volunteerIcon}>
            <Popup>You are here</Popup>
          </Marker>
          
          <Marker position={pickup} icon={restaurantIcon}>
            <Popup>Pickup: The Grand Spice</Popup>
          </Marker>

          <Marker position={dropoff} icon={ngoIcon}>
            <Popup>Drop-off: Food for All NGO</Popup>
          </Marker>

          <Polyline positions={routePositions} color="#8b5cf6" weight={5} dashArray="10, 10" />
        </MapContainer>
      </div>
    </div>
  );
};
