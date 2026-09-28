export function fmt(v, suffix = "") {
  return v === undefined || v === null ? "--" : `${v}${suffix}`;
}

export function aqiColor(aqi) {
  if (!aqi || aqi <= 50) return "#22c55e"; // Good - Green
  if (aqi <= 100) return "#eab308"; // Moderate - Yellow
  if (aqi <= 150) return "#f97316"; // Sensitive - Orange
  if (aqi <= 200) return "#ef4444"; // Unhealthy - Red
  if (aqi <= 300) return "#8b5cf6"; // Very Unhealthy - Purple
  return "#881337"; // Hazardous - Maroon
}

export function aqiLabel(aqi) {
  if (!aqi || aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy (Sensitive)";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

export function weatherCondition(code) {
  const c = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Rime fog", 51: "Light drizzle", 53: "Moderate drizzle",
    55: "Dense drizzle", 61: "Slight rain", 63: "Moderate rain", 65: "Heavy rain",
    71: "Slight snow", 73: "Moderate snow", 75: "Heavy snow",
    80: "Rain showers", 81: "Moderate showers", 82: "Violent showers",
    95: "Thunderstorm", 96: "Thunderstorm + hail", 99: "Heavy thunderstorm"
  };
  return c[code] || "Current conditions";
}

export function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}
