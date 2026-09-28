import React from "react";
import { PROFILES } from "../../constants/appConstants";
import { aqiLabel } from "../../utils/formatters";

export default function JourneyInsightSection({ routes, recommendedId, profileId, appliedProfileName }) {
  const rec = routes.find((r) => r.route_id === recommendedId);
  if (!rec) return null;

  const aqi = rec.aqi || {};
  const others = routes.filter((r) => r.route_id !== recommendedId);
  const profileEntry = PROFILES.find((p) => p.id === profileId);
  const profileName = appliedProfileName || profileEntry?.name || "General";
  const profileIcon = profileEntry?.icon || "🌿";

  const maxAqiSaving = Math.round(
    Math.max(0, ...others.map((r) => (r.aqi?.average_aqi || 0) - (aqi.average_aqi || 0)))
  );
  const isFastest = others.every(
    (r) => (r.duration_in_traffic_minutes || 0) >= (rec.duration_in_traffic_minutes || 0)
  );

  const points = [];
  if (aqi.average_aqi != null) {
    points.push(
      `Average AQI of ${Math.round(aqi.average_aqi)} (${aqi.aqi_category || aqiLabel(aqi.average_aqi)}) provides the lowest cumulative pollutant exposure.`
    );
  }
  if (maxAqiSaving > 0) {
    points.push(`Saves up to ${maxAqiSaving} AQI points compared to higher-pollution alternative routes.`);
  }
  if (rec.traffic_level) {
    points.push(`Traffic flow is rated ${rec.traffic_level.toLowerCase()} for predictable transit time.`);
  }
  if (isFastest && rec.duration_in_traffic_minutes) {
    points.push(`Also matches or beats the fastest alternative travel time (${Math.round(rec.duration_in_traffic_minutes)} mins).`);
  }
  points.push(`Customized for "${profileName}" ${profileIcon} — weighting algorithm actively minimizes severe pollutant exposure.`);

  return (
    <div className="rounded-3xl border border-[#bfe1ce] bg-gradient-to-br from-[#eff8f3] via-[#f7fcf8] to-[#ffffff] p-5 sm:p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="w-8 h-8 rounded-full bg-[#168b62] text-white flex items-center justify-center font-bold text-sm shadow-sm">
          ⭐
        </span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Journey Intelligence</p>
          <h3 className="font-display text-base font-bold text-[#17352b]">Why this route was recommended</h3>
        </div>
      </div>

      <div className="space-y-2.5 mt-3">
        {points.map((pt, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xs font-semibold text-[#29483c] leading-relaxed">
            <span className="text-[#168b62] font-bold text-sm shrink-0">›</span>
            <span>{pt}</span>
          </div>
        ))}
      </div>

      {rec.recommendation_reason && (
        <div className="mt-4 rounded-2xl bg-white/90 border border-[#cbe4d6] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#168b62] mb-1">Backend Optimizer Reasoning</p>
          <p className="text-xs font-semibold text-[#315447] leading-relaxed">{rec.recommendation_reason}</p>
        </div>
      )}
    </div>
  );
}
