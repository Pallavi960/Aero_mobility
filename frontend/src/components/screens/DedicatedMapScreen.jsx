import React, { useState, useEffect } from "react";
import InteractiveMap from "../map/InteractiveMap";
import { API } from "../../constants/appConstants";

export default function DedicatedMapScreen({ mapsLoaded }) {
  const [stations, setStations] = useState([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Source (A) and Destination (B) selection
  const [sourceStation, setSourceStation] = useState(null);
  const [destStation, setDestStation] = useState(null);
  const [activeSelectMode, setActiveSelectMode] = useState("source"); // "source" | "destination"

  // Route state
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");

  // Fetch all stations on mount
  useEffect(() => {
    setLoadingStations(true);
    fetch(`${API}/api/aqi/stations?limit=50`)
      .then((r) => r.json())
      .then((d) => {
        const stationList = d.stations || [];
        setStations(stationList);
        // Pre-select default source & destination if available
        if (stationList.length >= 2) {
          setSourceStation(stationList[0]);
          setDestStation(stationList[1]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingStations(false));
  }, []);

  // Fetch routes whenever source & destination change
  useEffect(() => {
    if (!sourceStation?.latitude || !destStation?.latitude) {
      setRoutes([]);
      setSelectedRouteId(null);
      setRouteError("");
      return;
    }

    if (sourceStation.station_id === destStation.station_id) {
      setRoutes([]);
      setSelectedRouteId(null);
      setRouteError("Source and destination must be different stations.");
      return;
    }

    let isMounted = true;
    setLoadingRoutes(true);
    setRouteError("");

    const q = new URLSearchParams({
      origin_lat: sourceStation.latitude,
      origin_lng: sourceStation.longitude,
      destination_lat: destStation.latitude,
      destination_lng: destStation.longitude,
      health_profile: "general",
      origin_name: sourceStation.station_name || "Source",
      destination_name: destStation.station_name || "Destination",
    });

    fetch(`${API}/api/routes/find?${q}`)
      .then((r) => r.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
          setSelectedRouteId(data.recommended_route_id || data.routes[0]?.route_id);
        } else {
          setRoutes([]);
          setRouteError(data.error || "No route alternatives found for this path.");
        }
      })
      .catch(() => {
        if (isMounted) setRouteError("Failed to calculate traffic routes.");
      })
      .finally(() => {
        if (isMounted) setLoadingRoutes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [sourceStation, destStation]);

  // Handle station chip click
  const handleStationClick = (station) => {
    if (activeSelectMode === "source") {
      setSourceStation(station);
      // Auto-switch to destination mode if destination is not yet selected or is the same
      if (!destStation || destStation.station_id === station.station_id) {
        setActiveSelectMode("destination");
      }
    } else {
      setDestStation(station);
      // Auto-switch to source mode if source is not set
      if (!sourceStation) {
        setActiveSelectMode("source");
      }
    }
  };

  // Swap Source & Destination
  const handleSwap = () => {
    const temp = sourceStation;
    setSourceStation(destStation);
    setDestStation(temp);
  };

  // Filter stations based on search query
  const filteredStations = stations.filter((s) =>
    (s.station_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#168b62]/10 border border-[#168b62]/20 text-[#168b62] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <span>🚦</span> Real-time Traffic Navigation
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#17352b]">
            Traffic Route Explorer
          </h2>
          <p className="text-xs sm:text-sm text-[#789087] mt-0.5">
            Select any Source (A) and Destination (B) station to view available paths with live traffic flow & delay metrics.
          </p>
        </div>

        {/* Quick Reset */}
        {(sourceStation || destStation) && (
          <button
            type="button"
            onClick={() => {
              setSourceStation(null);
              setDestStation(null);
              setActiveSelectMode("source");
            }}
            className="self-start md:self-center px-3.5 py-1.5 rounded-xl border border-[#dbe7df] bg-white text-xs font-semibold text-[#52796f] hover:bg-[#f0f4f1] transition shadow-sm"
          >
            Clear Selection ↺
          </button>
        )}
      </div>

      {/* ── SOURCE & DESTINATION PICKER BAR ── */}
      <div className="bg-white rounded-3xl border border-[#cbe4d5] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] items-center gap-3">
          {/* SOURCE (A) BOX */}
          <div
            onClick={() => setActiveSelectMode("source")}
            className={`cursor-pointer rounded-2xl p-3.5 border-2 transition relative flex items-center gap-3 ${
              activeSelectMode === "source"
                ? "border-[#168b62] bg-[#f2f9f5] shadow-sm"
                : "border-[#e0ebe4] bg-[#fbfdfc] hover:border-[#b8d6c4]"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#168b62] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              A
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#168b62]">
                  Source Station (Origin)
                </span>
                {activeSelectMode === "source" && (
                  <span className="text-[10px] font-bold text-[#168b62] bg-[#e1f5eb] px-2 py-0.5 rounded-full">
                    Selecting Now
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-[#17352b] truncate mt-0.5">
                {sourceStation?.station_name || "Click a station below to select Source"}
              </p>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <button
            type="button"
            onClick={handleSwap}
            disabled={!sourceStation || !destStation}
            title="Swap Source and Destination"
            className="w-10 h-10 mx-auto rounded-full bg-[#f4f7f2] border border-[#cbdcd2] text-[#315447] hover:bg-[#168b62] hover:text-white transition flex items-center justify-center font-bold text-base shadow-sm disabled:opacity-40 disabled:pointer-events-none"
          >
            ⇄
          </button>

          {/* DESTINATION (B) BOX */}
          <div
            onClick={() => setActiveSelectMode("destination")}
            className={`cursor-pointer rounded-2xl p-3.5 border-2 transition relative flex items-center gap-3 ${
              activeSelectMode === "destination"
                ? "border-[#e11d48] bg-[#fff5f7] shadow-sm"
                : "border-[#e0ebe4] bg-[#fbfdfc] hover:border-[#f4c2cc]"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-[#e11d48] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
              B
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#e11d48]">
                  Destination Station
                </span>
                {activeSelectMode === "destination" && (
                  <span className="text-[10px] font-bold text-[#e11d48] bg-[#ffe4e9] px-2 py-0.5 rounded-full">
                    Selecting Now
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-[#17352b] truncate mt-0.5">
                {destStation?.station_name || "Click a station below to select Destination"}
              </p>
            </div>
          </div>
        </div>

        {/* ── STATION SEARCH AND SELECTION CHIPS ── */}
        <div className="pt-2 border-t border-[#eaf1ec] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#789087]">
                Available Stations ({stations.length})
              </p>
              <span className="text-[11px] text-[#52796f] bg-[#eef5f1] px-2 py-0.5 rounded-md font-medium">
                Clicking assigns to {activeSelectMode === "source" ? "Source (A)" : "Destination (B)"}
              </span>
            </div>

            {/* Station Search Input */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search station name…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-[#dbe7df] bg-[#fbfdfc] focus:outline-none focus:border-[#168b62] text-[#17352b]"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#789087]">
                🔍
              </span>
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#789087] hover:text-[#17352b]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Station Chips */}
          {loadingStations ? (
            <div className="flex items-center gap-2 py-3 text-xs text-[#789087]">
              <span className="animate-spin text-sm">⏳</span> Loading stations…
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto pr-1">
              {filteredStations.map((s) => {
                const isSource = sourceStation?.station_id === s.station_id;
                const isDest = destStation?.station_id === s.station_id;

                let chipStyle = "bg-white text-[#315447] border-[#dbe7df] hover:border-[#168b62] hover:bg-[#f7faf8]";
                if (isSource) {
                  chipStyle = "bg-[#168b62] text-white border-[#168b62] shadow-sm";
                } else if (isDest) {
                  chipStyle = "bg-[#e11d48] text-white border-[#e11d48] shadow-sm";
                }

                return (
                  <button
                    key={s.station_id}
                    type="button"
                    onClick={() => handleStationClick(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${chipStyle}`}
                  >
                    {isSource && (
                      <span className="w-4 h-4 rounded-full bg-white text-[#168b62] font-black text-[10px] flex items-center justify-center">
                        A
                      </span>
                    )}
                    {isDest && (
                      <span className="w-4 h-4 rounded-full bg-white text-[#e11d48] font-black text-[10px] flex items-center justify-center">
                        B
                      </span>
                    )}
                    {!isSource && !isDest && <span>📍</span>}
                    <span>{s.station_name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── ROUTE STATUS BANNER / LOADER / ERROR ── */}
      {loadingRoutes && (
        <div className="p-4 rounded-2xl bg-[#eaf6ef] border border-[#bce3cb] flex items-center gap-3 text-sm font-bold text-[#168b62] animate-pulse">
          <span className="text-xl animate-spin">🔄</span>
          <span>Computing traffic-aware route paths between {sourceStation?.station_name} and {destStation?.station_name}…</span>
        </div>
      )}

      {routeError && !loadingRoutes && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{routeError}</span>
        </div>
      )}

      {/* ── MAP CONTAINER (TRAFFIC COLOR CODED) ── */}
      <div className="h-[520px] w-full rounded-3xl overflow-hidden border border-[#dbe7df] shadow-sm relative">
        <InteractiveMap
          routes={routes}
          recommendedId={routes[0]?.route_id}
          selectedId={selectedRouteId}
          onSelectRoute={(id) => setSelectedRouteId(id)}
          origin={sourceStation || { latitude: 28.6139, longitude: 77.209, name: "Delhi Center" }}
          destination={destStation}
          mapsLoaded={mapsLoaded}
          colorByTraffic={true}
          hideAqi={true}
        />
      </div>

      {/* ── ROUTE CARDS: PURELY TRAFFIC & PATH STATS (NO AQI) ── */}
      {routes.length > 0 && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#17352b] flex items-center gap-2">
              <span>🚗</span> Available Route Options ({routes.length})
            </h3>
            <span className="text-xs text-[#789087]">Click any card to highlight path on map</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {routes.map((route, idx) => {
              const isSelected = route.route_id === (selectedRouteId || routes[0]?.route_id);
              const trafficLevel = (route.traffic_level || "Normal").toLowerCase();
              const isHeavy = trafficLevel === "heavy" || (route.traffic_delay_minutes >= 8);
              const isModerate = trafficLevel === "moderate" || (route.traffic_delay_minutes >= 2 && route.traffic_delay_minutes < 8);

              let badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200";
              let badgeText = "🟢 Low Traffic (Fast Flow)";
              let borderAccent = "border-emerald-500";

              if (isHeavy) {
                badgeBg = "bg-rose-50 text-rose-700 border-rose-200";
                badgeText = "🔴 Heavy Congestion";
                borderAccent = "border-rose-500";
              } else if (isModerate) {
                badgeBg = "bg-amber-50 text-amber-700 border-amber-200";
                badgeText = "🟡 Moderate Delay";
                borderAccent = "border-amber-500";
              }

              return (
                <div
                  key={route.route_id || idx}
                  onClick={() => setSelectedRouteId(route.route_id)}
                  className={`cursor-pointer rounded-3xl p-5 border-2 transition-all shadow-sm relative flex flex-col justify-between ${
                    isSelected
                      ? `bg-white ${borderAccent} ring-2 ring-[#168b62]/20 shadow-md scale-[1.01]`
                      : "bg-white border-[#dbe7df] hover:border-[#b8d6c4] hover:shadow"
                  }`}
                >
                  <div>
                    {/* Top Row: Route Name & Selection Indicator */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#168b62]">
                        Option {idx + 1}: {route.route_type || `Route ${idx + 1}`}
                      </span>
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#168b62] text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    {/* Main Metrics: Duration & Distance */}
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-extrabold text-[#17352b]">
                        {route.duration_minutes || "--"}
                      </span>
                      <span className="text-sm font-semibold text-[#789087]">min</span>
                      <span className="text-[#cbdcd2] mx-1">•</span>
                      <span className="text-base font-bold text-[#315447]">
                        {route.distance_km || "--"} km
                      </span>
                    </div>

                    {/* Traffic Status Badge */}
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${badgeBg} mb-4`}>
                      {badgeText}
                    </div>

                    {/* Traffic Comparison Details */}
                    <div className="space-y-1.5 text-xs text-[#52796f] bg-[#f8faf9] p-3 rounded-2xl border border-[#e5eee8]">
                      <div className="flex justify-between">
                        <span>Expected Traffic Delay:</span>
                        <span className={`font-bold ${route.traffic_delay_minutes > 0 ? "text-amber-600" : "text-emerald-600"}`}>
                          {route.traffic_delay_minutes ? `+${route.traffic_delay_minutes} min` : "0 min delay"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Standard Free-flow Time:</span>
                        <span className="font-semibold text-[#17352b]">
                          {route.static_duration_minutes || route.duration_minutes || "--"} min
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRouteId(route.route_id);
                    }}
                    className={`mt-4 w-full py-2 rounded-xl text-xs font-bold transition text-center ${
                      isSelected
                        ? "bg-[#168b62] text-white"
                        : "bg-[#eef5f1] text-[#168b62] hover:bg-[#d8ecdf]"
                    }`}
                  >
                    {isSelected ? "✓ Active on Map" : "View on Map"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
