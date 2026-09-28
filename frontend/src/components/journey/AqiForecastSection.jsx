import React, { useState, useEffect } from "react";
import { API } from "../../constants/appConstants";
import { aqiColor, aqiLabel } from "../../utils/formatters";

export default function AqiForecastSection({ stationId, stationName }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stationId) {
      setForecast(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError("");

    fetch(`${API}/api/aqi/predict?station_id=${encodeURIComponent(stationId)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setForecast(data);
        } else {
          setError(data.error || "24-hour prediction unavailable.");
        }
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError("Could not load AQI ML forecast.");
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });

    return () => ctrl.abort();
  }, [stationId]);

  const chartPoints = forecast?.forecast || [];
  const chartMax = Math.max(...chartPoints.map((p) => Number(p.predicted_aqi) || 0), 100);

  return (
    <div className="rounded-3xl border border-[#dbe7df] bg-white p-5 sm:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Machine Learning Prediction</p>
          <h3 className="font-display text-base font-bold text-[#17352b]">24-Hour AQI Forecast Timeline</h3>
        </div>
        {forecast?.current_aqi !== undefined && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: aqiColor(forecast.current_aqi) + "18",
              borderColor: aqiColor(forecast.current_aqi) + "50",
              color: aqiColor(forecast.current_aqi),
            }}
          >
            Now: {forecast.current_aqi} AQI ({aqiLabel(forecast.current_aqi)})
          </span>
        )}
      </div>

      <p className="text-xs text-[#789087] mb-3">
        Trained Environmental Model Forecast for{" "}
        <span className="font-semibold text-[#315447]">{stationName || forecast?.station_name || "Origin Station"}</span>
      </p>

      {loading && <p className="text-xs font-semibold text-[#60776c] py-4 text-center">Loading 24-hour ML predictions…</p>}
      {error && !loading && <p className="text-xs font-semibold text-[#b64d42] py-2">{error}</p>}

      {forecast && !loading && chartPoints.length > 0 && (
        <div className="rounded-2xl bg-[#f7faf7] border border-[#e5efe7] p-3 sm:p-4">
          <div className="flex h-36 gap-2 overflow-x-auto pb-2 snap-x items-end">
            {chartPoints.map((p, i) => {
              const aqiVal = Math.round(p.predicted_aqi);
              const heightPct = Math.max(16, (aqiVal / chartMax) * 78);
              return (
                <div key={i} className="snap-start flex h-full min-w-[42px] flex-col items-center justify-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold text-[#315447]">{aqiVal}</span>
                  <div
                    className="w-5 rounded-t-md transition-all hover:opacity-80"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: aqiColor(aqiVal),
                    }}
                    title={`Hour +${i + 1}: ${aqiVal} AQI (${aqiLabel(aqiVal)})`}
                  />
                  <span className="whitespace-nowrap text-[9px] font-semibold text-[#789087]">
                    {p.datetime
                      ? new Date(p.datetime).toLocaleTimeString([], { hour: "2-digit" })
                      : `+${i + 1}h`}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-[#789087] pt-2 border-t border-[#e2ece5]">
            <span>← Next Hours</span>
            <span>Scroll horizontally for 24h cycle →</span>
          </div>
        </div>
      )}
    </div>
  );
}
