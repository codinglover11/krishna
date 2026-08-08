import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader, CheckCircle } from 'lucide-react';
import { toast } from '../../stores/toastStore';

export const MapLocationPicker = ({ onLocationSelect, onCancel }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Initialize Map
  useEffect(() => {
    if (!window.L) {
      toast.error('Map library failed to load.');
      return;
    }

    // Default to Jaipur shop coordinates
    const defaultLat = 26.8524;
    const defaultLng = 75.7607;

    // Create Map
    const map = window.L.map(mapRef.current).setView([defaultLat, defaultLng], 12);
    mapInstanceRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Initial Marker
    const marker = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    // Drag event
    marker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      handleReverseGeocode(pos.lat, pos.lng);
    });

    // Map Click event
    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      handleReverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    return () => {
      map.remove();
    };
  }, []);

  const handleReverseGeocode = async (lat, lng) => {
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const data = await res.json();
      
      setSelectedLocation({
        latitude: lat,
        longitude: lng,
        addressLine1: data.locality || data.city || data.principalSubdivision || '',
        city: data.city || data.locality || data.principalSubdivision || '',
        state: data.principalSubdivision || '',
        postalCode: data.postcode || ''
      });
    } catch (err) {
      toast.error('Failed to get address details for this location.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        mapInstanceRef.current.flyTo([lat, lng], 15);
        markerRef.current.setLatLng([lat, lng]);
        
        // Populate Location
        handleReverseGeocode(lat, lng);
      } else {
        toast.warning('Location not found. Try a different search term.');
      }
    } catch (err) {
      toast.error('Error searching for location.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(34,27,21,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(5px)', padding: '24px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        width: '100%',
        maxWidth: '800px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow)'
      }}>
        
        {/* Header & Search */}
        <div style={{ padding: '24px', borderBottom: '1px solid var(--line)', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0 0 16px 0', display: 'flex', justifyContent: 'space-between' }}>
            <span>Find your delivery location</span>
            <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
          </h2>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input 
                type="text" 
                placeholder="Search for an area, street, or city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 44px', borderRadius: '8px', border: '1px solid var(--line)' }}
              />
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" disabled={isSearching} className="btn-primary" style={{ padding: '0 24px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
              {isSearching ? <Loader size={20} className="spin" /> : 'Search'}
            </button>
          </form>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '12px 0 0 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={14} /> Click on the map or drag the pin to select the exact delivery location.
          </p>
        </div>

        {/* Map Container */}
        <div ref={mapRef} style={{ width: '100%', height: '400px', backgroundColor: '#e2e8f0', zIndex: 1 }}></div>

        {/* Footer & Confirm */}
        <div style={{ padding: '24px', backgroundColor: '#fff', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            {selectedLocation ? (
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Selected Location</p>
                <p style={{ margin: 0, fontWeight: '600', color: 'var(--primary-color)' }}>
                  {selectedLocation.addressLine1}, {selectedLocation.city}
                </p>
              </div>
            ) : (
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>Drop a pin to select...</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onCancel} style={{ padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--line)', backgroundColor: 'transparent', fontWeight: '600', cursor: 'pointer' }}>
              Cancel
            </button>
            <button 
              type="button"
              onClick={() => {
                if (selectedLocation) onLocationSelect(selectedLocation);
                else toast.warning('Please select a location on the map first.');
              }}
              disabled={!selectedLocation || isSearching} 
              style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--primary-color)', color: '#fff', fontWeight: '600', cursor: selectedLocation ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircle size={18} /> Confirm Location
            </button>
          </div>
        </div>

      </div>
      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MapLocationPicker;
