export function aqiCategory(aqi) {
  if (aqi == null || !Number.isFinite(Number(aqi))) {
    return { label: "Unavailable", color: "#60776c", background: "#f1f5f2" };
  }

  const value = Number(aqi);
  if (value <= 50) return { label: "Good", color: "#26734d", background: "#e7f3e9" };
  if (value <= 100) return { label: "Moderate", color: "#8a6b08", background: "#fbf2d6" };
  if (value <= 150) return { label: "Unhealthy for sensitive groups", color: "#a75a12", background: "#fff0df" };
  if (value <= 200) return { label: "Unhealthy", color: "#ad3737", background: "#fde8e6" };
  if (value <= 300) return { label: "Very unhealthy", color: "#ad3737", background: "#fde8e6" };
  return { label: "Hazardous", color: "#7a2929", background: "#f3e5e5" };
}
