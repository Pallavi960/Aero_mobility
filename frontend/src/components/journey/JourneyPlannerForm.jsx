import React from "react";
import StationPicker from "../common/StationPicker";
import { PROFILES } from "../../constants/appConstants";

export default function JourneyPlannerForm({
  origin,
  setOrigin,
  originText,
  setOriginText,
  destination,
  setDestination,
  destinationText,
  setDestinationText,
  healthProfile,
  setHealthProfile,
  loadingRoutes,
  routeError,
  onFindRoutes,
  onUseLocation,
}) {
  return (
    <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col justify-between rounded-3xl border border-[#d0e5d8] bg-white p-5 sm:p-6 shadow-sm">
      <div>
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e8f7ee] text-[#168b62] border border-[#c4e9d3] mb-1.5">
            🍃 Smart Clean Mobility
          </span>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-[#17352b]">
            Find a cleaner route
          </h2>
          <p className="text-xs text-[#60776c] mt-0.5">
            AI environmental routing avoiding severe pollution and congestion.
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-3 mb-4">
          {/* FROM Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#789087]">From (Origin)</label>
              <button
                type="button"
                onClick={onUseLocation}
                className="text-[11px] font-bold text-[#168b62] hover:underline flex items-center gap-0.5"
              >
                📍 Use my location
              </button>
            </div>
            <StationPicker
              label="origin"
              text={originText}
              setText={setOriginText}
              onSelect={(st) => setOrigin(st)}
              placeholder="Search origin station"
            />
          </div>

          {/* TO Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
              To (Destination)
            </label>
            <StationPicker
              label="destination"
              text={destinationText}
              setText={setDestinationText}
              onSelect={(st) => setDestination(st)}
              placeholder="Search destination station"
            />
          </div>
        </div>

        {/* Health Profile Selection */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
            Health Profile
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {PROFILES.map((p) => {
              const selected = p.id === healthProfile;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setHealthProfile(p.id)}
                  className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                    selected
                      ? "border-[#168b62] bg-[#f0f8f3] ring-2 ring-[#168b62]/20"
                      : "border-[#dbe7df] bg-[#fdfdfd] hover:border-[#b4d6c4]"
                  }`}
                >
                  <span className="text-base shrink-0">{p.icon}</span>
                  <span className="text-xs font-bold text-[#17352b] truncate">{p.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {routeError && (
          <div className="mb-3 p-3 rounded-xl bg-[#fff2f0] border border-[#f5c4be] text-xs font-semibold text-[#b64d42]">
            ⚠️ {routeError}
          </div>
        )}
      </div>

      {/* Submit Action */}
      <button
        type="button"
        disabled={loadingRoutes}
        onClick={() => onFindRoutes()}
        className="w-full py-3.5 rounded-2xl bg-[#168b62] hover:bg-[#127250] text-white text-sm font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
      >
        {loadingRoutes ? (
          <>
            <span className="animate-spin text-base">⏳</span>
            <span>Analyzing cleaner paths…</span>
          </>
        ) : (
          <>
            <span>Find cleaner routes</span>
            <span>→</span>
          </>
        )}
      </button>
    </div>
  );
}
