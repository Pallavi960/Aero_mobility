import React, { useState } from "react";
import { PROFILES } from "../../constants/appConstants";
import { aqiLabel, aqiColor } from "../../utils/formatters";

// Lucide-style SVG Icons (no external icon dependency, no emojis)
function SparklesIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M19 17v4" />
      <path d="M3 5h4" />
      <path d="M17 19h4" />
    </svg>
  );
}

function LeafIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function ClockIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ActivityIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUpIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export default function RecommendationInsight({
  routes = [],
  recommendedId,
  healthProfile = "general",
  appliedProfileName,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const rec = routes.find((r) => r.route_id === recommendedId);
  if (!rec) return null;

  const aqi = rec.aqi || {};
  const others = routes.filter((r) => r.route_id !== recommendedId);

  const profileEntry = PROFILES.find((p) => p.id === healthProfile);
  const profileName = appliedProfileName || profileEntry?.name || "General";

  const avgAqi = aqi.average_aqi != null ? Number(aqi.average_aqi) : null;
  const maxAqi = aqi.maximum_aqi != null ? Number(aqi.maximum_aqi) : null;
  const duration = rec.duration_in_traffic_minutes != null ? Number(rec.duration_in_traffic_minutes) : null;
  const distance = rec.distance_km != null ? Number(rec.distance_km) : null;

  // Comparison metrics against alternative routes
  const isLowestAqi = avgAqi != null && others.length > 0
    ? others.every((o) => (o.aqi?.average_aqi != null ? Number(o.aqi.average_aqi) >= avgAqi : true))
    : false;

  const isFastest = duration != null && others.length > 0
    ? others.every((o) => (o.duration_in_traffic_minutes != null ? Number(o.duration_in_traffic_minutes) >= duration : true))
    : false;

  const aqiSavings = (avgAqi != null && others.length > 0)
    ? Math.round(Math.max(0, ...others.map((o) => (o.aqi?.average_aqi != null ? Number(o.aqi.average_aqi) - avgAqi : 0))))
    : 0;

  // Generate dynamic, data-driven explanation
  const generateExplanation = () => {
    const pKey = (healthProfile || "").toLowerCase();

    if (pKey === "respiratory") {
      if (isLowestAqi && avgAqi != null) {
        return `Recommended because your respiratory-sensitivity profile places the highest priority on clean air. This route minimizes pollutant exposure with a lower predicted AQI of ${Math.round(avgAqi)}${aqiSavings > 0 ? ` (saving up to ${aqiSavings} AQI points vs alternatives)` : ""}.`;
      }
      return `Recommended for your respiratory profile because it provides lower predicted AQI exposure while maintaining a safe and practical transit time.`;
    }

    if (pKey === "cardiovascular") {
      return `Recommended for your cardiovascular profile to reduce environmental stress and high-pollution exposure while maintaining an efficient travel time${duration ? ` of ${Math.round(duration)} min` : ""}.`;
    }

    if (pKey === "elderly") {
      return `Recommended for the elderly profile to ensure a balanced, lower-exposure journey with stable travel conditions.`;
    }

    if (pKey === "child") {
      return `Recommended to protect developing respiratory health with lower predicted AQI exposure${avgAqi ? ` (${Math.round(avgAqi)} AQI)` : ""} while keeping the journey practical.`;
    }

    // Default / General Profile
    if (isFastest && isLowestAqi && avgAqi != null && duration != null) {
      return `Recommended because it is both the cleanest route (AQI ${Math.round(avgAqi)}) and the fastest option (${Math.round(duration)} min) among all evaluated choices.`;
    }

    if (isLowestAqi && avgAqi != null) {
      return `Recommended because it offers the lowest cumulative AQI exposure (${Math.round(avgAqi)}) while keeping travel time within a practical range.`;
    }

    if (isFastest && duration != null) {
      return `Recommended because it provides the shortest travel time (${Math.round(duration)} min) while maintaining an acceptable air quality level.`;
    }

    return `Recommended for your ${profileName} profile because it delivers the optimal balance of lower AQI exposure, travel time, and route conditions.`;
  };

  const aqiCat = aqi.aqi_category || (avgAqi != null ? aqiLabel(avgAqi) : null);
  const color = avgAqi != null ? aqiColor(avgAqi) : "#168b62";

  return (
    <div className="rounded-2xl border border-[#cbe4d5] bg-gradient-to-r from-[#f0f9f4] via-[#f7fcf9] to-[#ffffff] p-4 sm:p-5 shadow-sm transition-all duration-200">
      {/* Header & Title */}
      <div className="flex items-start sm:items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-xl bg-[#168b62] text-white flex items-center justify-center shrink-0 shadow-sm">
            <SparklesIcon className="w-4 h-4 text-white" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-display text-sm sm:text-base font-bold text-[#17352b]">
                Why this route?
              </h4>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e3f4ec] text-[#168b62] border border-[#c3e8d6]">
                Smart Recommendation
              </span>
            </div>
          </div>
        </div>

        {/* View Details Toggle */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#168b62] hover:text-[#0f6848] bg-white px-2.5 py-1 rounded-lg border border-[#cbe4d5] shadow-2xs hover:bg-[#f3faf6] transition-colors cursor-pointer shrink-0"
          aria-expanded={showDetails}
        >
          <span>{showDetails ? "Hide details" : "Why?"}</span>
          {showDetails ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Dynamic Explanation Text */}
      <p className="text-xs sm:text-sm text-[#2d4d41] font-medium leading-relaxed mb-3">
        {generateExplanation()}
      </p>

      {/* 2-3 Factual Data Indicators */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#e2efe8]/80 text-[11px] sm:text-xs">
        {avgAqi != null && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d6e9df] text-[#1e4335] font-semibold">
            <LeafIcon className="w-3.5 h-3.5 text-[#168b62]" />
            <span>
              AQI <strong style={{ color }}>{Math.round(avgAqi)}</strong>
              {aqiCat ? ` • ${aqiCat}` : ""}
              {aqiSavings > 0 ? ` (-${aqiSavings} pts)` : ""}
            </span>
          </div>
        )}

        {duration != null && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d6e9df] text-[#1e4335] font-semibold">
            <ClockIcon className="w-3.5 h-3.5 text-[#168b62]" />
            <span>
              <strong>{Math.round(duration)} min</strong>
              {isFastest ? " • Fastest" : " transit"}
            </span>
          </div>
        )}

        {rec.traffic_level && (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d6e9df] text-[#1e4335] font-semibold">
            <ActivityIcon className="w-3.5 h-3.5 text-[#168b62]" />
            <span>{rec.traffic_level} traffic</span>
          </div>
        )}

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-[#d6e9df] text-[#1e4335] font-semibold">
          <ShieldCheckIcon className="w-3.5 h-3.5 text-[#168b62]" />
          <span>{profileName} Profile</span>
        </div>
      </div>

      {/* Optional Expandable Compact Breakdown */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-[#d8ebe1] space-y-2.5 animate-fadeIn">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Health Profile</span>
              <p className="font-bold text-[#17352b] mt-0.5 truncate">{profileName}</p>
            </div>

            <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Recommended Route</span>
              <p className="font-bold text-[#17352b] mt-0.5 truncate">{rec.route_id}</p>
            </div>

            {avgAqi != null && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Average AQI</span>
                <p className="font-bold text-[#17352b] mt-0.5">{Math.round(avgAqi)} {aqiCat ? `(${aqiCat})` : ""}</p>
              </div>
            )}

            {maxAqi != null && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Peak AQI</span>
                <p className="font-bold text-[#17352b] mt-0.5">{Math.round(maxAqi)}</p>
              </div>
            )}

            {duration != null && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Travel Time</span>
                <p className="font-bold text-[#17352b] mt-0.5">{Math.round(duration)} min</p>
              </div>
            )}

            {distance != null && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Distance</span>
                <p className="font-bold text-[#17352b] mt-0.5">{distance} km</p>
              </div>
            )}

            {rec.traffic_level && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Traffic Flow</span>
                <p className="font-bold text-[#17352b] mt-0.5">{rec.traffic_level}</p>
              </div>
            )}

            {rec.score != null && (
              <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#789087]">Optimization Score</span>
                <p className="font-bold text-[#17352b] mt-0.5">{rec.score}</p>
              </div>
            )}
          </div>

          {rec.recommendation_reason && (
            <div className="rounded-xl bg-white/90 p-2.5 border border-[#dcebe2] text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#168b62]">Reasoning Detail</span>
              <p className="font-semibold text-[#2d4d41] mt-0.5">{rec.recommendation_reason}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
