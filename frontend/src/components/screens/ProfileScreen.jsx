import React, { useState, useRef } from "react";
import { PROFILES } from "../../constants/appConstants";
import { authService } from "../../services/authService";
import { notificationService } from "../../services/notificationService";
import NotificationSettingsModal from "../common/NotificationSettingsModal";

// ── Lucide-style SVG Icons (small, 18–20px) ──────────────────────────────

function LeafIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.8 10-10 10Z" />
      <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
    </svg>
  );
}

function WindIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

function HeartPulseIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}

function UserRoundIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}

function BabyIcon({ className = "w-[18px] h-[18px]" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12h.01" />
      <path d="M15 12h.01" />
      <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
      <path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
    </svg>
  );
}

function SettingsIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function InfoIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function BellIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// ── Profile icon map ──────────────────────────────────────────────────────

const PROFILE_ICONS = {
  general: LeafIcon,
  respiratory: WindIcon,
  cardiovascular: HeartPulseIcon,
  elderly: UserRoundIcon,
  child: BabyIcon,
};

// ── Dynamic adaptation descriptions ──────────────────────────────────────

const ADAPTATION_TEXT = {
  general: "Route analysis considers air quality, traffic and journey conditions with balanced weighting across all factors.",
  respiratory: "Route analysis gives greater consideration to available particulate (PM2.5, PM10) and ozone conditions along each route.",
  cardiovascular: "Route analysis gives greater consideration to available NO₂, CO and traffic congestion conditions.",
  elderly: "Route analysis gives greater consideration to lower-pollution route conditions and overall environmental comfort.",
  child: "Route analysis gives greater consideration to available air-quality conditions with heightened sensitivity thresholds.",
};

