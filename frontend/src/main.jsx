import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import JourneyDashboard from "./JourneyDashboard";

const API_BASE = "http://127.0.0.1:5000";
const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };

function loadGoogleMaps(apiKey) {
  if (!apiKey) return Promise.reject(new Error("Add VITE_GOOGLE_MAPS_API_KEY to your .env file to display the map."));
  if (window.google?.maps?.importLibrary) return Promise.resolve(window.google.maps);
  if (window.__googleMapsPromise) return window.__googleMapsPromise;
  window.__googleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.maps?.Map) resolve(window.google.maps);
      else reject(new Error("Google Maps loaded without the Maps JavaScript API. Enable that API for this key in Google Cloud."));
    };
    script.onerror = () => reject(new Error("Google Maps could not be loaded. Check the API key, billing, and allowed localhost referrer."));
    document.head.appendChild(script);
  });
  return window.__googleMapsPromise;
}

function decodePolyline(encoded) {
  const points = [];
  let index = 0, latitude = 0, longitude = 0;
  while (index < encoded.length) {
    let result = 0, shift = 0, byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
    latitude += result & 1 ? ~(result >> 1) : result >> 1;
    result = 0; shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
    longitude += result & 1 ? ~(result >> 1) : result >> 1;
    points.push({ lat: latitude / 1e5, lng: longitude / 1e5 });
  }
  return points;
}

function formatNumber(value, suffix = "") {
  return value === null || value === undefined || value === "" ? "—" : `${value}${suffix}`;
}

