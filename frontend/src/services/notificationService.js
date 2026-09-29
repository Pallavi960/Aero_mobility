// Real-time environmental notification service
import { aqiLabel } from "../utils/formatters";

const NOTIF_SETTINGS_KEY = (userKey) => `aeromobility_notif_settings_${userKey || "guest"}`;
const NOTIF_LIST_KEY = (userKey) => `aeromobility_notifications_${userKey || "guest"}`;
const NOTIF_FINGERPRINTS_KEY = (userKey) => `aeromobility_notif_fps_${userKey || "guest"}`;

const DEFAULT_SETTINGS = {
  enabled: true,
  highAqi: true,
  pollutants: true,
  highTemperature: true,
  sound: false, // Sound is OFF by default
};

let audioCtx = null;

export const notificationService = {
  getSettings(userKey) {
    try {
      const stored = localStorage.getItem(NOTIF_SETTINGS_KEY(userKey));
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(userKey, newSettings) {
    try {
      const merged = { ...this.getSettings(userKey), ...newSettings };
      localStorage.setItem(NOTIF_SETTINGS_KEY(userKey), JSON.stringify(merged));
      return merged;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  getNotifications(userKey) {
    try {
      const stored = localStorage.getItem(NOTIF_LIST_KEY(userKey));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  saveNotifications(userKey, notifs) {
    try {
      localStorage.setItem(NOTIF_LIST_KEY(userKey), JSON.stringify(notifs.slice(0, 30)));
    } catch {
      // ignore
    }
  },

  markAsRead(userKey, notifId) {
    const notifs = this.getNotifications(userKey);
    const updated = notifs.map((n) => (n.id === notifId ? { ...n, read: true } : n));
    this.saveNotifications(userKey, updated);
    return updated;
  },

  markAllAsRead(userKey) {
    const notifs = this.getNotifications(userKey);
    const updated = notifs.map((n) => ({ ...n, read: true }));
    this.saveNotifications(userKey, updated);
    return updated;
  },

  playChime() {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtx) audioCtx = new AudioContextClass();
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Audio playback fails silently if browser policy blocks autoplay
    }
  },

  /**
   * Evaluate actual environmental conditions and generate notifications if criteria are met.
   * Deduplicates against recently raised alerts to prevent spam.
   */
  evaluateEnvironmentalData(userKey, { weather, airQuality, healthProfile, originName }) {
    const settings = this.getSettings(userKey);
    if (!settings.enabled) return this.getNotifications(userKey);

    const currentNotifs = this.getNotifications(userKey);
    let fingerprints = {};
    try {
      fingerprints = JSON.parse(localStorage.getItem(NOTIF_FINGERPRINTS_KEY(userKey)) || "{}");
    } catch {
      fingerprints = {};
    }

    const now = Date.now();
    const newAlerts = [];
    const locationStr = originName ? `${originName}` : "Current origin";

    // 1. High AQI Check
    if (settings.highAqi && airQuality) {
      const aqiVal = airQuality.us_aqi != null ? Number(airQuality.us_aqi) : airQuality.aqi != null ? Number(airQuality.aqi) : null;
      if (Number.isFinite(aqiVal) && aqiLabel(aqiVal).startsWith("Unhealthy")) {
        const severity = aqiVal >= 150 ? "high" : "moderate";
        const fpKey = `aqi_${severity}_${Math.floor(aqiVal / 25)}`;
        const lastCreated = fingerprints[fpKey] || 0;
        if (!lastCreated) {
          fingerprints[fpKey] = now;
          newAlerts.push({
            id: `notif_${now}_aqi`,
            type: "aqi",
            title: aqiVal >= 150 ? "High AQI Alert" : "Elevated AQI",
            message: `Current AQI at ${locationStr} is ${Math.round(aqiVal)}. Air quality conditions have worsened.`,
            severity,
            timestamp: new Date().toISOString(),
            read: false,
            source: locationStr,
            value: aqiVal,
          });
        }
      }
      // Clear inactive AQI fingerprints so a later crossing can alert again.
      if (!Number.isFinite(aqiVal) || !aqiLabel(aqiVal).startsWith("Unhealthy")) {
        Object.keys(fingerprints).filter((key) => key.startsWith("aqi_")).forEach((key) => delete fingerprints[key]);
      }
    }

    // 2. High Pollutants Check
    if (settings.pollutants && airQuality) {
      // PM2.5
      if (airQuality.pm2_5 != null && Number.isFinite(Number(airQuality.pm2_5)) && Number(airQuality.pm2_5) > 60) {
        const pmVal = Math.round(Number(airQuality.pm2_5) * 10) / 10;
        const fpKey = `pm25_${Math.floor(pmVal / 30)}`;
        const lastCreated = fingerprints[fpKey] || 0;
        if (!lastCreated) {
          fingerprints[fpKey] = now;
          newAlerts.push({
            id: `notif_${now}_pm25`,
            type: "pollutant",
            title: "Elevated PM2.5",
            message: `PM2.5 is currently elevated at ${pmVal} µg/m³ at ${locationStr}.`,
            severity: pmVal > 120 ? "high" : "moderate",
            timestamp: new Date().toISOString(),
            read: false,
            source: locationStr,
            value: pmVal,
          });
        }
      }
      if (airQuality.pm2_5 == null || !Number.isFinite(Number(airQuality.pm2_5)) || Number(airQuality.pm2_5) <= 60) {
        Object.keys(fingerprints).filter((key) => key.startsWith("pm25_")).forEach((key) => delete fingerprints[key]);
      }

      // NO2
      if (airQuality.nitrogen_dioxide != null && Number.isFinite(Number(airQuality.nitrogen_dioxide)) && Number(airQuality.nitrogen_dioxide) > 60) {
        const no2Val = Math.round(Number(airQuality.nitrogen_dioxide) * 10) / 10;
        const fpKey = `no2_${Math.floor(no2Val / 40)}`;
        const lastCreated = fingerprints[fpKey] || 0;
        if (!lastCreated) {
          fingerprints[fpKey] = now;
          newAlerts.push({
            id: `notif_${now}_no2`,
            type: "pollutant",
            title: "Elevated NO₂",
            message: `NO₂ levels are currently elevated at ${no2Val} µg/m³ at ${locationStr}.`,
            severity: "moderate",
            timestamp: new Date().toISOString(),
            read: false,
            source: locationStr,
            value: no2Val,
          });
        }
      }
      if (airQuality.nitrogen_dioxide == null || !Number.isFinite(Number(airQuality.nitrogen_dioxide)) || Number(airQuality.nitrogen_dioxide) <= 60) {
        Object.keys(fingerprints).filter((key) => key.startsWith("no2_")).forEach((key) => delete fingerprints[key]);
      }

      // Ozone elevation uses the threshold already applied to the respiratory profile.
      if (airQuality.ozone != null && Number.isFinite(Number(airQuality.ozone)) && Number(airQuality.ozone) > 80) {
        const ozoneVal = Math.round(Number(airQuality.ozone) * 10) / 10;
        const fpKey = `ozone_${Math.floor(ozoneVal / 20)}`;
        if (!fingerprints[fpKey]) {
          fingerprints[fpKey] = now;
          newAlerts.push({
            id: `notif_${now}_ozone`,
            type: "pollutant",
            title: "Elevated Ozone",
            message: `Ozone is currently elevated at ${ozoneVal} µg/m³ at ${locationStr}.`,
            severity: "moderate",
            timestamp: new Date().toISOString(),
            read: false,
            source: locationStr,
            value: ozoneVal,
          });
        }
      } else {
        Object.keys(fingerprints).filter((key) => key.startsWith("ozone_")).forEach((key) => delete fingerprints[key]);
      }
    }

    // 3. High Temperature Check
    if (settings.highTemperature && weather) {
      const tempVal = weather.temperature_2m != null ? Number(weather.temperature_2m) : null;
      if (Number.isFinite(tempVal) && tempVal >= 38) {
        const fpKey = `temp_${Math.floor(tempVal / 3)}`;
        const lastCreated = fingerprints[fpKey] || 0;
        if (!lastCreated) {
          fingerprints[fpKey] = now;
          newAlerts.push({
            id: `notif_${now}_temp`,
            type: "temperature",
            title: "High Temperature",
            message: `Current temperature is ${Math.round(tempVal)}°C. Stay hydrated during transit.`,
            severity: tempVal >= 42 ? "high" : "moderate",
            timestamp: new Date().toISOString(),
            read: false,
            source: locationStr,
            value: tempVal,
          });
        }
      }
      if (!Number.isFinite(tempVal) || tempVal < 38) {
        Object.keys(fingerprints).filter((key) => key.startsWith("temp_")).forEach((key) => delete fingerprints[key]);
      }
    }

    // 4. Health Profile Aware Checks
    const pKey = (healthProfile || "").toLowerCase();
    if (airQuality && pKey === "respiratory" && ((Number.isFinite(Number(airQuality.pm2_5)) && Number(airQuality.pm2_5) > 60) || (Number.isFinite(Number(airQuality.ozone)) && Number(airQuality.ozone) > 80))) {
      const fpKey = `profile_resp_${Math.floor((Number(airQuality.pm2_5) || Number(airQuality.ozone)) / 25)}`;
      const lastCreated = fingerprints[fpKey] || 0;
      if (!lastCreated) {
        fingerprints[fpKey] = now;
        newAlerts.push({
          id: `notif_${now}_resp`,
          type: "profile",
          title: "Respiratory Sensitivity Notice",
          message: `Available particulate or ozone conditions are elevated. Your selected respiratory-sensitivity profile may warrant checking available route conditions.`,
          severity: "moderate",
          timestamp: new Date().toISOString(),
          read: false,
          source: locationStr,
        });
      }
    } else if (airQuality && pKey === "cardiovascular" && ((Number.isFinite(Number(airQuality.nitrogen_dioxide)) && Number(airQuality.nitrogen_dioxide) > 60) || (Number.isFinite(Number(airQuality.carbon_monoxide)) && Number(airQuality.carbon_monoxide) > 1000))) {
      const fpKey = `profile_cardio_${Math.floor((airQuality.nitrogen_dioxide || 0) / 25)}`;
      const lastCreated = fingerprints[fpKey] || 0;
      if (!lastCreated) {
        fingerprints[fpKey] = now;
        newAlerts.push({
          id: `notif_${now}_cardio`,
          type: "profile",
          title: "Cardiovascular Sensitivity Notice",
          message: `Available NO₂/CO conditions are elevated. Check available route conditions before starting your journey.`,
          severity: "moderate",
          timestamp: new Date().toISOString(),
          read: false,
          source: locationStr,
        });
      }
    }

    try {
      localStorage.setItem(NOTIF_FINGERPRINTS_KEY(userKey), JSON.stringify(fingerprints));
    } catch {
      // Alerts still remain available for this session if storage is unavailable.
    }

    if (newAlerts.length > 0) {
      const combined = [...newAlerts, ...currentNotifs].slice(0, 30);
      this.saveNotifications(userKey, combined);

      // Trigger sound if enabled
      if (settings.sound) {
        this.playChime();
      }
      return combined;
    }

    return currentNotifs;
  },
};
