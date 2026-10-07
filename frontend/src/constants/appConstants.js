export const API = import.meta.env.VITE_API_BASE_URL || "";
export const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export const PROFILES = [
  { id: "general", name: "General", icon: "🌿", desc: "Standard sensitivity for general commuting." },
  { id: "respiratory", name: "Asthma / Respiratory", icon: "🫁", desc: "Sensitive to PM2.5, PM10 & Ozone (O₃)." },
  { id: "cardiovascular", name: "Cardiovascular", icon: "❤️", desc: "Sensitive to NO₂, CO & high traffic." },
  { id: "elderly", name: "Elderly", icon: "🧓", desc: "Prioritizes low-pollution pathways." },
  { id: "child", name: "Child", icon: "🧒", desc: "Extra sensitive to all air pollutants." },
];

export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 }; // New Delhi center
export const WEATHER_API = "https://api.open-meteo.com/v1/forecast";
export const AIR_QUALITY_API = "https://air-quality-api.open-meteo.com/v1/air-quality";

// Primary navigation items
export const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "history", label: "History", icon: "◷" },
  { id: "map", label: "Map", icon: "◎" },
  { id: "about", label: "About", icon: "ⓘ" },
];