function StationSearch({ label, value, onChange, onSelect }) {
  const [stations, setStations] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      try {
        const params = new URLSearchParams({ query: value, limit: "8" });
        const response = await fetch(`${API_BASE}/api/aqi/stations?${params}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Station search is unavailable.");
        const payload = await response.json();
        setStations(payload.success ? payload.stations || [] : []);
        setActiveIndex(-1);
      } catch (reason) {
        if (reason.name !== "AbortError") {
          setStations([]);
          setSearchError("Cannot reach station search. Start the Flask backend on port 5000.");
        }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [open, value]);

  function choose(station) {
    onSelect({
      displayName: station.station_name,
      formattedAddress: `${station.station_name}, ${station.city}, ${station.state}`,
      lat: station.latitude,
      lng: station.longitude,
    });
    setOpen(false);
  }

  function handleKeyDown(event) {
    if (event.key === "ArrowDown") { event.preventDefault(); setOpen(true); setActiveIndex((index) => Math.min(index + 1, stations.length - 1)); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActiveIndex((index) => Math.max(index - 1, 0)); }
    else if (event.key === "Enter" && open && activeIndex >= 0) { event.preventDefault(); choose(stations[activeIndex]); }
    else if (event.key === "Escape") setOpen(false);
  }

  return <div className="station-search">
    <input aria-label={label} aria-autocomplete="list" aria-expanded={open} role="combobox" className="w-full rounded-xl border border-[#cfddd5] bg-[#fbfdfb] px-3.5 py-3 text-sm outline-none transition focus:border-[#168b62] focus:ring-4 focus:ring-[#168b62]/10" value={value} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} onChange={(event) => { onChange(event.target.value); setOpen(true); }} onKeyDown={handleKeyDown} placeholder={`Search ${label} station`} />
    {open && <div className="station-menu" role="listbox">
      {loading && <p className="station-menu-status">Searching stations…</p>}
      {!loading && searchError && <p className="station-menu-status">{searchError}</p>}
      {!loading && !searchError && !stations.length && <p className="station-menu-status">No matching monitoring stations. Try Delhi or a Delhi station name.</p>}
      {!loading && stations.map((station, index) => <button key={station.station_id} type="button" role="option" aria-selected={index === activeIndex} className={`station-option ${index === activeIndex ? "station-option-active" : ""}`} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(station)}><span className="station-option-name">{station.station_name}</span><span className="station-option-location">{station.city}, {station.state}</span></button>)}
    </div>}
  </div>;
}

// Keep the existing planner call sites while replacing Google-only autocomplete
// with station results supplied by the AQI backend.
function PlaceSearch({ label, value, onChange, onSelect }) {
  return <StationSearch label={label.toLowerCase()} value={value} onChange={onChange} onSelect={onSelect} />;
}

function App() {
  const mapElement = useRef(null);
  const mapRef = useRef(null);
  const polylinesRef = useRef([]);
  const markersRef = useRef([]);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [recommendedId, setRecommendedId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapsReady, setMapsReady] = useState(false);

  useEffect(() => {
    let active = true;
    loadGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
      .then(async (maps) => {
        if (typeof window.google.maps.importLibrary === "function") await window.google.maps.importLibrary("maps");
        if (!window.google.maps.Map) throw new Error("Google Maps is unavailable. Enable Maps JavaScript API for this key in Google Cloud.");
        if (!active) return;
        mapRef.current = new maps.Map(mapElement.current, { center: DEFAULT_CENTER, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
        setMapsReady(true);
      })
      .catch((reason) => { if (active) setError(reason.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !window.google?.maps) return;
    polylinesRef.current.forEach((line) => line.setMap(null));
    markersRef.current.forEach((marker) => marker.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    [originCoords, destinationCoords].forEach((position, index) => {
      if (!position) return;
      const marker = new window.google.maps.Marker({ position, map: mapRef.current, label: index === 0 ? "A" : "B", title: index === 0 ? "Origin" : "Destination" });
      markersRef.current.push(marker);
      bounds.extend(position);
    });
    routes.forEach((route) => {
      const path = decodePolyline(route.polyline || "");
      if (!path.length) return;
      path.forEach((point) => bounds.extend(point));
      const selected = route.route_id === selectedId;
      const recommended = route.route_id === recommendedId;
      const line = new window.google.maps.Polyline({ path, geodesic: true, map: mapRef.current, strokeColor: recommended ? "#168b62" : selected ? "#2877c7" : "#91a29b", strokeOpacity: recommended || selected ? 0.95 : 0.55, strokeWeight: recommended ? 8 : selected ? 6 : 3, zIndex: recommended ? 4 : selected ? 3 : 1 });
      line.addListener("click", () => setSelectedId(route.route_id));
      polylinesRef.current.push(line);
    });
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 56);
  }, [routes, recommendedId, selectedId, originCoords, destinationCoords]);

  function handlePlace(setValue, setCoords, place, reason) {
    if (!place) { setCoords(null); setError(reason || "Select a place with a valid map location."); return; }
    setValue(place.formattedAddress || place.displayName);
    setCoords({ lat: place.lat, lng: place.lng });
    setError("");
  }

  async function findRoutes(event) {
    event.preventDefault();
    if (!originCoords || !destinationCoords) return;
    setLoading(true); setError(""); setStatus("Analyzing routes...");
    try {
      const params = new URLSearchParams({ origin_lat: originCoords.lat, origin_lng: originCoords.lng, destination_lat: destinationCoords.lat, destination_lng: destinationCoords.lng });
      const response = await fetch(`${API_BASE}/api/routes/find?${params}`);
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "The backend could not find routes.");
      setRoutes(payload.routes || []);
      setRecommendedId(payload.recommended_route_id);
      setSelectedId(payload.recommended_route_id ?? payload.routes?.[0]?.route_id ?? null);
      setStatus(`${payload.routes?.length || 0} live routes found`);
    } catch (reason) { setError(reason.message || "Unable to reach the Flask backend."); setStatus(""); }
    finally { setLoading(false); }
  }

  function useMyLocation() {
    if (!navigator.geolocation) { setError("Location is not supported by this browser."); return; }
    setError(""); setStatus("Locating you...");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const position = { lat: coords.latitude, lng: coords.longitude };
      setOrigin(`${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`);
      setOriginCoords(position);
      setStatus("Current location selected as origin");
    }, () => setError("Location permission was not granted."));
  }

  const selected = routes.find((route) => route.route_id === selectedId);
  return <div className="min-h-screen bg-[#f4f7f2] text-[#17352b]">
    <header className="border-b border-[#dbe7df] bg-[#fbfdf9]/95 px-5 py-4 backdrop-blur md:px-10"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-5"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-[#168b62] text-xl text-white shadow-sm">✦</div><div><div className="font-display text-lg font-bold tracking-tight">AeroMobility</div><div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#71827a]">AQI + smart routes</div></div></div></div></header>
    <main className="mx-auto grid max-w-[1500px] gap-5 p-5 md:p-8 lg:grid-cols-[380px_minmax(0,1fr)]"><aside className="space-y-4"><section className="rounded-2xl border border-[#dbe7df] bg-white p-5 shadow-[0_12px_30px_rgba(31,71,53,0.06)]"><div className="mb-5"><p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-[#168b62]">Commute planner</p><h1 className="font-display text-2xl font-bold leading-tight">Find a cleaner way across the city.</h1></div><form onSubmit={findRoutes} className="space-y-3"><label className="block text-xs font-bold text-[#52685e]">From<PlaceSearch label="From" value={origin} mapsReady={mapsReady} onChange={(value) => { setOrigin(value); setOriginCoords(null); }} onSelect={(place, reason) => handlePlace(setOrigin, setOriginCoords, place, reason)} /></label><label className="block text-xs font-bold text-[#52685e]">To<PlaceSearch label="To" value={destination} mapsReady={mapsReady} onChange={(value) => { setDestination(value); setDestinationCoords(null); }} onSelect={(place, reason) => handlePlace(setDestination, setDestinationCoords, place, reason)} /></label><button type="button" onClick={useMyLocation} className="w-full rounded-xl border border-[#cbdcd2] px-4 py-2.5 text-sm font-bold text-[#267253] transition hover:bg-[#eff8f2]">◎ Use my location</button><button disabled={loading || !originCoords || !destinationCoords} className="w-full rounded-xl bg-[#168b62] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(22,139,98,0.2)] transition hover:bg-[#107451] disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Analyzing routes..." : "Find smart routes →"}</button></form>{status && <p className="mt-3 text-xs font-semibold text-[#168b62]">{status}</p>}{error && <p className="mt-3 rounded-xl bg-[#fff1ef] px-3 py-2.5 text-xs font-semibold leading-relaxed text-[#b64d42]">{error}</p>}</section><section><div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#789087]">Results</p><h2 className="font-display text-xl font-bold">Routes from backend</h2></div><span className="rounded-full bg-[#e3f4eb] px-2.5 py-1 text-xs font-bold text-[#16714f]">{routes.length}</span></div><div className="space-y-3">{routes.map((route) => <RouteCard key={route.route_id} route={route} recommended={route.route_id === recommendedId} selected={route.route_id === selectedId} onClick={() => setSelectedId(route.route_id)} />)}{!routes.length && <div className="rounded-2xl border border-dashed border-[#c7d9ce] bg-white/60 p-7 text-center text-sm text-[#789087]">Select two places to request live routes.</div>}</div></section></aside><section className="relative min-h-[650px] overflow-hidden rounded-2xl border border-[#dbe7df] bg-[#dce9df] shadow-[0_12px_30px_rgba(31,71,53,0.07)]"><div ref={mapElement} className="absolute inset-0" />{!mapsReady && <div className="absolute inset-0 grid place-items-center bg-[#e7f0e8] p-6 text-center"><div className="max-w-sm rounded-2xl border border-white/70 bg-white/90 p-6 shadow-xl"><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-[#e3f4eb] text-2xl text-[#168b62]">⌖</div><h2 className="font-display text-lg font-bold">Map connection needed</h2><p className="mt-2 text-sm leading-relaxed text-[#678077]">Place search remains editable, but Google suggestions require an enabled Maps JavaScript API and Places API key.</p></div></div>}<div className="absolute left-4 top-4 rounded-xl border border-white/80 bg-white/90 px-4 py-3 shadow-lg backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#789087]">Map view</p><p className="font-display text-sm font-bold">Live pollution-aware routes</p></div>{selected && <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-xl border border-white/80 bg-white/95 px-4 py-3 shadow-lg backdrop-blur"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#168b62]">Recommended Route</p><p className="text-sm font-bold">Route {selected.route_id} · {formatNumber(selected.distance_km, " km")} · {formatNumber(selected.duration_in_traffic_minutes, " min")}</p></div><div className="text-right"><p className="text-[10px] font-bold uppercase text-[#789087]">Overall score</p><p className="font-display text-xl font-bold text-[#168b62]">{formatNumber(selected.score)}</p></div></div>}</section></main>
  </div>;
}

function RouteCard({ route, recommended, selected, onClick }) {
  const aqi = route.aqi || {};
  return <button onClick={onClick} className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selected ? "border-[#168b62] shadow-[0_8px_20px_rgba(22,139,98,0.12)]" : "border-[#dbe7df]"}`}><div className="mb-3 flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h3 className="font-display font-bold">Route {route.route_id}</h3>{recommended && <span className="rounded-full bg-[#e3f4eb] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#16714f]">⭐ Recommended Route</span>}</div><p className="mt-1 text-xs font-semibold text-[#789087]">{formatNumber(route.distance_km, " km")} · {formatNumber(route.duration_in_traffic_minutes, " min")}</p></div><div className="rounded-xl bg-[#f0f7f2] px-3 py-2 text-right"><div className="text-[10px] font-bold uppercase text-[#789087]">Score</div><div className="font-display text-xl font-bold text-[#168b62]">{formatNumber(route.score)}</div></div></div><div className="grid grid-cols-2 gap-2 text-xs"><Metric label="Traffic" value={route.traffic_level || "—"} /><Metric label="Delay" value={formatNumber(route.traffic_delay_minutes, " min")} /><Metric label="Average AQI" value={formatNumber(aqi.average_aqi)} /><Metric label="Maximum AQI" value={formatNumber(aqi.maximum_aqi)} /></div><div className="mt-3 flex items-center justify-between border-t border-[#edf2ee] pt-3 text-xs"><span className="font-bold text-[#60776c]">AQI category</span><span className="rounded-full bg-[#fff4d9] px-2.5 py-1 font-bold text-[#9d7118]">{aqi.aqi_category || "Unavailable"}</span></div></button>;
}

function Metric({ label, value }) { return <div className="rounded-lg bg-[#f7faf7] px-2.5 py-2"><div className="text-[10px] font-semibold text-[#8a9b92]">{label}</div><div className="mt-0.5 font-bold text-[#315447]">{value}</div></div>; }

createRoot(document.getElementById("root")).render(<JourneyDashboard />);
