import React, { useState, useEffect } from "react";
import MetricCard from "../common/MetricCard";
import { WEATHER_API, AIR_QUALITY_API } from "../../constants/appConstants";
import { weatherCondition } from "../../utils/formatters";
import { notificationService } from "../../services/notificationService";

export default function CurrentConditionsSection({ point, userKey, healthProfile, originName }) {
  const [conditions, setConditions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!point?.latitude || !point?.longitude) return;

    const ctrl = new AbortController();
    const wp = new URLSearchParams({
      latitude: point.latitude,
      longitude: point.longitude,
      current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
      timezone: "auto"
    });
    const ap = new URLSearchParams({
      latitude: point.latitude,
      longitude: point.longitude,
      current: "pm2_5,pm10,nitrogen_dioxide,ozone,carbon_monoxide,us_aqi",
      timezone: "auto"
    });

    setLoading(true);
    setError("");

    Promise.all([
      fetch(`${WEATHER_API}?${wp}`, { signal: ctrl.signal }),
      fetch(`${AIR_QUALITY_API}?${ap}`, { signal: ctrl.signal }),
    ])
      .then(async ([wr, ar]) => {
        if (!wr.ok || !ar.ok) throw new Error("Could not fetch meteorological data.");
        const [w, a] = await Promise.all([wr.json(), ar.json()]);
        if (!w.current || !a.current) throw new Error("Incomplete environmental response.");
        setConditions({ weather: w.current, airQuality: a.current });
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError("Live conditions temporarily unavailable.");
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [point?.latitude, point?.longitude]);

  useEffect(() => {
    if (!conditions || !userKey) return;
    notificationService.evaluateEnvironmentalData(userKey, {
      weather: conditions.weather,
      airQuality: conditions.airQuality,
      healthProfile,
      originName: originName || point?.station_name,
    });
  }, [conditions, userKey, healthProfile, originName, point?.station_name]);

  const w = conditions?.weather;
  const a = conditions?.airQuality;

  return (
    <div className="rounded-3xl border border-[#dbe7df] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Environmental Intelligence</p>
          <h3 className="font-display text-base font-bold text-[#17352b]">Current Conditions at Origin</h3>
        </div>
        {w && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#eef7f1] text-[#168b62] border border-[#d0e8db]">
            {weatherCondition(w.weather_code)}
          </span>
        )}
      </div>

      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#f0f4f1] animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <p className="text-xs font-semibold text-[#b64d42] py-2">{error}</p>
      )}

      {conditions && !loading && (
        <div className="space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087] mb-2">Weather & Climate</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <MetricCard label="Temperature" value={w.temperature_2m} unit="°C" icon="🌡️" />
              <MetricCard label="Feels Like" value={w.apparent_temperature} unit="°C" icon="🌤️" />
              <MetricCard label="Humidity" value={w.relative_humidity_2m} unit="%" icon="💧" />
              <MetricCard label="Wind Speed" value={w.wind_speed_10m} unit="km/h" icon="💨" />
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#789087] mb-2">Key Air Pollutants</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <MetricCard
                label="PM2.5"
                value={a.pm2_5 != null ? Math.round(a.pm2_5 * 10) / 10 : null}
                unit="µg/m³"
                highlightColor={a.pm2_5 > 60 ? "#ef4444" : "#168b62"}
              />
              <MetricCard
                label="PM10"
                value={a.pm10 != null ? Math.round(a.pm10 * 10) / 10 : null}
                unit="µg/m³"
                highlightColor={a.pm10 > 100 ? "#ef4444" : "#168b62"}
              />
              <MetricCard
                label="NO₂"
                value={a.nitrogen_dioxide != null ? Math.round(a.nitrogen_dioxide * 10) / 10 : null}
                unit="µg/m³"
              />
              <MetricCard
                label="Ozone (O₃)"
                value={a.ozone != null ? Math.round(a.ozone * 10) / 10 : null}
                unit="µg/m³"
              />
              <MetricCard
                label="Carbon Monoxide"
                value={a.carbon_monoxide != null ? Math.round(a.carbon_monoxide) : null}
                unit="µg/m³"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
