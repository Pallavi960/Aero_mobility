// Decode Google polyline strings into coordinate objects [{ lat, lng }]
export function decodePolyline(encoded = "") {
  if (!encoded) return [];
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return points;
}

/**
 * Map /api/aqi/nearest payloads onto a station the planner can use.
 * The backend returns `station`; older clients looked for `nearest_station`.
 */
export function stationFromNearestAqiResponse(data) {
  if (!data || data.success === false) return null;
  const station = data.station || data.nearest_station;
  if (!station || station.latitude == null || station.longitude == null) return null;
  return {
    station_id: station.station_id,
    station_name: station.station_name,
    city: station.city,
    state: station.state,
    latitude: station.latitude,
    longitude: station.longitude,
    distance_km: station.distance_km,
  };
}
