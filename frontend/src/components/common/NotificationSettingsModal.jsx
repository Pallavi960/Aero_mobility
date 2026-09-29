import React, { useEffect, useState } from "react";
import { notificationService } from "../../services/notificationService";

export default function NotificationSettingsModal({ isOpen, onClose, userKey, onSettingsSaved }) {
  const [settings, setSettings] = useState(() => notificationService.getSettings(userKey));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setSettings(notificationService.getSettings(userKey));
  }, [isOpen, userKey]);

  if (!isOpen) return null;

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    const saved = notificationService.saveSettings(userKey, settings);
    if (onSettingsSaved) onSettingsSaved(saved);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl border border-[#cbe4d5] bg-white p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2efe7]">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#168b62]">Preferences</p>
            <h3 className="font-display text-base font-bold text-[#17352b]">
              Notification Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[#7c978b] hover:bg-[#f0f6f2] flex items-center justify-center font-bold text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          {/* Main Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#f4faf6] border border-[#d6ebe0]">
            <div>
              <p className="text-xs font-bold text-[#17352b]">Environmental alerts</p>
              <p className="text-[11px] text-[#5b7a6e]">Enable real-time environmental monitoring notifications</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle("enabled")}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings.enabled ? "bg-[#168b62]" : "bg-[#cfded6]"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Sub-Alert Options (Disabled if master is off) */}
          <div className={`space-y-2.5 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}>
            {/* High AQI Alerts */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e2ece6]">
              <div>
                <p className="text-xs font-semibold text-[#17352b]">High AQI alerts</p>
                <p className="text-[10px] text-[#789087]">Alerts when AQI exceeds unhealthy thresholds</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("highAqi")}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.highAqi ? "bg-[#168b62]" : "bg-[#cfded6]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.highAqi ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Pollutant Alerts */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e2ece6]">
              <div>
                <p className="text-xs font-semibold text-[#17352b]">Pollutant alerts</p>
                <p className="text-[10px] text-[#789087]">Alerts when PM2.5, NO₂, or Ozone are elevated</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("pollutants")}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.pollutants ? "bg-[#168b62]" : "bg-[#cfded6]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.pollutants ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* High Temperature Alerts */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e2ece6]">
              <div>
                <p className="text-xs font-semibold text-[#17352b]">High temperature alerts</p>
                <p className="text-[10px] text-[#789087]">Alerts during severe heat conditions (≥38°C)</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("highTemperature")}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.highTemperature ? "bg-[#168b62]" : "bg-[#cfded6]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.highTemperature ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Notification Sound */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white border border-[#e2ece6]">
              <div>
                <p className="text-xs font-semibold text-[#17352b]">Notification sound</p>
                <p className="text-[10px] text-[#789087]">Play subtle audio tone on new environmental alert</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle("sound")}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  settings.sound ? "bg-[#168b62]" : "bg-[#cfded6]"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.sound ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e2efe7]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#d8e8de] text-xs font-bold text-[#456356] hover:bg-[#f3faf6] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#168b62] hover:bg-[#116e4e] text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
            >
              Save settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
