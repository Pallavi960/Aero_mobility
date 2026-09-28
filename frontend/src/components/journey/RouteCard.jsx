import React from "react";
import { fmt, aqiColor, aqiLabel } from "../../utils/formatters";

export default function RouteCard({ route, recommended, selected, onSelect }) {
  const aqi = route.aqi || {};
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl border p-4 transition duration-200 text-left relative ${
        selected
          ? "border-[#168b62] bg-white ring-2 ring-[#168b62]/20 shadow-md"
          : recommended
          ? "border-[#a7d7c5] bg-[#f9fdfa] hover:border-[#168b62] hover:shadow-sm"
          : "border-[#e0ebe4] bg-white hover:border-[#cbdcd2] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            {recommended ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e6f6ee] text-[#168b62] border border-[#b9e6cf]">
                ⭐ RECOMMENDED
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">
                Route Option
              </span>
            )}
          </div>
          <h3 className="font-display text-base font-bold text-[#17352b] mt-1">
            {route.route_id || "Route Option"}
          </h3>
        </div>
        <div className={`rounded-xl px-2.5 py-1.5 text-right shrink-0 ${selected ? "bg-[#168b62] text-white" : "bg-[#edf6f1] text-[#168b62]"}`}>
          <p className={`text-[9px] font-bold uppercase tracking-wide ${selected ? "text-white/80" : "text-[#789087]"}`}>Exposure Score</p>
          <p className="font-display text-lg font-bold leading-tight">{fmt(route.score)}</p>
        </div>
      </div>

      <p className="text-xs font-bold text-[#445b51] mb-3">
        {fmt(route.duration_in_traffic_minutes, " min")} · {fmt(route.distance_km, " km")}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
        <div className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 border border-[#e8efe9]">
          <p className="text-[9px] font-bold uppercase text-[#789087]">AQI Score</p>
          <p className="font-bold text-[#315447]">{fmt(route.score_details?.aqi_score)}</p>
        </div>
        <div className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 border border-[#e8efe9]">
          <p className="text-[9px] font-bold uppercase text-[#789087]">Avg AQI</p>
          <p className="font-bold" style={{ color: aqiColor(aqi.average_aqi) }}>
            {fmt(aqi.average_aqi)}
          </p>
        </div>
        <div className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 border border-[#e8efe9]">
          <p className="text-[9px] font-bold uppercase text-[#789087]">Peak AQI</p>
          <p className="font-bold" style={{ color: aqiColor(aqi.maximum_aqi) }}>
            {fmt(aqi.maximum_aqi)}
          </p>
        </div>
        <div className="rounded-lg bg-[#f4f7f4] px-2.5 py-1.5 border border-[#e8efe9]">
          <p className="text-[9px] font-bold uppercase text-[#789087]">Category</p>
          <p className="font-bold text-[#315447] truncate">{aqi.aqi_category || aqiLabel(aqi.average_aqi)}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#f0f4f1]">
        <span className="text-[11px] font-semibold text-[#168b62]">
          {selected ? "✓ Active on Map" : "Click to view on map"}
        </span>
        <button
          type="button"
          className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
            selected
              ? "bg-[#168b62] text-white"
              : "bg-[#edf5f0] text-[#168b62] hover:bg-[#d8ecdf]"
          }`}
        >
          {selected ? "Selected" : "Select route"}
        </button>
      </div>
    </div>
  );
}
