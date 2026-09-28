import logging
import os
import requests
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are AeroMobility Assistant, an AI travel and air-quality guide inside the AeroMobility application.

Use only the supplied AeroMobility context and verified external information.
Never invent AQI, weather, traffic, route, destination, or pollutant values.
The existing AeroMobility route engine is the source of truth.
Never override or replace the application's route recommendation.
Explain existing route results clearly.
When a health profile is supplied, explain AQI and route information in that context.
Do not provide medical diagnosis, treatment, prescriptions, or medical guarantees.
Always use careful phrasing like "Based on the available AQI and route data...".
Keep answers concise and useful.
Prefer a short explanation followed by 2–4 bullet points when appropriate.
If information is unavailable, say that it is unavailable rather than guessing."""


def _get_xai_api_key():
    load_dotenv(override=True)
    key = os.getenv("XAI_API_KEY", "").strip()
    if "XAI_API_KEY:" in key:
        key = "xai-" + key.split("XAI_API_KEY:")[-1].strip()
    return key


def _get_serpapi_key():
    load_dotenv(override=True)
    return os.getenv("SERPAPI_KEY", "").strip()


def query_serpapi_if_needed(query, origin=None, destination=None):
    """
    Query SerpApi only when current external info or destination/local places
    are explicitly requested and not present in standard journey telemetry.
    """
    serpapi_key = _get_serpapi_key()
    if not serpapi_key or serpapi_key in ["your_serpapi_key", ""]:
        return None

    trigger_words = [
        "what to do", "places to visit", "attractions", "restaurants",
        "landmarks", "parking", "find nearby", "explore"
    ]
    q_lower = query.lower()
    needs_external = any(tw in q_lower for tw in trigger_words)

    if not needs_external:
        return None

    try:
        search_query = query
        if destination and isinstance(destination, str) and destination not in query:
            search_query = f"{query} near {destination}"

        params = {
            "engine": "google",
            "q": search_query,
            "api_key": serpapi_key,
            "num": 3
        }
        resp = requests.get("https://serpapi.com/search.json", params=params, timeout=5)
        if resp.ok:
            data = resp.json()
            snippets = []
            for res in data.get("organic_results", [])[:3]:
                title = res.get("title", "")
                snippet = res.get("snippet", "")
                if snippet:
                    snippets.append(f"- {title}: {snippet}")
            if snippets:
                return "\n".join(snippets)
    except Exception as exc:
        logger.warning("SerpApi lookup non-fatal error: %s", exc)

    return None


def format_aeromobility_context(context_data):
    """
    Format the application state (routes, AQI, weather, pollutants, health profile)
    into a structured context prompt for Grok.
    """
    if not context_data or not isinstance(context_data, dict):
        return "No active journey searched yet."

    sections = []

    # Active page
    active_tab = context_data.get("activeTab", "home")
    sections.append(f"Current Screen: {active_tab.upper()}")

    # Journey details
    origin = context_data.get("origin")
    dest = context_data.get("destination")
    if origin or dest:
        origin_str = origin.get("station_name") if isinstance(origin, dict) else str(origin or "Not set")
        dest_str = dest.get("station_name") if isinstance(dest, dict) else str(dest or "Not set")
        sections.append(f"Journey: From '{origin_str}' To '{dest_str}'")

    # Health Profile
    health_profile = context_data.get("healthProfile")
    if health_profile:
        sections.append(f"User Health Profile: {health_profile}")

    # Routes & Recommendations
    routes = context_data.get("routes")
    if routes and isinstance(routes, list) and len(routes) > 0:
        route_lines = ["Available Routes (Calculated by AeroMobility Engine):"]
        for r in routes:
            r_id = r.get("route_id", "Route")
            rec = " [OFFICIALLY RECOMMENDED BY AEROMOBILITY]" if r.get("is_recommended") or r.get("recommended") else ""
            dur = r.get("travel_time_minutes") or r.get("duration") or "N/A"
            dist = r.get("distance_km") or r.get("distance") or "N/A"
            aqi = r.get("aqi") or r.get("average_aqi") or "N/A"
            peak_aqi = r.get("peak_aqi") or "N/A"
            score = r.get("score") or "N/A"
            traffic = r.get("traffic_delay_minutes", 0)
            traffic_str = f" (+{traffic}m delay)" if traffic else " (normal flow)"

            route_lines.append(
                f"- {r_id}{rec}: Duration ~{dur} min, Distance ~{dist} km, "
                f"Avg AQI: {aqi}, Peak AQI: {peak_aqi}, Traffic: {traffic_str}, Composite Score: {score}"
            )
        sections.append("\n".join(route_lines))

    # Current Environmental Conditions & Pollutants
    curr_aqi = context_data.get("currentAQI")
    if curr_aqi is not None:
        sections.append(f"Current Origin AQI: {curr_aqi}")

    weather = context_data.get("weather")
    if weather and isinstance(weather, dict):
        w_parts = []
        if "temperature_2m" in weather:
            w_parts.append(f"Temperature: {weather['temperature_2m']}°C")
        if "apparent_temperature" in weather:
            w_parts.append(f"Feels Like: {weather['apparent_temperature']}°C")
        if "relative_humidity_2m" in weather:
            w_parts.append(f"Humidity: {weather['relative_humidity_2m']}%")
        if "wind_speed_10m" in weather:
            w_parts.append(f"Wind Speed: {weather['wind_speed_10m']} km/h")
        if w_parts:
            sections.append(f"Current Weather: {', '.join(w_parts)}")

    pollutants = context_data.get("pollutants")
    if pollutants and isinstance(pollutants, dict):
        p_parts = []
        for k, v in pollutants.items():
            if v is not None:
                p_parts.append(f"{k}: {v} µg/m³")
        if p_parts:
            sections.append(f"Live Pollutants: {', '.join(p_parts)}")

    # Forecast
    forecast = context_data.get("forecast")
    if forecast and isinstance(forecast, list) and len(forecast) > 0:
        fc_samples = forecast[:6]
        fc_str = ", ".join([f"{item.get('time', '')}: AQI {item.get('predicted_aqi') or item.get('aqi', 'N/A')}" for item in fc_samples])
        sections.append(f"Upcoming 24h AQI Trend (Next few intervals): {fc_str}")

    # Selected History Trip (if on History page)
    selected_trip = context_data.get("selectedTrip")
    if selected_trip and isinstance(selected_trip, dict):
        from_n = selected_trip.get("from", {}).get("name", "Origin")
        to_n = selected_trip.get("to", {}).get("name", "Destination")
        rr = selected_trip.get("recommendedRoute", {})
        sections.append(f"Selected Historic Record: {from_n} to {to_n} (Best Route: {rr.get('routeId')}, AQI: {rr.get('aqi')}, Time: {rr.get('travelTimeMinutes')} min)")

    return "\n\n".join(sections)


def fallback_contextual_answer(message, context_data):
    """
    Provides an accurate, instant contextual answer using real AeroMobility data
    if the external AI API is unreachable or rate-limited.
    """
    msg_low = (message or "").lower()
    routes = (context_data or {}).get("routes", [])
    profile = (context_data or {}).get("healthProfile", "general")
    rec_route = next((r for r in routes if r.get("is_recommended") or r.get("recommended")), None)
    if not rec_route and routes:
        rec_route = routes[0]

    if "why" in msg_low and "recommended" in msg_low:
        if not routes:
            return "Please enter an origin and destination on the Home screen and click 'Find Cleanest Routes' to see the recommended route analysis."
        dur = rec_route.get("travel_time_minutes", "N/A")
        aqi = rec_route.get("aqi", "N/A")
        score = rec_route.get("score", "N/A")
        r_id = rec_route.get("route_id", "The top route")
        return (
            f"Based on the available AQI and route data, **{r_id}** is recommended because it provides the best composite balance for your **{profile}** profile:\n\n"
            f"• **Air Quality:** Average AQI is ~{aqi}, minimizing exposure.\n"
            f"• **Travel Time:** Estimated duration is ~{dur} minutes with current traffic.\n"
            f"• **Composite Score:** Achieved the highest multi-factor safety score ({score}/100)."
        )

    if "lowest aqi" in msg_low or "cleanest" in msg_low:
        if not routes:
            return "Search for a route on Home to view real-time AQI rankings across all paths."
        sorted_by_aqi = sorted(routes, key=lambda x: x.get("aqi", 9999))
        best = sorted_by_aqi[0]
        return (
            f"Based on the available route data, **{best.get('route_id', 'Route')}** has the lowest air pollution levels:\n\n"
            f"• **Average AQI:** {best.get('aqi')} (Peak: {best.get('peak_aqi', 'N/A')})\n"
            f"• **Duration:** ~{best.get('travel_time_minutes')} minutes\n"
            f"• **Distance:** ~{best.get('distance_km')} km"
        )

    if "fastest" in msg_low or "quickest" in msg_low:
        if not routes:
            return "Search for a route on Home to calculate travel durations."
        sorted_by_time = sorted(routes, key=lambda x: x.get("travel_time_minutes", 9999))
        fastest = sorted_by_time[0]
        return (
            f"Based on live traffic conditions, **{fastest.get('route_id', 'Route')}** is the fastest path:\n\n"
            f"• **Travel Time:** ~{fastest.get('travel_time_minutes')} minutes\n"
            f"• **Distance:** ~{fastest.get('distance_km')} km\n"
            f"• **AQI Level:** {fastest.get('aqi')}"
        )

    if "traffic" in msg_low:
        if not routes:
            return "Enter your starting point and destination to analyze real-time road congestion along all corridors."
        parts = []
        for r in routes:
            delay = r.get("traffic_delay_minutes", 0)
            status = f"+{delay} min delay due to congestion" if delay > 0 else "smooth / free flow"
            parts.append(f"• **{r.get('route_id')}:** ~{r.get('travel_time_minutes')} min ({status})")
        return "Current traffic breakdown along evaluated routes:\n\n" + "\n".join(parts)

    if "compare" in msg_low:
        if not routes:
            return "Calculate routes on the Home screen to view a side-by-side comparison."
        parts = []
        for r in routes:
            rec_tag = " ⭐ (Recommended)" if r.get("is_recommended") else ""
            parts.append(f"• **{r.get('route_id')}{rec_tag}:** {r.get('travel_time_minutes')} min | {r.get('distance_km')} km | AQI: {r.get('aqi')} | Score: {r.get('score')}")
        return "Route Comparison Summary:\n\n" + "\n".join(parts)

    if "what does" in msg_low and "aqi mean" in msg_low or "aqi mean" in msg_low:
        return (
            "Air Quality Index (AQI) indicates the health risk of the surrounding air:\n\n"
            "• **0–50 (Good):** Air quality is satisfactory; minimal risk.\n"
            "• **51–100 (Moderate):** Acceptable; sensitive individuals should take caution.\n"
            "• **101–200 (Unhealthy for Sensitive Groups):** High risk for respiratory/cardiac conditions.\n"
            "• **201–300 (Poor / Severe):** Health alert; everyone may experience health effects.\n"
            "• **300+ (Hazardous):** Emergency conditions; avoid outdoor exertion."
        )

    if "forecast" in msg_low:
        return (
            "The 24-hour AQI forecast is generated by AeroMobility's Deep Learning GRU Neural Network. It analyzes historical 72-hour pollution trends, temperature, wind velocity, and humidity to predict diurnal smog and ventilation shifts."
        )

    if "weather" in msg_low:
        w = (context_data or {}).get("weather", {})
        if w:
            return (
                f"Current meteorological conditions at origin:\n\n"
                f"• **Temperature:** {w.get('temperature_2m', 'N/A')}°C (Feels like {w.get('apparent_temperature', 'N/A')}°C)\n"
                f"• **Humidity:** {w.get('relative_humidity_2m', 'N/A')}%\n"
                f"• **Wind Speed:** {w.get('wind_speed_10m', 'N/A')} km/h"
            )
        return "Current weather telemetry is available once an origin station is active on the Home screen."

    return (
        "I'm here to help you navigate cleaner routes, explain real-time AQI levels, and compare travel conditions. "
        "Feel free to ask about your route options, traffic congestion, or air quality forecasts!"
    )


def generate_chat_response(message, context_data=None, history=None):
    """
    Calls xAI / Grok model with multiple fallback models and robust context formatting.
    """
    xai_key = _get_xai_api_key()

    # Format real application context
    app_context = format_aeromobility_context(context_data)

    # Check for SerpApi external info if needed
    dest_name = ""
    if context_data and isinstance(context_data, dict):
        d = context_data.get("destination")
        if isinstance(d, dict):
            dest_name = d.get("station_name", "")

    serp_snippet = query_serpapi_if_needed(message, destination=dest_name)

    augmented_system_prompt = f"{SYSTEM_PROMPT}\n\n--- REAL APPLICATION CONTEXT ---\n{app_context}"
    if serp_snippet:
        augmented_system_prompt += f"\n\n--- VERIFIED EXTERNAL LOCAL DATA (SERPAPI) ---\n{serp_snippet}"

    # Build messages array with limited recent history (up to 6 turns)
    messages = [{"role": "system", "content": augmented_system_prompt}]

    if history and isinstance(history, list):
        for msg in history[-6:]:
            role = msg.get("role")
            content = msg.get("content", "")
            if role in ["user", "assistant"] and content:
                messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": message})

    # Try models in order: configured model -> grok-2-latest -> grok-beta -> grok-2
    models_to_try = [
        os.getenv("XAI_MODEL", "grok-2-latest").strip() or "grok-2-latest",
        "grok-2-latest",
        "grok-beta",
        "grok-2"
    ]
    # Remove duplicate entries while preserving order
    seen = set()
    models_to_try = [m for m in models_to_try if not (m in seen or seen.add(m))]

    if xai_key:
        headers = {
            "Authorization": f"Bearer {xai_key}",
            "Content-Type": "application/json"
        }

        for model_name in models_to_try:
            payload = {
                "model": model_name,
                "messages": messages,
                "temperature": 0.3,
                "max_tokens": 600
            }

            try:
                resp = requests.post(
                    "https://api.x.ai/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=15
                )

                if resp.status_code == 200:
                    data = resp.json()
                    reply = data["choices"][0]["message"]["content"]
                    return {"success": True, "reply": reply}
                else:
                    logger.warning("xAI model '%s' returned HTTP %s: %s", model_name, resp.status_code, resp.text)
            except Exception as exc:
                logger.warning("xAI model '%s' request error: %s", model_name, exc)

    # If xAI was offline or key encountered issue, provide accurate local intelligence from live telemetry
    logger.info("Providing telemetry-grounded fallback response.")
    return {
        "success": True,
        "reply": fallback_contextual_answer(message, context_data)
    }
