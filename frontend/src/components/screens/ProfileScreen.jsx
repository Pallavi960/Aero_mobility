import React, { useState, useRef } from "react";
import { PROFILES } from "../../constants/appConstants";
import { authService } from "../../services/authService";

export default function ProfileScreen({ user, onUpdateUser, activeProfile, onSelectProfile, onLogout }) {
  const [avatarError, setAvatarError] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const avatarUrl = user?.profile_image || user?.avatar || null;
  const selectedProfile = PROFILES.find((profile) => profile.id === activeProfile);
  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "PV";

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
            <dd className="mt-1 text-sm font-bold text-[#315447]">{selectedProfile?.name || "General"}</dd>
          </div>
        </dl>
      </section>

      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Personalization</p>
        <h2 className="font-display text-2xl font-bold text-[#17352b]">Health Profiles</h2>
        <p className="text-xs text-[#789087] mt-1">
          AeroMobility dynamically recalibrates route evaluation weights to safeguard specific respiratory and cardiovascular sensitivities.
        </p>
      </div>

      <div className="space-y-3">
        {PROFILES.map((p) => {
          const isCurrent = p.id === activeProfile;
          return (
            <div
              key={p.id}
              onClick={() => onSelectProfile(p.id)}
              className={`cursor-pointer rounded-3xl border p-5 transition ${
                isCurrent
                  ? "border-[#168b62] bg-[#f7fcf9] ring-2 ring-[#168b62]/20 shadow-sm"
                  : "border-[#dbe7df] bg-white hover:border-[#a8cfc0]"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{p.icon}</span>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#17352b]">{p.name}</h3>
                    <p className="text-xs text-[#60776c] mt-0.5">{p.desc}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl transition shrink-0 ${
                    isCurrent
                      ? "bg-[#168b62] text-white"
                      : "bg-[#edf5f0] text-[#168b62] hover:bg-[#d8ecdf]"
                  }`}
                >
                  {isCurrent ? "Active" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
