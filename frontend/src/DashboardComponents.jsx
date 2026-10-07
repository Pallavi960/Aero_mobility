import React, { useEffect, useState } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

export function StationPicker({ label, text, setText, choose }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return undefined;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const query = new URLSearchParams({ query: text, limit: "8" });
        const result = await fetch(`${API}/api/aqi/stations?${query}`, { signal: controller.signal });
        const data = await result.json();
        if (!result.ok) throw new Error(data.error || "Station search is unavailable.");
        setItems(data.stations || []);
        setMessage("");
      } catch (error) {
        if (error.name !== "AbortError") {
          setItems([]);
          setMessage("Start the Flask backend to search stations.");
        }
      }
    }, 160);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [text, open]);

  return <div className="station-search">
    <input value={text} placeholder={`Search ${label} station`} onFocus={() => setOpen(true)} onBlur={() => window.setTimeout(() => setOpen(false), 150)} onChange={event => { setText(event.target.value); setOpen(true); }} />
    {open && <div className="station-menu">
      {message && <p className="station-menu-status">{message}</p>}
      {!message && !items.length && <p className="station-menu-status">Try Delhi or a Delhi station name.</p>}
      {items.map(item => <button key={item.station_id} type="button" className="station-option" onMouseDown={event => event.preventDefault()} onClick={() => { choose(item); setOpen(false); }}>
        <span className="station-option-name">{item.station_name}</span><span className="station-option-location">{item.city}, {item.state}</span>
      </button>)}
    </div>}
  </div>;
}

function displayValue(number, suffix = "") {
  return number === undefined || number === null ? "--" : `${number}${suffix}`;
}

export function RouteCard({ route, recommended, selected, choose }) {
  const aqi = route.aqi || {};
  return <button onClick={choose} className={`rounded-2xl border bg-white p-5 text-left ${selected ? "border-[#168b62] ring-1 ring-[#168b62]" : "border-[#dbe7df]"}`}>
    <div className="flex justify-between gap-2"><span className="text-xs font-bold uppercase text-[#168b62]">{recommended ? "Recommended" : "Route option"}</span><span className="text-xs font-bold text-[#267253]">{route.route_type}</span></div>
    <h3 className="mt-3 font-display text-lg font-bold">{route.route_id}</h3>
    <p className="mt-1 text-sm font-bold text-[#52685e]">{displayValue(route.duration_in_traffic_minutes, " min")} · {displayValue(route.distance_km, " km")}</p>
    <div className="mt-4 grid grid-cols-2 gap-2 text-xs"><Info title="AQI" main={displayValue(aqi.average_aqi)} /><Info title="Traffic" main={route.traffic_level || "--"} /><Info title="Peak AQI" main={displayValue(aqi.maximum_aqi)} /><Info title="Score" main={displayValue(route.score)} /></div>
    {recommended && <p className="mt-4 border-t border-[#edf2ee] pt-3 text-xs font-semibold text-[#52685e]">{route.recommendation_reason}</p>}
  </button>;
}

export function Info({ title, main, sub }) {
  return <div className="rounded-2xl border border-[#dbe7df] bg-white p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-[#789087]">{title}</p><p className="mt-1 font-display text-xl font-bold text-[#168b62]">{main}</p>{sub && <p className="mt-1 text-xs font-semibold text-[#60776c]">{sub}</p>}</div>;
}
