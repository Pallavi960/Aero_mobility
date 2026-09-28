import React, { useState, useEffect } from "react";
import { API } from "../../constants/appConstants";

export default function StationPicker({ label, text, setText, onSelect, placeholder }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ query: text, limit: "8" });
        const res = await fetch(`${API}/api/aqi/stations?${q}`, { signal: ctrl.signal });
        const data = await res.json();
        setItems(data.stations || []);
        setMessage("");
      } catch (e) {
        if (e.name !== "AbortError") {
          setItems([]);
          setMessage("Could not fetch stations.");
        }
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, open]);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <span className="absolute left-3 text-[#789087] text-sm pointer-events-none">📍</span>
        <input
          value={text}
          placeholder={placeholder || `Search ${label} station`}
          className="w-full pl-8 pr-7 py-2.5 rounded-xl border border-[#cfddd5] bg-[#fbfdfb] text-xs sm:text-sm font-medium text-[#17352b] outline-none transition focus:border-[#168b62] focus:ring-2 focus:ring-[#168b62]/20"
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 220)}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
          }}
        />
        {text && (
          <button
            type="button"
            className="absolute right-2.5 text-[#94a3b8] hover:text-[#475569] text-xs font-bold"
            onClick={() => {
              setText("");
              onSelect(null);
            }}
          >
            ✕
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 top-[calc(100%+4px)] left-0 right-0 max-h-56 overflow-y-auto rounded-xl border border-[#cbdcd2] bg-white shadow-xl">
          {loading && <p className="p-2.5 text-xs text-[#71827a]">Searching stations…</p>}
          {!loading && message && <p className="p-2.5 text-xs text-[#b64d42]">{message}</p>}
          {!loading && !message && !items.length && (
            <p className="p-2.5 text-xs text-[#71827a]">Try typing a Delhi area (e.g. Anand Vihar, Bawana, Dwarka).</p>
          )}
          {!loading && items.map((item) => (
            <button
              key={item.station_id}
              type="button"
              className="w-full px-3 py-2 text-left border-b border-[#f1f5f3] last:border-b-0 hover:bg-[#eff8f2] transition flex flex-col"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(item);
                setText(item.station_name);
                setOpen(false);
              }}
            >
              <span className="text-xs sm:text-sm font-bold text-[#17352b]">{item.station_name}</span>
              <span className="text-[11px] text-[#71827a]">{item.city}, {item.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
