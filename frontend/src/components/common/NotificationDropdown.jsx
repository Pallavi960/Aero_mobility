import React, { useState, useRef, useEffect } from "react";
import { notificationService } from "../../services/notificationService";

// Lucide-style SVG Icons
function BellIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function WindIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  );
}

function AlertTriangleIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ThermometerIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

function ActivityIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function CheckCheckIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 7 17l-5-5" />
      <path d="m22 10-7.5 7.5L13 16" />
    </svg>
  );
}

function formatTimeAgo(iso) {
  if (!iso) return "Just now";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours === 1) return "1 hr ago";
  if (hours < 24) return `${hours} hrs ago`;
  return "Yesterday";
}

function getNotifIcon(type, severity) {
  switch (type) {
    case "aqi":
      return severity === "high" ? <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-600" /> : <WindIcon className="w-3.5 h-3.5 text-amber-600" />;
    case "pollutant":
      return <ActivityIcon className="w-3.5 h-3.5 text-amber-600" />;
    case "temperature":
      return <ThermometerIcon className="w-3.5 h-3.5 text-orange-600" />;
    default:
      return <BellIcon className="w-3.5 h-3.5 text-[#168b62]" />;
  }
}

export default function NotificationDropdown({ user, onOpenSettings }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const userKey = user?.id || user?.email || "guest";
  const panelRef = useRef(null);

  // Load notifications from service
  const reloadNotifs = () => {
    const list = notificationService.getNotifications(userKey);
    setNotifications(list);
  };

  useEffect(() => {
    reloadNotifs();
    // Poll updates every 20 seconds
    const timer = setInterval(reloadNotifs, 20000);
    return () => clearInterval(timer);
  }, [userKey]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const monitoringEnabled = notificationService.getSettings(userKey).enabled;

  const handleMarkAllRead = () => {
    const updated = notificationService.markAllAsRead(userKey);
    setNotifications(updated);
  };

  const handleItemClick = (notifId) => {
    const updated = notificationService.markAsRead(userKey, notifId);
    setNotifications(updated);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          reloadNotifs();
        }}
        aria-label="Environmental notifications"
        title="Environmental notifications"
        className="relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#d8e6dc] bg-[#f0f5f1] hover:bg-white text-[#315447] transition hover:border-[#168b62] hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#168b62] cursor-pointer"
      >
        <BellIcon className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-2rem)] sm:w-96 rounded-3xl border border-[#cbe4d5] bg-white p-4 shadow-xl text-xs animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-[#e5efe8]">
            <div className="flex items-center gap-2">
              <span className="font-display text-sm font-bold text-[#17352b]">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-[#168b62] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheckIcon className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-0.5">
            {notifications.length === 0 ? (
              <div className="py-6 text-center text-[#789087]">
                <div className="w-8 h-8 rounded-full bg-[#e8f6ee] text-[#168b62] flex items-center justify-center mx-auto mb-2 font-bold text-sm">
                  ✓
                </div>
                <p className="text-xs font-bold text-[#17352b]">All caught up</p>
                <p className="text-[11px] text-[#718a7e] mt-0.5">No active environmental alerts.</p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isHigh = notif.severity === "high";
                const isMod = notif.severity === "moderate";

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleItemClick(notif.id)}
                    className={`p-2.5 rounded-2xl border transition-colors cursor-pointer flex items-start gap-2.5 ${
                      !notif.read
                        ? isHigh
                          ? "bg-rose-50/50 border-rose-200/80 hover:bg-rose-50"
                          : isMod
                          ? "bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/70"
                          : "bg-[#f4faf6] border-[#cbe4d5] hover:bg-[#eef8f2]"
                        : "bg-white border-[#e6efe9] hover:bg-[#fbfdfb] opacity-80"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isHigh
                          ? "bg-rose-100 text-rose-700"
                          : isMod
                          ? "bg-amber-100 text-amber-700"
                          : "bg-[#e2f3ea] text-[#168b62]"
                      }`}
                    >
                      {getNotifIcon(notif.type, notif.severity)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <h5 className="font-bold text-[#17352b] text-xs truncate">
                          {notif.title}
                        </h5>
                        <span className="text-[10px] text-[#869f93] shrink-0 font-medium">
                          {formatTimeAgo(notif.timestamp)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3d5a4d] mt-0.5 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#168b62] shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Settings Action */}
          <div className="pt-2 mt-2 border-t border-[#e5efe8] flex items-center justify-between">
            <span className="text-[10px] text-[#789087]">Environmental monitoring {monitoringEnabled ? "active" : "paused"}</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                if (onOpenSettings) onOpenSettings();
              }}
              className="text-[11px] font-bold text-[#168b62] hover:underline"
            >
              Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
