import React, { useState } from "react";
import AeroLogo from "./AeroLogo";
import NotificationDropdown from "./NotificationDropdown";
import NotificationSettingsModal from "./NotificationSettingsModal";
import { NAV_ITEMS } from "../../constants/appConstants";

export function HeaderNavbar({ activeTab, setActiveTab, activeProfileObj, currentUser }) {
  const [avatarError, setAvatarError] = useState(false);
  const [notifSettingsOpen, setNotifSettingsOpen] = useState(false);
  const avatarUrl = currentUser?.avatar || currentUser?.profile_image || null;
  const userKey = currentUser?.id || currentUser?.email || "guest";

  return (
    <>
      <header className="app-header sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#dbe7df] px-4 sm:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("home")}>
          <AeroLogo />
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-[#17352b] tracking-tight">AeroMobility</h1>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#168b62]">Environmental Intelligence</p>
          </div>
        </div>

        {/* Desktop 4-tab Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#f0f5f1] p-1 rounded-xl border border-[#d8e6dc]">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  active
                    ? "bg-white text-[#168b62] shadow-sm"
                    : "text-[#60776c] hover:text-[#17352b] hover:bg-white/50"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div aria-label={`Health profile: ${activeProfileObj.name}`} className="flex items-center gap-1.5 bg-[#f0f5f1] px-3 py-1.5 rounded-full border border-[#d8e6dc]">
            <span className="text-sm">{activeProfileObj.icon}</span>
            <span className="text-xs font-bold text-[#315447] hidden sm:inline">{activeProfileObj.name}</span>
          </div>

          {/* Notification Bell + Dropdown */}
          <NotificationDropdown
            user={currentUser}
            onOpenSettings={() => setNotifSettingsOpen(true)}
          />

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            aria-label="Open profile details"
            title={currentUser?.name || "Profile details"}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d8e6dc] bg-white text-[#315447] transition hover:border-[#168b62] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#168b62] overflow-hidden"
          >
            {avatarUrl && !avatarError ? (
              <img
                src={avatarUrl}
                alt={currentUser?.name || "Profile"}
                onError={() => setAvatarError(true)}
                className="h-full w-full object-cover"
              />
            ) : currentUser?.name ? (
              <span className="text-xs font-bold">{currentUser.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.4 3-5.2 7-5.2s6.4 1.8 7 5.2" strokeLinecap="round"/></svg>
            )}
          </button>
        </div>
      </header>

      {/* Notification Settings Modal (rendered outside header to avoid z-index issues) */}
      <NotificationSettingsModal
        isOpen={notifSettingsOpen}
        onClose={() => setNotifSettingsOpen(false)}
        userKey={userKey}
      />
    </>
  );
}

export function MobileBottomNav({ activeTab, setActiveTab }) {
  return (
    <nav aria-label="Main navigation" className="app-bottom-nav lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#dbe7df] flex items-center justify-around py-2 px-2 shadow-lg">
      {NAV_ITEMS.map((item) => {
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 py-2 px-1 sm:px-2 rounded-xl transition ${
              active ? "text-[#168b62] font-bold" : "text-[#789087] font-medium"
            }`}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wide whitespace-nowrap">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
