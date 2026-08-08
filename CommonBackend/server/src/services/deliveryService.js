// e:\KrishnaFootwear\CommonBackend\server\src\services\deliveryService.js
const SHOP_LATITUDE = parseFloat(process.env.SHOP_LATITUDE || 26.8524);
const SHOP_LONGITUDE = parseFloat(process.env.SHOP_LONGITUDE || 75.7607);
const DELIVERY_CHARGE_PER_KM = parseFloat(process.env.DELIVERY_CHARGE_PER_KM || 10);
const MAX_DELIVERY_DISTANCE_KM = parseFloat(process.env.MAX_DELIVERY_DISTANCE_KM || 25);
const MIN_DELIVERY_CHARGE = parseFloat(process.env.MIN_DELIVERY_CHARGE || 0);
const DELIVERY_ESTIMATE_DAYS = parseInt(process.env.DELIVERY_ESTIMATE_DAYS || 7);

/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const toRadian = angle => (Math.PI / 180) * angle;
  const distance = (a, b) => (Math.PI / 180) * (a - b);

  const RADIUS_OF_EARTH_IN_KM = 6371;

  const dLat = distance(lat2, lat1);
  const dLon = distance(lon2, lon1);

  lat1 = toRadian(lat1);
  lat2 = toRadian(lat2);

  const a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.asin(Math.sqrt(a));

  return RADIUS_OF_EARTH_IN_KM * c;
}

const deliveryService = {
  calculateDistanceToShop: (customerLat, customerLon) => {
    if (!customerLat || !customerLon) return null;
    return parseFloat(calculateHaversineDistance(SHOP_LATITUDE, SHOP_LONGITUDE, customerLat, customerLon).toFixed(2));
  },

  calculateDeliveryCharge: (distanceKm) => {
    if (distanceKm === null) return 0; // Fallback or strict error depending on business logic
    let charge = distanceKm * DELIVERY_CHARGE_PER_KM;
    charge = Math.max(charge, MIN_DELIVERY_CHARGE);
    return Math.round(charge); // Round to nearest Rupee
  },

  validateDeliveryEligibility: (distanceKm) => {
    if (distanceKm === null) {
      return { eligible: false, message: "Invalid delivery coordinates." };
    }
    if (distanceKm > MAX_DELIVERY_DISTANCE_KM) {
      return { 
        eligible: false, 
        message: `Delivery is currently unavailable at your location. Our delivery area is limited to ${MAX_DELIVERY_DISTANCE_KM} km from our store.` 
      };
    }
    return { eligible: true, message: "Eligible for delivery." };
  },
  
  getEstimatedDeliveryDate: () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + DELIVERY_ESTIMATE_DAYS);
    return deliveryDate;
  }
};

module.exports = deliveryService;
