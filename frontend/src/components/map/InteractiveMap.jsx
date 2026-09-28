import React, { useEffect, useRef, useState } from "react";
import { DEFAULT_CENTER } from "../../constants/appConstants";
import { decodePolyline } from "../../utils/mapUtils";
import { aqiColor } from "../../utils/formatters";

export default function InteractiveMap({
  routes = [],
  recommendedId,
  selectedId,
  onSelectRoute,
  origin,
  destination,
  mapsLoaded,
  colorByTraffic = false,
  hideAqi = false,
}) {
  const mapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const trafficLayerRef = useRef(null);
  const [showLiveTraffic, setShowLiveTraffic] = useState(true);

  const activeSelectedId = selectedId || (colorByTraffic ? routes?.[0]?.route_id : null);
  const selectedRoute = activeSelectedId
    ? routes?.find((r) => r.route_id === activeSelectedId) || null
    : null;

  // Initialize map once
  useEffect(() => {
    if (!mapsLoaded || !window.google?.maps || !mapRef.current) return;

    if (!googleMapInstance.current) {
      googleMapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: origin?.latitude
          ? { lat: Number(origin.latitude), lng: Number(origin.longitude) }
          : DEFAULT_CENTER,
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
          { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
        ],
      });

      trafficLayerRef.current = new window.google.maps.TrafficLayer();
      if (showLiveTraffic) {
        trafficLayerRef.current.setMap(googleMapInstance.current);
      }
    }
  }, [mapsLoaded]);

  // Keep Google Maps aligned with its container as responsive layouts resize.
  useEffect(() => {
    const element = mapRef.current;
    const map = googleMapInstance.current;
    if (!element || !map || !window.google?.maps?.event || !window.ResizeObserver) return;
    const observer = new ResizeObserver(() => {
      const center = map.getCenter();
      window.google.maps.event.trigger(map, "resize");
      if (center) map.setCenter(center);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [mapsLoaded]);

  // Toggle Live Traffic Layer
  useEffect(() => {
    if (!googleMapInstance.current || !window.google?.maps) return;
    if (!trafficLayerRef.current) {
      trafficLayerRef.current = new window.google.maps.TrafficLayer();
    }
    if (showLiveTraffic) {
      trafficLayerRef.current.setMap(googleMapInstance.current);
    } else {
      trafficLayerRef.current.setMap(null);
    }
  }, [showLiveTraffic, mapsLoaded]);

  // Helper for route coloring
  const getRouteColor = (route) => {
    if (colorByTraffic) {
      const level = (route.traffic_level || "").toLowerCase();
      const delay = Number(route.traffic_delay_minutes || 0);
      if (level === "heavy" || delay >= 8) {
        return "#ef4444"; // Red for heavy traffic
      } else if (level === "moderate" || delay >= 2) {
        return "#f59e0b"; // Orange/Amber for moderate traffic
      } else {
        return "#10b981"; // Green for low traffic
      }
    }

    // Home Screen: use the existing AQI category thresholds for route colors.
    const avgAqi = route?.aqi?.average_aqi;
    if (avgAqi !== undefined && avgAqi !== null && Number.isFinite(Number(avgAqi))) {
      return aqiColor(Number(avgAqi));
    }
    return "#789087";
  };

  // Update markers & polylines
  useEffect(() => {
    if (!mapsLoaded || !window.google?.maps || !googleMapInstance.current) return;

    const map = googleMapInstance.current;

    // Clear existing markers & polylines
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];

    const bounds = new window.google.maps.LatLngBounds();

    // Origin Marker (A)
    if (origin?.latitude && origin?.longitude) {
      const originPos = { lat: Number(origin.latitude), lng: Number(origin.longitude) };
      const originMarker = new window.google.maps.Marker({
        position: originPos,
        map,
        title: `Origin: ${origin.station_name || origin.name || "Origin"}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#168b62",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
        label: { text: "A", color: "#ffffff", fontWeight: "bold", fontSize: "11px" },
      });
      markersRef.current.push(originMarker);
      bounds.extend(originPos);
    }

    // Destination Marker (B)
    if (destination?.latitude && destination?.longitude) {
      const destPos = { lat: Number(destination.latitude), lng: Number(destination.longitude) };
      const destMarker = new window.google.maps.Marker({
        position: destPos,
        map,
        title: `Destination: ${destination.station_name || destination.name || "Destination"}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#e11d48",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2.5,
        },
        label: { text: "B", color: "#ffffff", fontWeight: "bold", fontSize: "11px" },
      });
      markersRef.current.push(destMarker);
      bounds.extend(destPos);
    }

    // Polylines
    if (routes && routes.length > 0) {
      routes.forEach((route) => {
        // On Home page (non-traffic mode), render ONLY the selected route's path
        if (!colorByTraffic && activeSelectedId && route.route_id !== activeSelectedId) {
          return;
        }

        let path = [];
        const polylineStr = route.polyline || route.overview_polyline;
        if (polylineStr) {
          path = decodePolyline(polylineStr);
        } else if (route.route_points && route.route_points.length > 0) {
          path = route.route_points.map((pt) => ({
            lat: Number(pt.latitude ?? pt.lat),
            lng: Number(pt.longitude ?? pt.lng),
          }));
        }

        if (!path.length) return;

        path.forEach((pt) => bounds.extend(pt));

        const isSelected = activeSelectedId && route.route_id === activeSelectedId;
        const strokeColor = getRouteColor(route);
        const strokeWeight = colorByTraffic ? (isSelected ? 7 : 4) : 6;
        const strokeOpacity = colorByTraffic ? (isSelected ? 1.0 : 0.65) : 0.95;
        const zIndex = isSelected ? 20 : 5;

        const polyline = new window.google.maps.Polyline({
          path,
          geodesic: true,
          strokeColor,
          strokeOpacity,
          strokeWeight,
          zIndex,
          map,
        });

        polyline.addListener("click", () => {
          if (onSelectRoute) onSelectRoute(route.route_id);
        });

        polylinesRef.current.push(polyline);
      });

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      }
    } else if (origin?.latitude && destination?.latitude && !bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else if (origin?.latitude) {
      map.setCenter({ lat: Number(origin.latitude), lng: Number(origin.longitude) });
      map.setZoom(12);
    }
  }, [mapsLoaded, routes, activeSelectedId, recommendedId, origin, destination, colorByTraffic]);

  return (
    <div className="relative w-full h-full min-h-[380px] lg:min-h-[480px] rounded-3xl overflow-hidden bg-[#eaf1ec] border border-[#dbe7df] shadow-sm">
      {!mapsLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-[#f4f7f2] text-center z-10">
          <span className="text-3xl mb-2">🗺️</span>
          <p className="text-sm font-bold text-[#315447]">Loading Google Maps…</p>
          <p className="text-xs text-[#789087] mt-1">Connecting to Google Maps services</p>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full min-h-[380px] lg:min-h-[480px]" />

      {/* ── TOP CONTROLS: LIVE TRAFFIC TOGGLE (ONLY IN TRAFFIC MAP MODE) ── */}
      {colorByTraffic && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLiveTraffic(!showLiveTraffic)}
            className={`px-3 py-1.5 rounded-xl border shadow-sm text-xs font-bold transition flex items-center gap-1.5 backdrop-blur-md ${
              showLiveTraffic
                ? "bg-[#17352b]/90 text-white border-[#17352b]"
                : "bg-white/90 text-[#315447] border-[#cbdcd2] hover:bg-white"
            }`}
            title="Toggle Google Maps Real-time Traffic Layer"
          >
            <span>🚦</span>
            <span>Live Traffic Layer: {showLiveTraffic ? "ON" : "OFF"}</span>
          </button>
        </div>
      )}

      {/* ── BOTTOM LEGEND ── */}
      {routes && routes.length > 0 && (
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-[#cbdcd2] shadow-md text-[11px] font-semibold text-[#315447] flex flex-wrap items-center gap-3.5 z-10">
          {colorByTraffic ? (
            <>
              <span className="text-[10px] uppercase font-bold text-[#789087]">Traffic Flow:</span>
              <span className="flex items-center gap-1.5 text-[#10b981]">
                <span className="w-3 h-2 bg-[#10b981] rounded-full inline-block"></span>
                Low Delay
              </span>
              <span className="flex items-center gap-1.5 text-[#f59e0b]">
                <span className="w-3 h-2 bg-[#f59e0b] rounded-full inline-block"></span>
                Moderate
              </span>
              <span className="flex items-center gap-1.5 text-[#ef4444]">
                <span className="w-3 h-2 bg-[#ef4444] rounded-full inline-block"></span>
                Heavy Congestion
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase font-bold text-[#789087]">Path AQI Exposure:</span>
              <span className="flex items-center gap-1.5 text-[#168b62]">
                <span className="w-3 h-2 bg-[#168b62] rounded-full inline-block"></span>
                Good (≤50)
              </span>
              <span className="flex items-center gap-1.5 text-[#f59e0b]">
                <span className="w-3 h-2 bg-[#f59e0b] rounded-full inline-block"></span>
                Moderate (51-150)
              </span>
              <span className="flex items-center gap-1.5 text-[#ef4444]">
                <span className="w-3 h-2 bg-[#ef4444] rounded-full inline-block"></span>
                Unhealthy (151+)
              </span>
              {selectedRoute && (
                <span className="pl-2 border-l border-[#cbdcd2] font-bold text-[#17352b]">
                  Active: {selectedRoute.route_type || selectedRoute.route_id}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* ── ROUTE DETAILS OVERLAY ── */}
      {selectedRoute && (
        colorByTraffic ? (
          /* Traffic Map Screen Overlay */
          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#cbdcd2] shadow-md max-w-xs z-10 text-xs text-[#315447] animate-fadeIn">
            <div className="flex items-center justify-between gap-2 border-b border-[#e2ece6] pb-2 mb-2">
              <span className="font-bold text-sm text-[#17352b] truncate">
                {selectedRoute.route_type || selectedRoute.route_id}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  (selectedRoute.traffic_level || "").toLowerCase() === "heavy"
                    ? "bg-rose-100 text-rose-700"
                    : (selectedRoute.traffic_level || "").toLowerCase() === "moderate"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                🚦 {selectedRoute.traffic_level || "Normal"} Traffic
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-[#789087] block">Distance:</span>
                <span className="font-bold text-[#17352b]">{selectedRoute.distance_km || "--"} km</span>
              </div>
              <div>
                <span className="text-[#789087] block">Duration:</span>
                <span className="font-bold text-[#17352b]">{selectedRoute.duration_minutes || "--"} min</span>
              </div>
              <div>
                <span className="text-[#789087] block">Traffic Delay:</span>
                <span className="font-bold text-[#d97706]">
                  {selectedRoute.traffic_delay_minutes ? `+${selectedRoute.traffic_delay_minutes} min` : "0 min"}
                </span>
              </div>
              <div>
                <span className="text-[#789087] block">Free-Flow Time:</span>
                <span className="font-bold text-[#17352b]">
                  {selectedRoute.static_duration_minutes || selectedRoute.duration_minutes || "--"} min
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Home Screen Route AQI Overlay */
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl border border-[#cbdcd2] shadow-sm max-w-xs z-10 text-sm text-[#315447]">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#168b62]">
                {selectedRoute.route_type || selectedRoute.route_id}
              </h4>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: getRouteColor(selectedRoute) }}
              >
                AQI: {selectedRoute.aqi?.average_aqi ? Math.round(selectedRoute.aqi.average_aqi) : "--"}
              </span>
            </div>
          </div>
        )
      )}
    </div>
  );
}
