import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, MessageCircle, Map, ArrowLeft, Minus, Plus, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues with bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Component to handle map clicks and updating marker
function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

// Component to fly to new center when auto-detected
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
}

export const DirectCheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // State from previous page
  const { product, selectedSize, selectedColor } = location.state || {};

  // Form state
  const [quantity, setQuantity] = useState(1);
  const [houseNo, setHouseNo] = useState('');
  const [nearbyLocation, setNearbyLocation] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Location state
  const defaultCenter = { lat: 26.869315, lng: 75.755890 }; // Shop location
  const [mapPosition, setMapPosition] = useState(null);
  const [locationMapUrl, setLocationMapUrl] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Auto detect location on mount
  useEffect(() => {
    handleDetectLocation();
  }, []);

  const handleDetectLocation = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      setLocationError('');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const pos = { lat: latitude, lng: longitude };
          setMapPosition(pos);
          setLocationMapUrl(`https://www.google.com/maps?q=${latitude},${longitude}`);
          setIsLocating(false);
        },
        (error) => {
          setLocationError('Unable to detect location. Please tap on the map to set your location.');
          setIsLocating(false);
          // Set to default shop center so map shows something
          if (!mapPosition) {
             setMapPosition(defaultCenter);
          }
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Please tap on the map.');
      if (!mapPosition) setMapPosition(defaultCenter);
    }
  };

  const handleMapPositionChange = (latlng) => {
    setMapPosition(latlng);
    setLocationMapUrl(`https://www.google.com/maps?q=${latlng.lat},${latlng.lng}`);
  };

  if (!product) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <h2>No product selected</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Back to Products
        </button>
      </div>
    );
  }

  const price = parseFloat(product.price) || 0;
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const activePrice = discountPrice || price;
  const imageUrl = product.primary_image || (product.images && product.images[0]?.image_url);
  const totalPrice = activePrice * quantity;

  const handleWhatsAppOrder = () => {
    if (!houseNo || !city || !stateName || !pincode) {
      alert("Please fill in all required address fields (House No, City, State, Pin code).");
      return;
    }
    if (!mapPosition) {
      alert("Please select your delivery location on the map.");
      return;
    }

    const ownerPhone = "919079322115"; // Owner WhatsApp number
    const finalMapUrl = locationMapUrl || `https://www.google.com/maps?q=${mapPosition.lat},${mapPosition.lng}`;
    
    const message = `Hello Sawariya Foot Collection i want to order the ${product.name} which is special and i like these type of product so can you please deliver this product to me 
Address
House No: ${houseNo}
Nearby location: ${nearbyLocation}
city: ${city}
State: ${stateName}
Pin code: ${pincode}
Exact location from map: ${finalMapUrl}
Product Detail
Product name: ${product.name}
Product size: ${selectedSize || 'N/A'}
Product color: ${selectedColor || 'N/A'}
Product picture: ${imageUrl || 'No image'}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${ownerPhone}?text=${encodedMessage}`, '_blank');
  };

  const handleMeetAtShop = () => {
    const coordinates = "26.869315, 75.755890";
    const encodedLocation = encodeURIComponent(coordinates);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedLocation}`, '_blank');
  };

  const inputStyle = {
    width: '100%', 
    padding: '12px', 
    borderRadius: 'var(--radius-md)', 
    border: '1px solid var(--border-color)', 
    backgroundColor: 'var(--bg-main)', 
    color: 'var(--text-primary)', 
    fontFamily: 'inherit',
    marginBottom: '16px'
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 24px', width: '100%', minHeight: '70vh' }}>
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          marginBottom: '24px',
          fontSize: '1rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary-color)', marginBottom: '32px' }}>
        Complete Your Order
      </h1>

      <div style={{ display: 'grid', gap: '32px' }}>
        
        {/* Product Summary */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div style={{ width: '120px', height: '120px', backgroundColor: 'var(--bg-muted)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>No image</span>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>{product.name}</h3>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '12px' }}>
                {selectedSize && <span>Size: <strong>{selectedSize}</strong></span>}
                {selectedColor && <span>Color: <strong>{selectedColor}</strong></span>}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary-color)' }}>
                ₹{activePrice.toLocaleString()}
              </div>
            </div>
            
            {/* Quantity Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
              <span style={{ fontWeight: '500' }}>Quantity:</span>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ padding: '8px 12px', background: 'var(--bg-muted)', border: 'none', borderRight: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: '8px 16px', fontWeight: '600', fontSize: '0.875rem' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ padding: '8px 12px', background: 'var(--bg-muted)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Address Form */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="var(--primary-color)" /> Delivery Details
            </h3>
            
            <button 
              onClick={handleDetectLocation}
              disabled={isLocating}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                padding: '8px 12px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--secondary-color)', 
                backgroundColor: 'rgba(235, 94, 85, 0.1)', 
                color: 'var(--secondary-color)',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: isLocating ? 'not-allowed' : 'pointer'
              }}
            >
              <Navigation size={16} />
              {isLocating ? 'Locating...' : 'Detect Location'}
            </button>
          </div>
          
          {locationError && (
            <div style={{ color: 'var(--error)', fontSize: '0.875rem', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--radius-sm)' }}>
              {locationError}
            </div>
          )}

          {/* Leaflet Map for Location Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>
              Pinpoint Your Exact Location
            </label>
            <div style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              <MapContainer 
                center={mapPosition || defaultCenter} 
                zoom={15} 
                scrollWheelZoom={true} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={mapPosition} setPosition={handleMapPositionChange} />
                {mapPosition && <MapUpdater center={mapPosition} />}
              </MapContainer>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Tap or click anywhere on the map to place a pin at your exact delivery location.
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>House No *</label>
            <input type="text" value={houseNo} onChange={(e) => setHouseNo(e.target.value)} required style={inputStyle} placeholder="E.g. Flat 101, Building Name" />

            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>Nearby Location</label>
            <input type="text" value={nearbyLocation} onChange={(e) => setNearbyLocation(e.target.value)} style={inputStyle} placeholder="E.g. Near Apollo Hospital" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>City *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required style={inputStyle} placeholder="City" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>State *</label>
                <input type="text" value={stateName} onChange={(e) => setStateName(e.target.value)} required style={inputStyle} placeholder="State" />
              </div>
            </div>

            <label style={{ display: 'block', fontWeight: '500', marginBottom: '8px', fontSize: '0.9375rem' }}>Pin Code *</label>
            <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} required style={inputStyle} placeholder="6-digit Pincode" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', marginTop: '8px' }}>
             <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Total Amount:</span>
             <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>₹{totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={handleWhatsAppOrder}
            style={{ 
              backgroundColor: '#25D366', 
              color: '#fff', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              border: 'none', 
              fontSize: '1.125rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
            }}
          >
            <MessageCircle size={24} />
            Contact Owner on WhatsApp
          </button>

          <button 
            onClick={handleMeetAtShop}
            style={{ 
              backgroundColor: 'var(--bg-muted)', 
              color: 'var(--text-primary)', 
              padding: '16px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-color)', 
              fontSize: '1rem', 
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}
          >
            <Map size={20} />
            Meet us at Shop
          </button>
        </div>

      </div>
    </div>
  );
};

export default DirectCheckout;