export default function ProfileScreen({ user, onUpdateUser, activeProfile, onSelectProfile, onLogout }) {
  const [avatarError, setAvatarError] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const userKey = user?.id || user?.email || "guest";
  const avatarUrl = user?.profile_image || user?.avatar || null;
  const selectedProfile = PROFILES.find((profile) => profile.id === activeProfile);
  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "PV";

  // Notification settings state for the alerts section
  const notifSettings = notificationService.getSettings(userKey);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    setUploadError("");

    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type) && !file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file.");
      return;
    }

    // Convert file to base64 Data URL for instant persistence
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarError(false);
      const updated = authService.updateCurrentUser({ profile_image: dataUrl });
      if (updated && onUpdateUser) {
        onUpdateUser(updated);
      }
    };
    reader.onerror = () => {
      setUploadError("Please select a valid image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setUploadError("");
    setAvatarError(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    const updated = authService.updateCurrentUser({ profile_image: null });
    if (updated && onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 pb-20">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: PROFILE DETAILS
          ══════════════════════════════════════════════════════════════ */}
      <section className="mb-6 rounded-3xl border border-[#dbe7df] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Account</p>
            <h2 className="font-display text-xl font-bold text-[#17352b]">Profile Details</h2>
          </div>
          {onLogout && (
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-rose-200/80 bg-rose-50/70 px-3.5 py-2 text-xs font-bold text-rose-700 shadow-sm backdrop-blur-sm transition hover:border-rose-300 hover:bg-rose-100/80"
            >
              Log out
            </button>
          )}
        </div>

        {/* ── OPTIONAL PROFILE PHOTO UPLOADER ── */}
        <div className="mb-4 flex items-center gap-3.5 rounded-2xl bg-[#f7faf7] p-3.5 border border-[#e8f0eb]">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#d8e6dc] bg-white text-[#315447] overflow-hidden shadow-2xs">
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={user?.name || "Profile"}
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-sm font-bold text-[#315447]">{initials}</span>
            )}
          </div>

          <div className="flex flex-col gap-0.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#168b62] hover:text-[#127250] hover:underline"
              >
                {avatarUrl ? "Change photo" : "Add profile photo"}
              </button>
              {avatarUrl && (
                <>
                  <span className="text-xs text-[#b8ccc0]">·</span>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                  >
                    Remove photo
                  </button>
                </>
              )}
            </div>
            {uploadError && (
              <p className="text-[11px] font-semibold text-rose-600">{uploadError}</p>
            )}
          </div>
        </div>

        {/* ── PROFILE FIELDS ── */}
        <dl className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-[#f7faf7] p-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[#789087]">Name</dt>
            <dd className="mt-1 flex items-center gap-2.5 break-words text-sm font-bold text-[#315447]">
              <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#d8e6dc] bg-white text-[#315447] overflow-hidden">
                {avatarUrl && !avatarError ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "Profile"}
                    onError={() => setAvatarError(true)}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[9px] font-bold">{initials}</span>
                )}
              </div>
              <span>{user?.name || "—"}</span>
            </dd>
          </div>
          <div className="rounded-xl bg-[#f7faf7] p-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[#789087]">Email</dt>
            <dd className="mt-1 break-all text-sm font-bold text-[#315447]">{user?.email || "—"}</dd>
          </div>
          <div className="rounded-xl bg-[#f7faf7] p-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[#789087]">Age</dt>
            <dd className="mt-1 text-sm font-bold text-[#315447]">{user?.age ?? "—"}</dd>
          </div>
          <div className="rounded-xl bg-[#f7faf7] p-3">
            <dt className="text-[10px] font-bold uppercase tracking-wide text-[#789087]">Health Profile</dt>
            <dd className="mt-1 text-sm font-bold text-[#315447] flex items-center gap-1.5">
              {selectedProfile && PROFILE_ICONS[selectedProfile.id] && (
                React.createElement(PROFILE_ICONS[selectedProfile.id], { className: "w-3.5 h-3.5 text-[#168b62]" })
              )}
              <span>{selectedProfile?.name || "General"}</span>
            </dd>
          </div>
        </dl>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: HEALTH PROFILE
          ══════════════════════════════════════════════════════════════ */}
      <section className="mb-6">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Personalization</p>
          <h2 className="font-display text-xl font-bold text-[#17352b]">Health Profile</h2>
          <p className="text-xs text-[#789087] mt-1">
            Choose the profile used by AeroMobility for personalized route analysis.
          </p>
        </div>

        <div className="space-y-2.5">
          {PROFILES.map((p) => {
            const isCurrent = p.id === activeProfile;
            const IconComponent = PROFILE_ICONS[p.id] || LeafIcon;

            return (
              <div
                key={p.id}
                onClick={() => onSelectProfile(p.id)}
                className={`cursor-pointer rounded-2xl border px-4 py-3.5 transition ${
                  isCurrent
                    ? "border-[#168b62] bg-[#f7fcf9] ring-2 ring-[#168b62]/20 shadow-sm"
                    : "border-[#dbe7df] bg-white hover:border-[#a8cfc0]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl mt-0.5 ${
                      isCurrent
                        ? "bg-[#168b62]/10 text-[#168b62]"
                        : "bg-[#f0f5f1] text-[#60776c]"
                    }`}>
                      <IconComponent className="w-[18px] h-[18px]" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#17352b] leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-[#60776c] mt-0.5 leading-relaxed">{p.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-3 py-1 rounded-lg transition shrink-0 ${
                      isCurrent
                        ? "bg-[#168b62] text-white"
                        : "bg-[#edf5f0] text-[#168b62]"
                    }`}
                  >
                    {isCurrent ? "Active" : "Select"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: HOW AEROMOBILITY ADAPTS
          ══════════════════════════════════════════════════════════════ */}
      <section className="mb-6 rounded-2xl border border-[#dbe7df] bg-gradient-to-br from-[#f7fcf9] to-[#ffffff] p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#168b62]/10 text-[#168b62]">
            <InfoIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Intelligence</p>
            <h3 className="text-sm font-bold text-[#17352b]">How AeroMobility Adapts</h3>
          </div>
        </div>
        <p className="text-xs text-[#5b7a6e] leading-relaxed">
          Your selected profile influences how available route conditions are considered during journey analysis.
        </p>
        <div className="mt-3 rounded-xl bg-white/80 border border-[#e2efe7] p-3">
          <div className="flex items-center gap-2 mb-1.5">
            {selectedProfile && PROFILE_ICONS[selectedProfile.id] && (
              React.createElement(PROFILE_ICONS[selectedProfile.id], { className: "w-3.5 h-3.5 text-[#168b62]" })
            )}
            <span className="text-[11px] font-bold text-[#168b62]">{selectedProfile?.name || "General"} profile</span>
          </div>
          <p className="text-[11px] text-[#456356] leading-relaxed">
            {ADAPTATION_TEXT[activeProfile] || ADAPTATION_TEXT.general}
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: AIR QUALITY ALERTS
          ══════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-[#dbe7df] bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-[#168b62]/10 text-[#168b62]">
              <BellIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Monitoring</p>
              <h3 className="text-sm font-bold text-[#17352b]">Air Quality Alerts</h3>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#f7faf7] border border-[#e8f0eb]">
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${
              notifSettings.highAqi ? "bg-[#168b62] text-white" : "bg-[#e2ece6] text-[#789087]"
            }`}>
              {notifSettings.highAqi && <CheckIcon className="w-3 h-3" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#17352b]">Route AQI alerts</p>
              <p className="text-[10px] text-[#789087]">Alerts when AQI exceeds unhealthy thresholds</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#f7faf7] border border-[#e8f0eb]">
            <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-md ${
              notifSettings.pollutants ? "bg-[#168b62] text-white" : "bg-[#e2ece6] text-[#789087]"
            }`}>
              {notifSettings.pollutants && <CheckIcon className="w-3 h-3" />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#17352b]">Significant AQI changes</p>
              <p className="text-[10px] text-[#789087]">Alerts when PM2.5, NO₂, or temperature are elevated</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNotifSettingsOpen(true)}
          className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#edf5f0] text-[#168b62] text-xs font-bold border border-[#d0e8db] hover:bg-[#e2f0e9] transition"
        >
          <SettingsIcon className="w-3.5 h-3.5" />
          Notification Settings
        </button>
      </section>

      {/* Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={notifSettingsOpen}
        onClose={() => setNotifSettingsOpen(false)}
        userKey={userKey}
      />
    </div>
  );
}
