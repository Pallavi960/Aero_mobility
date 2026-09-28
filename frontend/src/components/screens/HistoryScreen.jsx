import React, { useState, useEffect, useCallback } from "react";
import MetricCard from "../common/MetricCard";
import { API } from "../../constants/appConstants";
import { formatDate, aqiColor } from "../../utils/formatters";

export default function HistoryScreen({ onRecalculateTrip }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTrip, setSelectedTrip] = useState(null);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError("");
    fetch(`${API}/api/history?limit=50`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTrips(data.trips || []);
        else setError(data.error || "Could not load history.");
      })
      .catch(() => setError("Unable to reach backend history service."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear your saved search history?")) return;
    try {
      const res = await fetch(`${API}/api/history`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) setTrips([]);
      setSelectedTrip(null);
    } catch {
      alert("Failed to clear history.");
    }
  };

  if (selectedTrip) {
    const rr = selectedTrip.recommendedRoute || {};
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20">
        <div className="flex items-center gap-3 mb-5">
          <button
            type="button"
            onClick={() => setSelectedTrip(null)}
            className="w-9 h-9 rounded-xl border border-[#dbe7df] bg-white flex items-center justify-center font-bold text-[#315447] hover:bg-[#eef7f1]"
          >
            ←
          </button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#789087]">Recorded Search Snapshot</p>
            <h2 className="font-display text-xl font-bold text-[#17352b]">Trip Details</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-[#dbe7df] bg-white p-5 sm:p-6 shadow-sm space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#789087]">From</p>
              <p className="break-words text-base font-bold text-[#17352b]">{selectedTrip.from?.name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-[#789087]">To</p>
              <p className="break-words text-base font-bold text-[#17352b]">{selectedTrip.to?.name}</p>
            </div>
            <div className="flex flex-col gap-3 pt-2 border-t border-[#f0f4f1] sm:flex-row sm:gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase text-[#789087]">Health Profile</p>
                <p className="text-sm font-bold text-[#168b62]">{selectedTrip.healthProfile?.name || "General"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-[#789087]">Recorded Date</p>
                <p className="text-sm font-bold text-[#315447]">
                  {formatDate(selectedTrip.createdAt)} at{" "}
                  {new Date(selectedTrip.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          </div>

          {rr.routeId && (
            <div className="rounded-3xl border border-[#dbe7df] bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#168b62] mb-3">
                Saved Best Route · {rr.routeId}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <MetricCard label="Travel Time" value={rr.travelTimeMinutes} unit="min" />
                <MetricCard label="Distance" value={rr.distanceKm} unit="km" />
                <MetricCard label="Recorded AQI" value={rr.aqi} highlightColor={aqiColor(rr.aqi)} />
                <MetricCard label="Score" value={rr.score} />
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => onRecalculateTrip(selectedTrip)}
            className="w-full rounded-2xl bg-[#168b62] hover:bg-[#127250] text-white py-3.5 font-bold text-sm shadow-md transition"
          >
            Recalculate with Live Traffic & AQI →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Saved Searches</p>
          <h2 className="font-display text-2xl font-bold text-[#17352b]">Search History</h2>
        </div>
        {trips.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-bold text-[#b64d42] hover:bg-[#fff0ed] px-3 py-1.5 rounded-lg border border-[#f5c6c0]"
          >
            Clear All
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-[#edf2ee] animate-pulse" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-3xl border border-[#dbe7df] bg-white p-6 text-center">
          <p className="text-sm font-bold text-[#b64d42] mb-2">{error}</p>
          <button type="button" onClick={fetchHistory} className="px-4 py-2 rounded-xl bg-[#168b62] text-white text-xs font-bold">
            Retry
          </button>
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="rounded-3xl border border-dashed border-[#c7d9ce] bg-white p-8 text-center">
          <span className="text-3xl">🌿</span>
          <p className="font-display text-base font-bold text-[#17352b] mt-2">No Saved Trips Yet</p>
          <p className="text-xs text-[#789087] mt-1 mb-4">
            When you plan cleaner routes on Home, your search history is safely recorded here.
          </p>
        </div>
      )}

      {!loading && !error && trips.length > 0 && (
        <div className="space-y-2.5">
          {trips.map((t) => {
            const rr = t.recommendedRoute || {};
            return (
              <div
                key={t._id}
                onClick={() => setSelectedTrip(t)}
                className="cursor-pointer rounded-2xl border border-[#dbe7df] bg-white p-4 hover:border-[#168b62] hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-[#789087]">
                      {t.healthProfile?.name || "General"} · {formatDate(t.createdAt)}
                    </span>
                    <p className="font-bold text-sm text-[#17352b] break-words mt-0.5">{t.from?.name || "Origin"}</p>
                    <p className="text-xs text-[#168b62] font-bold my-0.5">↓</p>
                    <p className="font-bold text-sm text-[#17352b] break-words">{t.to?.name || "Destination"}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {rr.aqi != null && (
                      <span
                        className="inline-block text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: aqiColor(rr.aqi) + "20",
                          color: aqiColor(rr.aqi),
                        }}
                      >
                        AQI {Math.round(rr.aqi)}
                      </span>
                    )}
                    <p className="text-xs text-[#789087] mt-1 font-semibold">
                      {rr.travelTimeMinutes ? `${rr.travelTimeMinutes} min` : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
