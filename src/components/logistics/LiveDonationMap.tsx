import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Icons
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

// Coordinates (e.g., Delhi, India)
const DEFAULT_CENTER: [number, number] = [28.6139, 77.2090];

import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';

export const LiveDonationMap: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [ngos, setNgos] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch available donations
      const { data: dData } = await supabase
        .from('donations')
        .select('*')
        .eq('status', 'PENDING');
      
      if (dData) setDonations(dData);

      // Fetch NGOs (profiles with role NGO)
      const { data: nData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'NGO')
        .eq('approval_status', 'APPROVED');
        
      // Just to give them some default coordinates if none exist, normally this would be in profiles
      if (nData) {
         setNgos(nData.map(n => ({...n, lat: 28.6150, lng: 77.2200})));
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ height: '100%', width: '100%', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
      <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Plot Restaurants (Donations) */}
        {donations.map(donation => (
          <Marker key={donation.id} position={[donation.latitude || 28.6200, donation.longitude || 77.2150]} icon={restaurantIcon}>
            <Popup>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{donation.food_type} - {donation.quantity}</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Status: {donation.status}</div>
            </Popup>
          </Marker>
        ))}

        {/* Plot NGOs */}
        {ngos.map(ngo => (
          <Marker key={ngo.id} position={[ngo.lat, ngo.lng]} icon={ngoIcon}>
            <Popup>
              <div style={{ fontWeight: 'bold' }}>{ngo.name}</div>
              <div style={{ fontSize: '12px', color: '#2563eb' }}>Ready to Receive</div>
            </Popup>
            {/* Show 2km Geo-fence */}
            <Circle center={[ngo.lat, ngo.lng]} pathOptions={{ fillColor: '#3b82f6', color: '#2563eb', weight: 1 }} radius={2000} />
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
