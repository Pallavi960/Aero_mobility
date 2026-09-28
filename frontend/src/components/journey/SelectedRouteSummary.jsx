import React from "react";
import MetricCard from "../common/MetricCard";
import { fmt, aqiColor, aqiLabel } from "../../utils/formatters";

export default function SelectedRouteSummary({ route }) {
  if (!route) return null;
  const aqi = route.aqi || {};

  return (
    <div className="rounded-3xl border border-[#bce0cf] bg-[#f9fcf9] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2 border-b border-[#e1ece4]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Selected Route Summary</p>
          <h4 className="font-display text-lg font-bold text-[#17352b]">{route.route_id}</h4>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#168b62] text-white text-xs font-bold">
          Health Score: {fmt(route.score)}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <MetricCard label="Travel Time" value={fmt(route.duration_in_traffic_minutes)} unit="min" icon="⏱️" />
        <MetricCard label="Distance" value={fmt(route.distance_km)} unit="km" icon="📏" />
        <MetricCard label="Average AQI" value={fmt(aqi.average_aqi)} highlightColor={aqiColor(aqi.average_aqi)} icon="🌿" />
        <MetricCard label="Peak AQI" value={fmt(aqi.maximum_aqi)} highlightColor={aqiColor(aqi.maximum_aqi)} icon="⚠️" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-xl bg-white p-3 border border-[#dbe7df]">
          <span className="text-[10px] font-bold uppercase text-[#789087]">Traffic Conditions</span>
          <p className="font-bold text-[#17352b] mt-0.5">{route.traffic_level || "Standard flow"}</p>
        </div>
        <div className="rounded-xl bg-white p-3 border border-[#dbe7df]">
          <span className="text-[10px] font-bold uppercase text-[#789087]">AQI Exposure Rating</span>
          <p className="font-bold text-[#17352b] mt-0.5">{aqi.aqi_category || aqiLabel(aqi.average_aqi)}</p>
        </div>
        <div className="rounded-xl bg-white p-3 border border-[#dbe7df]">
          <span className="text-[10px] font-bold uppercase text-[#789087]">Waypoints Monitored</span>
          <p className="font-bold text-[#17352b] mt-0.5">
            {aqi.points_evaluated ? `${aqi.points_evaluated} stations/points` : "Continuous"}
          </p>
        </div>
      </div>
    </div>
  );
}
