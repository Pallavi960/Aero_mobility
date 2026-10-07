import React, { useEffect, useRef, useState } from "react";
import { Info, RouteCard, StationPicker } from "./DashboardComponents";
import { PROFILES } from "./healthProfiles";
import { aqiCategory } from "./aqiVisuals";

const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function loadGoogleMaps() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.reject(new Error("Add VITE_GOOGLE_MAPS_API_KEY to .env to display the map."));
  if (window.google?.maps?.Map) return Promise.resolve(window.google.maps);
  if (window.__aeroMobilityMapsPromise) return window.__aeroMobilityMapsPromise;
  window.__aeroMobilityMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly`;
    script.async = true;
    script.onload = () => window.google?.maps?.Map ? resolve(window.google.maps) : reject(new Error("Google Maps is unavailable."));
    script.onerror = () => reject(new Error("Google Maps could not be loaded."));
    document.head.appendChild(script);
  });
  return window.__aeroMobilityMapsPromise;
}

function decode(encoded = "") {
  const out = [];
  let i = 0, lat = 0, lng = 0;
  while (i < encoded.length) {
    let r = 0, s = 0, b;
    do { b = encoded.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5; } while (b >= 32);
    lat += r & 1 ? ~(r >> 1) : r >> 1;
    r = 0; s = 0;
    do { b = encoded.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5; } while (b >= 32);
    lng += r & 1 ? ~(r >> 1) : r >> 1;
    out.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return out;
}

function trafficColor(level) {
  switch (String(level || "").toLowerCase()) {
    case "low": return "#168b62";
    case "moderate": return "#d2a21b";
    case "heavy": return "#e77b26";
    case "severe": return "#c94040";
    default: return "#82928b";
  }
}

function Icon({ name, size = 18 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-7h6v7"/></svg>;
  if (name === "journey") return <svg {...common}><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a4 4 0 0 0 4-4V10a4 4 0 0 1 4-4"/></svg>;
  if (name === "map") return <svg {...common}><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><path d="M9 3v15M15 6v15"/><circle cx="12" cy="10" r="2"/></svg>;
  if (name === "history") return <svg {...common}><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/></svg>;
  if (name === "conditions") return <svg {...common}><path d="M20 16.2A4.5 4.5 0 0 0 18 7.7a6 6 0 0 0-11.5 1.8A3.5 3.5 0 0 0 7 16.5h12"/><path d="M8 20h.01M12 20h.01M16 20h.01"/></svg>;
  return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M5 21v-1a7 7 0 0 1 14 0v1"/></svg>;
}

function weatherConditionName(code) {
  const conditions = { 0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Rain showers", 81: "Rain showers", 82: "Heavy showers", 95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail" };
  return conditions[code] || "Current conditions";
}

function ConditionsPanel({ environment, onRetry, onClose }) {
  const air = environment?.conditions?.airQuality;
  const weather = environment?.conditions?.weather;
  const aqi = air?.us_aqi;
  const category = aqiCategory(aqi);
  const pollutants = [["PM2.5", air?.pm2_5, "µg/m³"], ["PM10", air?.pm10, "µg/m³"], ["NO₂", air?.nitrogen_dioxide, "µg/m³"], ["O₃", air?.ozone, "µg/m³"], ["CO", air?.carbon_monoxide, "µg/m³"]];
  const updated = weather?.time ? new Date(weather.time).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : null;
  return <section className="conditions-panel" role="dialog" aria-label="Live conditions">
    <div className="conditions-panel-header"><div><p className="conditions-overline">Live conditions</p><h2>Current environment</h2></div><button type="button" className="conditions-close" onClick={onClose} aria-label="Close live conditions">×</button></div>
    {environment?.loading && <p className="conditions-message">Loading current conditions…</p>}
    {!environment?.loading && environment?.message && environment?.hasPoint && <div className="conditions-message"><p>Unable to load current conditions.</p><button type="button" onClick={onRetry}>Try again</button></div>}
    {!environment?.loading && !environment?.conditions && !environment?.hasPoint && <div className="conditions-message"><p>Current conditions are not available yet.</p><span>Select a location in Journey to load live environmental data.</span></div>}
    {environment?.conditions && <>
      <p className="conditions-location">Selected journey location {updated && <span>· Updated {updated}</span>}</p>
      <p className="conditions-section-label">Quick summary</p>
      <div className="conditions-summary">
        <article className="conditions-summary-aqi"><span className="conditions-summary-label">AQI</span><strong style={{ color: category.color }}>{aqi ?? "--"}</strong><span className="conditions-category" style={{ color: category.color, backgroundColor: category.background }}>{category.label}</span></article>
        <article className="conditions-summary-weather"><span className="conditions-weather-icon"><Icon name="conditions" size={21}/></span><strong>{weather?.temperature_2m == null ? "--" : `${weather.temperature_2m}°C`}</strong><span>{weather ? weatherConditionName(weather.weather_code) : "Weather unavailable"}</span></article>
        <article className="conditions-summary-pm"><span>PM2.5</span><strong>{air?.pm2_5 == null ? "--" : `${air.pm2_5} µg/m³`}</strong></article>
      </div>
      <div className="conditions-detail-row"><span>Humidity</span><strong>{weather?.relative_humidity_2m == null ? "--" : `${weather.relative_humidity_2m}%`}</strong><span>Wind</span><strong>{weather?.wind_speed_10m == null ? "--" : `${weather.wind_speed_10m} km/h`}</strong></div>
      <p className="conditions-section-label">Air pollutants</p>
      <dl className="conditions-pollutants">{pollutants.map(([label, amount, unit]) => <div key={label}><dt>{label}</dt><dd>{amount == null ? "--" : `${amount} ${unit}`}</dd></div>)}</dl>
      <p className="conditions-updated">{updated ? `Updated ${updated} local time` : "Update time unavailable"} · Open-Meteo / CAMS</p>
    </>}
  </section>;
}

const NAV_ITEMS = [["about", "About"], ["journey", "Journey"], ["map", "Map"], ["history", "History"]];

export function DashboardHeader({ screen, onNavigate, user, profile, onLogout, environment }) {
  const [open, setOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const menuRef = useRef(null);
  const conditionsRef = useRef(null);
  const profileName = PROFILES.find(([id]) => id === profile)?.[1] || "General";
  useEffect(() => {
    if (!open && !conditionsOpen) return undefined;
    const onPointerDown = event => {
      if (!menuRef.current?.contains(event.target)) setOpen(false);
      if (!conditionsRef.current?.contains(event.target)) setConditionsOpen(false);
    };
    const onKeyDown = event => { if (event.key === "Escape") { setOpen(false); setConditionsOpen(false); menuRef.current?.querySelector("button")?.focus(); } };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => { document.removeEventListener("pointerdown", onPointerDown); document.removeEventListener("keydown", onKeyDown); };
  }, [open, conditionsOpen]);
  return <header className="app-header border-b border-[#dbe7df] bg-[#fbfdf9] px-4 py-3 sm:px-5">
    <div className="app-header-inner mx-auto max-w-[1400px]">
      <button type="button" onClick={() => onNavigate("about")} aria-label="AeroMobility About" className="app-brand flex min-w-0 items-center gap-3 text-left">
        <span aria-hidden="true" className="app-brand-mark grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#168b62] text-xl text-white">✦</span>
        <span className="app-brand-copy min-w-0"><span className="app-brand-title block font-display text-lg font-bold">AeroMobility</span><span className="app-brand-subtitle block text-[11px] font-bold uppercase tracking-[.16em] text-[#71827a]">AI + AQI + Smart Routes</span></span>
      </button>
      <nav aria-label="Main navigation" className="app-header-nav hidden items-center gap-1 lg:flex">
        {NAV_ITEMS.map(([id, label]) => <button key={id} type="button" aria-current={screen === id ? "page" : undefined} onClick={() => onNavigate(id)} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold transition ${screen === id ? "bg-[#e3f4eb] text-[#16714f]" : "text-[#60776c] hover:bg-[#f0f7f2] hover:text-[#168b62]"}`}><Icon name={id} size={16} />{label}</button>)}
      </nav>
      <div className="conditions-menu-wrap" ref={conditionsRef}>
        <button type="button" className="conditions-trigger" aria-haspopup="dialog" aria-expanded={conditionsOpen} onClick={() => { setConditionsOpen(value => !value); setOpen(false); }}><span className="live-dot" aria-hidden="true"/><Icon name="conditions" size={16}/><span className="conditions-trigger-label">Live Conditions</span><span className="conditions-trigger-mobile">Conditions</span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg></button>
        {conditionsOpen && <ConditionsPanel environment={environment} onRetry={() => window.dispatchEvent(new CustomEvent("aero-conditions-retry"))} onClose={() => setConditionsOpen(false)}/>}
      </div>
      <div className="profile-menu-wrap" ref={menuRef}>
        <button type="button" className="profile-menu-trigger" aria-label={`Account menu for ${user?.full_name || "user"}`} aria-haspopup="menu" aria-expanded={open} aria-controls="account-menu" onClick={() => setOpen(value => !value)}>
          <span className="profile-avatar"><Icon name="profile" size={18}/></span><span className="profile-trigger-name">{user?.full_name || "Account"}</span><svg className="profile-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m7 10 5 5 5-5"/></svg>
        </button>
        {open && <div id="account-menu" className="profile-dropdown" role="menu" aria-label="Account menu">
          <div className="profile-dropdown-user"><span className="profile-avatar profile-avatar-large"><Icon name="profile" size={20}/></span><div className="min-w-0"><p className="truncate text-sm font-bold text-[#17352b]">{user?.full_name || "Account"}</p>{user?.email && <p className="truncate text-xs text-[#71827a]">{user.email}</p>}<p className="mt-1 text-[11px] font-semibold text-[#168b62]">Signed in</p></div></div>
          <div className="profile-dropdown-health"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#789087]">Health profile</p><p className="mt-1 text-sm font-semibold text-[#315447]">{profileName}</p></div>
          <button type="button" role="menuitem" className="profile-dropdown-item" onClick={() => { setOpen(false); onNavigate("profile"); }}>View profile</button>
          <div className="profile-dropdown-divider"/><button type="button" role="menuitem" className="profile-dropdown-item profile-dropdown-logout" onClick={() => { setOpen(false); onLogout?.(); }}>Log out</button>
        </div>}
      </div>
    </div>
  </header>;
}
export function AboutScreen({ onPlanJourney }) {
  const features = [
    ["01", "AQI forecasting", "See air-quality conditions and forecast information for your journey."],
    ["02", "Health-aware routes", "Use your health profile when comparing available route options."],
    ["03", "Traffic + AQI", "Compare route traffic and air-quality details together."],
    ["04", "Weather awareness", "Review current weather alongside journey conditions."],
  ];
  const steps = [["01", "Choose", "Set your origin and destination."], ["02", "Analyze", "Review available route and condition data."], ["03", "Compare", "Explore traffic, AQI and journey details."], ["04", "Plan", "Choose the route that suits your needs."]];
  return <main className="mx-auto max-w-[1400px] space-y-14 p-5 pb-28 md:space-y-20 md:p-8 md:pb-12">
    <section className="about-hero overflow-hidden rounded-[2rem] border border-[#dbe7df] bg-white shadow-sm">
      <div className="grid min-h-[430px] items-center lg:grid-cols-[1.05fr_.95fr]">
        <div className="px-6 py-10 sm:px-10 lg:px-14 lg:py-14"><p className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[.2em] text-[#168b62]"><span className="h-2 w-2 rounded-full bg-[#168b62]"/>AeroMobility · AI + AQI + Smart Routes</p><h1 className="mt-6 max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Smarter journeys.<br/><span className="text-[#168b62]">Healthier travel.</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-[#60776c] sm:text-lg">Plan your journey with air-quality, traffic and route intelligence. Make informed travel choices with the conditions that matter to you.</p><div className="mt-8 flex flex-wrap gap-3"><button type="button" onClick={onPlanJourney} className="rounded-xl bg-[#168b62] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_18px_rgba(22,139,98,0.2)] transition hover:-translate-y-0.5 hover:bg-[#107451]">Plan a Journey <span aria-hidden="true">→</span></button><a href="#about-features" className="rounded-xl border border-[#cfddd5] px-5 py-3 text-sm font-bold text-[#315447] transition hover:bg-[#f7faf7]">Explore AeroMobility</a></div><p className="mt-7 text-xs font-semibold text-[#789087]">Built to help you understand the journey before you go.</p></div>
        <div className="about-visual relative grid min-h-[280px] place-items-center overflow-hidden bg-[#edf5ef] p-5 sm:min-h-[340px] lg:min-h-full"><div className="absolute inset-0 opacity-50" style={{backgroundImage:"radial-gradient(#bed3c5 1px,transparent 1px)",backgroundSize:"20px 20px"}}/><svg className="relative w-full max-w-[520px]" viewBox="0 0 540 360" role="img" aria-label="Illustration of a route connecting places with air quality and traffic indicators"><path d="M55 90 180 55l70 48 100-35 130 70-27 135-122 34-105-47-114 26-42-112z" fill="#e2eee5" stroke="#ccddcf" strokeWidth="2"/><path d="m80 250 96-90 92 28 92-92 105 55" fill="none" stroke="#b7cdbd" strokeWidth="3" strokeDasharray="7 9"/><path d="M91 232c65-81 89-58 137-43s74 29 115-23 64-49 109-5" fill="none" stroke="#168b62" strokeWidth="7" strokeLinecap="round"/><circle cx="91" cy="232" r="10" fill="white" stroke="#168b62" strokeWidth="5"/><circle cx="452" cy="161" r="10" fill="white" stroke="#168b62" strokeWidth="5"/><g transform="translate(221 70)"><rect width="136" height="62" rx="14" fill="white" stroke="#dbe7df"/><circle cx="25" cy="25" r="10" fill="#e6f4eb"/><path d="M25 17v9l6 3" fill="none" stroke="#168b62" strokeWidth="2" strokeLinecap="round"/><text x="44" y="25" fill="#315447" fontSize="12" fontWeight="700">Air quality</text><text x="44" y="44" fill="#168b62" fontSize="12" fontWeight="700">Route insights</text></g><g transform="translate(353 229)"><rect width="132" height="58" rx="14" fill="white" stroke="#dbe7df"/><circle cx="22" cy="29" r="6" fill="#d2a21b"/><text x="38" y="26" fill="#315447" fontSize="11" fontWeight="700">Traffic conditions</text><text x="38" y="42" fill="#789087" fontSize="10">Compared by route</text></g><g transform="translate(43 95)"><rect width="110" height="51" rx="13" fill="white" stroke="#dbe7df"/><text x="14" y="21" fill="#789087" fontSize="10" fontWeight="700">JOURNEY</text><text x="14" y="38" fill="#315447" fontSize="12" fontWeight="700">Delhi, India</text></g></svg><div className="absolute bottom-5 left-5 rounded-xl border border-[#dbe7df] bg-white/95 px-3 py-2 text-xs font-bold text-[#315447] shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#168b62]"/>Connected journey insights</div></div>
      </div>
    </section>
    <section id="about-features"><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#168b62]">What makes it useful</p><h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Travel decisions, with more context.</h2><p className="mt-3 text-sm leading-6 text-[#71827a]">AeroMobility brings the information already available in your planner into one clear view.</p></div><div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{features.map(([number,title,description])=><article key={number} className="rounded-2xl border border-[#dbe7df] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><p className="font-display text-sm font-bold text-[#168b62]">{number}</p><h3 className="mt-4 font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#71827a]">{description}</p></article>)}</div></section>
    <section><div className="max-w-2xl"><p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#168b62]">A clearer way to plan</p><h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">How AeroMobility works</h2></div><div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([number,title,description],index)=><div key={number} className="relative rounded-2xl bg-[#edf5ef] p-5"><p className="text-xs font-extrabold tracking-[.14em] text-[#168b62]">STEP {number}</p><h3 className="mt-3 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#60776c]">{description}</p>{index<steps.length-1&&<span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-[#dbe7df] bg-white px-2 py-1 text-[#168b62] lg:block" aria-hidden="true">→</span>}</div>)}</div></section>
    <section className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-[#173c30] px-6 py-8 text-white sm:flex-row sm:items-center sm:px-10 sm:py-9"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a9d9bd]">Your next trip</p><h2 className="mt-2 font-display text-2xl font-bold sm:text-3xl">Ready to plan a smarter journey?</h2></div><button type="button" onClick={onPlanJourney} className="shrink-0 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#16714f] transition hover:bg-[#e8f4ec]">Plan Your Journey <span aria-hidden="true">→</span></button></section>
  </main>;
}

export function MobileNavigation({ screen, onNavigate }) {
  return <nav aria-label="Mobile navigation" className="mobile-bottom-nav lg:hidden">
    {NAV_ITEMS.map(([id, label]) => <button key={id} type="button" aria-current={screen === id ? "page" : undefined} onClick={() => onNavigate(id)} className={`mobile-nav-button ${screen === id ? "mobile-nav-active" : ""}`}><Icon name={id} size={19} /><span>{label}</span></button>)}
  </nav>;
}

export function MapScreen({ from, to, fromPoint, toPoint, profile, setFrom, setTo, setProfile, onFind, routes, recommended, selected, onSelectRoute, loading, error, chooseStation }) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const drawings = useRef([]);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    let active = true;
    loadGoogleMaps().then(maps => {
      if (!active || !mapElement.current) return;
      map.current = new maps.Map(mapElement.current, { center: { lat: 28.6139, lng: 77.209 }, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
      setReady(true);
    }).catch(reason => { if (active) setMapError(reason.message); });
    return () => {
      active = false;
      drawings.current.forEach(item => item.setMap(null));
      drawings.current = [];
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !map.current || !window.google?.maps) return;
    drawings.current.forEach(item => item.setMap(null));
    drawings.current = [];
    const bounds = new window.google.maps.LatLngBounds();
    [fromPoint, toPoint].forEach((point, index) => {
      if (!point) return;
      const marker = new window.google.maps.Marker({ position: point, map: map.current, label: index === 0 ? "A" : "B", title: index === 0 ? "Origin" : "Destination" });
      drawings.current.push(marker);
      bounds.extend(point);
    });
    routes.forEach(route => {
      const path = decode(route.polyline || "");
      if (!path.length) return;
      path.forEach(point => bounds.extend(point));
      const active = route.route_id === selected;
      const line = new window.google.maps.Polyline({ path, geodesic: true, map: map.current, strokeColor: trafficColor(route.traffic_level), strokeOpacity: active ? 1 : 0.66, strokeWeight: active ? 8 : 5, zIndex: active ? 4 : 1 });
      line.addListener("click", () => onSelectRoute(route.route_id));
      drawings.current.push(line);
    });
    if (!bounds.isEmpty()) map.current.fitBounds(bounds, 56);
  }, [ready, fromPoint, toPoint, routes, selected, onSelectRoute]);

  return <main className="mx-auto max-w-[1400px] space-y-5 p-5 pb-24 md:p-8 md:pb-8">
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,.6fr)]">
      <section className="relative order-1 min-h-[340px] overflow-hidden rounded-2xl border border-[#dbe7df] bg-[#dce9df] shadow-sm md:min-h-[560px]">
        <div ref={mapElement} className="absolute inset-0" />
        {!ready && <div className="absolute inset-0 grid place-items-center bg-[#e7f0e8]/90 p-6 text-center"><p className="rounded-xl bg-white p-4 text-sm font-bold">{mapError || "Loading route map…"}</p></div>}
        <div className="absolute bottom-3 left-3 rounded-xl border border-white/80 bg-white/95 p-3 shadow-sm"><p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-[#52685e]">Traffic</p><div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[#52685e]">{[["Low", "#168b62"], ["Moderate", "#d2a21b"], ["Heavy", "#e77b26"], ["Severe", "#c94040"]].map(([label, color]) => <span key={label} className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />{label}</span>)}</div></div>
      </section>
      <form onSubmit={onFind} className="order-2 rounded-2xl border border-[#dbe7df] bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#168b62]">Route comparison</p>
        <label className="mt-4 block text-xs font-bold text-[#52685e]">From<StationPicker label="origin" text={from} setText={setFrom} choose={chooseStation("from")} /></label>
        <label className="mt-4 block text-xs font-bold text-[#52685e]">To<StationPicker label="destination" text={to} setText={setTo} choose={chooseStation("to")} /></label>
        <label className="mt-4 block text-xs font-bold text-[#52685e]">Health profile<select value={profile} onChange={event => setProfile(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#cfddd5] bg-[#fbfdfb] px-3.5 py-3 text-sm">{PROFILES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <button disabled={loading || !fromPoint || !toPoint} className="mt-4 w-full rounded-xl bg-[#168b62] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{loading ? "Analyzing routes…" : "Compare routes"}</button>
        {(error || mapError) && <p className="mt-3 rounded-xl bg-[#fff1ef] p-3 text-xs font-bold text-[#b64d42]">{error || mapError}</p>}
      </form>
    </div>
    <section>
      <div className="mb-3 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#789087]">Available routes</p><h2 className="font-display text-2xl font-bold">{routes.length ? `${routes.length} route options` : "Compare your journey"}</h2></div>{routes.length > 0 && <span className="rounded-full bg-[#e3f4eb] px-3 py-1 text-xs font-bold text-[#16714f]">{routes.length} live</span>}</div>
      {routes.length ? <div className="grid gap-4 lg:grid-cols-3">{routes.map(route => <RouteCard key={route.route_id} route={route} recommended={route.route_id === recommended} selected={route.route_id === selected} choose={() => onSelectRoute(route.route_id)} />)}</div> : <div className="rounded-2xl border border-dashed border-[#c7d9ce] bg-white/70 p-7 text-center text-sm text-[#789087]">Choose two stations to see live routes, traffic and AQI.</div>}
    </section>
  </main>;
}

function formatDate(date) {
  if (!date) return "Date unavailable";
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? "Date unavailable" : parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function HistoryScreen({ onPlanJourney, onOpenJourney }) {
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API}/api/history`, { credentials: "include", signal: controller.signal }).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Journey history could not be loaded.");
      setJourneys(data.journeys || []);
    }).catch(reason => { if (reason.name !== "AbortError") setError(reason.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  return <main className="mx-auto max-w-[1100px] space-y-5 p-5 pb-24 md:p-8 md:pb-8">
    <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#168b62]">Saved journeys</p><h1 className="mt-1 font-display text-3xl font-bold">Journey History</h1><p className="mt-2 text-sm text-[#71827a]">Your analyzed journeys, saved to your AeroMobility account.</p></div>
    {loading && <p className="rounded-2xl border border-[#dbe7df] bg-white p-6 text-sm font-semibold text-[#60776c]">Loading your journeys…</p>}
    {error && <p className="rounded-xl bg-[#fff1ef] p-4 text-sm font-semibold text-[#b64d42]">{error}</p>}
    {!loading && !error && journeys.length === 0 && <section className="rounded-2xl border border-dashed border-[#c7d9ce] bg-white p-8 text-center"><h2 className="font-display text-xl font-bold">No journeys yet</h2><p className="mt-2 text-sm text-[#71827a]">Your analyzed journeys will appear here.</p><button type="button" onClick={onPlanJourney} className="mt-5 rounded-xl bg-[#168b62] px-5 py-3 text-sm font-bold text-white">Plan a Journey</button></section>}
    <div className="grid gap-3">{journeys.map(item => {
      const route = item.recommended_route || {};
      const health = item.health_profile || {};
      const fromName = item.from?.name || "Origin";
      const toName = item.to?.name || "Destination";
      return <article key={item.id} className="rounded-2xl border border-[#dbe7df] bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-display text-lg font-bold">{fromName} <span className="text-[#168b62]">→</span> {toName}</h2><p className="mt-1 text-xs font-semibold text-[#71827a]">{health.name || "General"} · {formatDate(item.created_at)}</p></div><span className="rounded-full bg-[#e3f4eb] px-3 py-1 text-xs font-bold text-[#16714f]">{route.traffic || "Traffic unavailable"}</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4"><Info title="AQI" main={route.aqi ?? "Unavailable"} /><Info title="Travel time" main={route.travelTimeMinutes == null ? "Unavailable" : `${route.travelTimeMinutes} min`} /><Info title="Distance" main={route.distanceKm == null ? "Unavailable" : `${route.distanceKm} km`} /><Info title="Routes compared" main={item.route_count ?? "--"} /></div>
        <button type="button" onClick={() => onOpenJourney(item)} className="mt-4 text-sm font-bold text-[#168b62]">View Journey →</button>
      </article>;
    })}</div>
  </main>;
}

export function ProfileScreen({ user, profile, onChangeProfile, onUserUpdated, onLogout }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch(`${API}/api/auth/profile`, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ health_profile: profile }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Profile could not be updated.");
      onUserUpdated(data.user);
      setMessage("Health profile saved.");
    } catch (reason) { setError(reason.message || "Profile could not be updated."); }
    finally { setSaving(false); }
  }
  const label = PROFILES.find(([id]) => id === profile)?.[1] || "General";
  return <main className="mx-auto max-w-[850px] space-y-5 p-5 pb-24 md:p-8 md:pb-8">
    <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#168b62]">Your account</p><h1 className="mt-1 font-display text-3xl font-bold">Profile</h1></div>
    <section className="rounded-2xl border border-[#dbe7df] bg-white p-5 shadow-sm sm:p-7"><div className="flex items-center gap-4 border-b border-[#edf2ee] pb-5"><span className="grid h-14 w-14 place-items-center rounded-full bg-[#e3f4eb] text-[#168b62]"><Icon name="profile" size={27} /></span><div><h2 className="font-display text-xl font-bold">{user.full_name}</h2><p className="mt-1 text-sm text-[#71827a]">{user.email}</p><p className="mt-1 text-xs font-bold text-[#168b62]">Signed in</p></div></div>
      <form onSubmit={saveProfile} className="pt-5"><label className="block text-xs font-bold text-[#52685e]">Health profile<select value={profile} onChange={event => onChangeProfile(event.target.value)} className="mt-2 w-full rounded-xl border border-[#cfddd5] bg-[#fbfdfb] px-3.5 py-3 text-sm">{PROFILES.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><p className="mt-2 text-xs text-[#71827a]">Route recommendations use your {label} profile.</p>
        {message && <p className="mt-4 text-sm font-semibold text-[#168b62]">{message}</p>}{error && <p className="mt-4 text-sm font-semibold text-[#b64d42]">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button disabled={saving || profile === user.health_profile} className="rounded-xl bg-[#168b62] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? "Saving…" : "Save health profile"}</button><button type="button" onClick={onLogout} className="rounded-xl border border-[#cfddd5] px-5 py-3 text-sm font-bold text-[#52685e] hover:bg-[#f7faf7]">Log out</button></div>
      </form>
    </section>
  </main>;
}
