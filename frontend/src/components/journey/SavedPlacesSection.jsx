import React, { useState, useEffect } from "react";
import { placesService } from "../../services/placesService";
import StationPicker from "../common/StationPicker";

// ── Lucide-style SVG Icons ───────────────────────────────────────────────────

function HomeIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function GraduationCapIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function BriefcaseIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function DumbbellIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1a2 2 0 0 0-2.83 0l-1.17 1.17a2 2 0 0 1-2.83 0L10.5 18.5" />
      <path d="m3 3 1 1a2 2 0 0 0 2.83 0l1.17-1.17a2 2 0 0 1 2.83 0L13.5 5.5" />
      <path d="m18 15 3-3" />
      <path d="m6 9 3-3" />
    </svg>
  );
}

function HospitalIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 6v4" />
      <path d="M14 8h-4" />
      <path d="M18 18v-7a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v7" />
      <rect width="20" height="14" x="2" y="7" rx="2" />
    </svg>
  );
}

function MapPinIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function PlusIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function MoreVerticalIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ZapIcon({ className = "w-3 h-3" }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function getCategoryIcon(cat, className = "w-4 h-4") {
  switch ((cat || "").toLowerCase()) {
    case "home":
      return <HomeIcon className={className} />;
    case "college":
    case "university":
    case "school":
      return <GraduationCapIcon className={className} />;
    case "work":
    case "office":
      return <BriefcaseIcon className={className} />;
    case "gym":
    case "fitness":
      return <DumbbellIcon className={className} />;
    case "hospital":
    case "clinic":
      return <HospitalIcon className={className} />;
    default:
      return <MapPinIcon className={className} />;
  }
}

const CATEGORY_OPTIONS = [
  { id: "home", label: "Home", icon: <HomeIcon className="w-3.5 h-3.5" /> },
  { id: "college", label: "College", icon: <GraduationCapIcon className="w-3.5 h-3.5" /> },
  { id: "work", label: "Work", icon: <BriefcaseIcon className="w-3.5 h-3.5" /> },
  { id: "gym", label: "Gym", icon: <DumbbellIcon className="w-3.5 h-3.5" /> },
  { id: "hospital", label: "Hospital", icon: <HospitalIcon className="w-3.5 h-3.5" /> },
  { id: "custom", label: "Custom", icon: <MapPinIcon className="w-3.5 h-3.5" /> },
];

export default function SavedPlacesSection({
  user,
  onSelectQuickJourney,
  onSetOrigin,
  onSetDestination,
}) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Modal State for Add / Edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("home");
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationText, setStationText] = useState("");
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Active dropdown menu state (by place id)
  const [activeMenuId, setActiveMenuId] = useState(null);

  // Delete confirmation modal state
  const [deleteConfirmPlace, setDeleteConfirmPlace] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const userId = user?.id || user?.email || "guest";

  // Fetch places when user changes
  useEffect(() => {
    let isMounted = true;
    if (!userId) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    placesService
      .getSavedPlaces(userId)
      .then((data) => {
        if (isMounted) {
          setPlaces(data || []);
          setErrorMsg("");
        }
      })
      .catch(() => {
        if (isMounted) setErrorMsg("Could not load saved places.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Open modal for Adding
  const handleOpenAdd = (presetCategory = "home", presetName = "Home") => {
    setEditingPlace(null);
    setFormCategory(presetCategory);
    setFormName(presetName);
    setSelectedStation(null);
    setStationText("");
    setFormError("");
    setModalOpen(true);
    setActiveMenuId(null);
  };

  // Open modal for Editing
  const handleOpenEdit = (place) => {
    setEditingPlace(place);
    setFormCategory(place.category || "custom");
    setFormName(place.name || "");
    setSelectedStation({
      station_id: place.station_id,
      station_name: place.address,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setStationText(place.address || "");
    setFormError("");
    setModalOpen(true);
    setActiveMenuId(null);
  };

  // Save (Create or Update)
  const handleSavePlace = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Please enter a place name.");
      return;
    }
    if (!selectedStation?.latitude || !selectedStation?.longitude) {
      setFormError("Please select a valid Delhi location.");
      return;
    }

    setFormSaving(true);
    setFormError("");

    const payload = {
      user_id: userId,
      name: formName.trim(),
      category: formCategory,
      address: selectedStation.station_name || stationText.trim() || formName.trim(),
      latitude: Number(selectedStation.latitude),
      longitude: Number(selectedStation.longitude),
      station_id: selectedStation.station_id || null,
    };

    try {
      if (editingPlace) {
        const updated = await placesService.updateSavedPlace(editingPlace.id, payload);
        setPlaces((prev) => prev.map((p) => (p.id === editingPlace.id ? updated : p)));
      } else {
        const created = await placesService.createSavedPlace(payload);
        setPlaces((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message || "Failed to save place.");
    } finally {
      setFormSaving(false);
    }
  };

  // Delete Place
  const handleDeletePlace = async () => {
    if (!deleteConfirmPlace) return;
    setDeleting(true);
    try {
      await placesService.deleteSavedPlace(deleteConfirmPlace.id, userId);
      setPlaces((prev) => prev.filter((p) => p.id !== deleteConfirmPlace.id));
      setDeleteConfirmPlace(null);
    } catch (err) {
      alert(err.message || "Failed to delete saved place.");
    } finally {
      setDeleting(false);
    }
  };

  // Generate Quick Journey Pairs (e.g. Home <-> College, Home <-> Work)
  const generateQuickPairs = () => {
    if (places.length < 2) return [];
    const pairs = [];
    const home = places.find((p) => (p.category || "").toLowerCase() === "home");
    const others = places.filter((p) => (p.category || "").toLowerCase() !== "home");

    if (home && others.length > 0) {
      // Home to others & others to Home
      others.slice(0, 3).forEach((o) => {
        pairs.push({ from: home, to: o });
        pairs.push({ from: o, to: home });
      });
    } else {
      // Pair first few places
      for (let i = 0; i < Math.min(places.length, 3); i++) {
        for (let j = 0; j < Math.min(places.length, 3); j++) {
          if (i !== j && pairs.length < 4) {
            pairs.push({ from: places[i], to: places[j] });
          }
        }
      }
    }
    return pairs.slice(0, 4);
  };

  const quickPairs = generateQuickPairs();

  return (
    <div className="rounded-3xl border border-[#d0e5d8] bg-white p-5 shadow-sm space-y-4">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between pb-2 border-b border-[#e5efe8]">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">
              Saved Places
            </span>
            <span className="text-[10px] font-semibold text-[#789087] bg-[#f0f6f2] px-1.5 py-0.2 rounded-md">
              Delhi NCR
            </span>
          </div>
          <h3 className="font-display text-base font-bold text-[#17352b]">
            Frequent Locations
          </h3>
        </div>

        <button
          type="button"
          onClick={() => handleOpenAdd("home", "Home")}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef8f3] hover:bg-[#dcf2e4] text-[#168b62] text-xs font-bold border border-[#c5e6d4] transition-colors cursor-pointer"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          <span>Add place</span>
        </button>
      </div>

      {/* ── ERROR MESSAGE ── */}
      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-[#fff4f2] border border-[#f5c4be] text-xs text-[#b64d42] font-semibold">
          {errorMsg}
        </div>
      )}

      {/* ── LOADING SKELETON ── */}
      {loading && (
        <div className="space-y-2 py-1">
          <div className="h-12 rounded-2xl bg-[#f2f7f4] animate-pulse" />
          <div className="h-12 rounded-2xl bg-[#f2f7f4] animate-pulse" />
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && places.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[#cbe4d6] bg-[#fafdff] p-4 text-center">
          <div className="w-9 h-9 rounded-2xl bg-[#e3f4ec] text-[#168b62] flex items-center justify-center mx-auto mb-2">
            <MapPinIcon className="w-4 h-4" />
          </div>
          <p className="text-xs font-bold text-[#17352b]">No saved places yet</p>
          <p className="text-[11px] text-[#637d71] mt-0.5 max-w-xs mx-auto">
            Save your frequent Delhi locations (Home, College, Work) for 1-click route planning.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => handleOpenAdd("home", "Home")}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#cbe4d5] hover:border-[#168b62] text-xs font-semibold text-[#17352b] transition flex items-center gap-1 shadow-2xs"
            >
              <HomeIcon className="w-3 h-3 text-[#168b62]" />
              <span>+ Add Home</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAdd("college", "College")}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#cbe4d5] hover:border-[#168b62] text-xs font-semibold text-[#17352b] transition flex items-center gap-1 shadow-2xs"
            >
              <GraduationCapIcon className="w-3 h-3 text-[#168b62]" />
              <span>+ Add College</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenAdd("work", "Work")}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#cbe4d5] hover:border-[#168b62] text-xs font-semibold text-[#17352b] transition flex items-center gap-1 shadow-2xs"
            >
              <BriefcaseIcon className="w-3 h-3 text-[#168b62]" />
              <span>+ Add Work</span>
            </button>
          </div>
        </div>
      )}

      {/* ── SAVED PLACES LIST ── */}
      {!loading && places.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {places.map((place) => (
            <div
              key={place.id}
              className="group relative rounded-2xl border border-[#dcebe1] bg-[#fbfdfb] hover:bg-[#f4faf6] hover:border-[#bde3cf] p-3 transition-all duration-150 shadow-2xs flex items-start justify-between gap-2"
            >
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-xl bg-[#e5f5ed] text-[#168b62] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {getCategoryIcon(place.category, "w-4 h-4 text-[#168b62]")}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-[#17352b] truncate">{place.name}</h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-[#e8f4ee] text-[#168b62]">
                      {place.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#557367] truncate mt-0.5 font-medium" title={place.address}>
                    {place.address}
                  </p>

                  {/* 1-Click Fill Actions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onSetOrigin &&
                        onSetOrigin({
                          station_id: place.station_id,
                          station_name: place.address,
                          name: place.name,
                          latitude: place.latitude,
                          longitude: place.longitude,
                        })
                      }
                      className="text-[10px] font-bold text-[#168b62] hover:underline"
                    >
                      Set as From
                    </button>
                    <span className="text-[10px] text-[#cbdad1]">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        onSetDestination &&
                        onSetDestination({
                          station_id: place.station_id,
                          station_name: place.address,
                          name: place.name,
                          latitude: place.latitude,
                          longitude: place.longitude,
                        })
                      }
                      className="text-[10px] font-bold text-[#168b62] hover:underline"
                    >
                      Set as To
                    </button>
                  </div>
                </div>
              </div>

              {/* 3-dot dropdown menu */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveMenuId(activeMenuId === place.id ? null : place.id)}
                  className="w-6 h-6 rounded-lg text-[#7c978b] hover:text-[#17352b] hover:bg-[#e8f3ec] flex items-center justify-center transition-colors cursor-pointer"
                  title="Place options"
                >
                  <MoreVerticalIcon className="w-3.5 h-3.5" />
                </button>

                {activeMenuId === place.id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setActiveMenuId(null)}
                    />
                    <div className="absolute right-0 top-7 z-50 w-28 rounded-xl border border-[#cbe4d6] bg-white p-1 shadow-lg text-xs animate-fadeIn">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(place)}
                        className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#eff8f2] text-[#17352b] font-semibold transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMenuId(null);
                          setDeleteConfirmPlace(place);
                        }}
                        className="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-[#fff0ef] text-[#c73e34] font-semibold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── QUICK JOURNEYS SECTION (APPEARS WHEN >= 2 PLACES EXIST) ── */}
      {!loading && quickPairs.length > 0 && (
        <div className="pt-2 border-t border-[#e5efe8]">
          <div className="flex items-center gap-1.5 mb-2">
            <ZapIcon className="w-3.5 h-3.5 text-[#168b62]" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#168b62]">
              Quick Journey Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickPairs.map((pair, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onSelectQuickJourney) {
                    onSelectQuickJourney(
                      {
                        station_id: pair.from.station_id,
                        station_name: pair.from.address,
                        name: pair.from.name,
                        latitude: pair.from.latitude,
                        longitude: pair.from.longitude,
                      },
                      {
                        station_id: pair.to.station_id,
                        station_name: pair.to.address,
                        name: pair.to.name,
                        latitude: pair.to.latitude,
                        longitude: pair.to.longitude,
                      }
                    );
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#cfe5d8] bg-gradient-to-r from-[#f5fbf7] to-[#ffffff] hover:border-[#168b62] hover:bg-[#ecf7f1] transition-all text-left flex items-center justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-bold text-[#17352b] truncate">
                    {pair.from.name}
                  </span>
                  <ArrowRightIcon className="w-3 h-3 text-[#168b62] shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-xs font-bold text-[#17352b] truncate">
                    {pair.to.name}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-[#168b62] bg-[#e1f3e9] px-2 py-0.5 rounded-md shrink-0">
                  Plan →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-[#cbe4d5] bg-white p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e2efe7]">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#168b62] text-white flex items-center justify-center shadow-sm">
                  {getCategoryIcon(formCategory, "w-4 h-4 text-white")}
                </span>
                <h3 className="font-display text-base font-bold text-[#17352b]">
                  {editingPlace ? "Edit Saved Place" : "Add Saved Place"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg text-[#7c978b] hover:bg-[#f0f6f2] flex items-center justify-center font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlace} className="space-y-3.5">
              {/* Category Selector */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORY_OPTIONS.map((cat) => {
                    const selected = formCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setFormCategory(cat.id);
                          if (!editingPlace && (!formName || CATEGORY_OPTIONS.some((c) => c.label === formName))) {
                            setFormName(cat.label);
                          }
                        }}
                        className={`px-2 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          selected
                            ? "border-[#168b62] bg-[#f0f8f3] text-[#168b62] font-bold ring-1 ring-[#168b62]"
                            : "border-[#dcebe1] bg-white text-[#2f5043] hover:bg-[#f6faf8]"
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Place Name */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Place Name
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Home, College, Work, DTU, Gym"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#cfddd5] bg-[#fbfdfb] text-xs sm:text-sm font-medium text-[#17352b] outline-none focus:border-[#168b62] focus:ring-2 focus:ring-[#168b62]/20"
                />
              </div>

              {/* Delhi Location Search */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#789087] mb-1">
                  Delhi Location / Station
                </label>
                <StationPicker
                  label="place"
                  text={stationText}
                  setText={setStationText}
                  onSelect={(st) => {
                    setSelectedStation(st);
                    if (st && !formName) {
                      setFormName(st.station_name.split(",")[0]);
                    }
                  }}
                  placeholder="Search Delhi area (e.g. Anand Vihar, Rohini, Bawana)"
                />
                {selectedStation?.latitude && (
                  <p className="text-[10px] text-[#168b62] font-semibold mt-1">
                    ✓ Coordinates mapped: {Number(selectedStation.latitude).toFixed(4)}, {Number(selectedStation.longitude).toFixed(4)}
                  </p>
                )}
              </div>

              {formError && (
                <div className="p-2.5 rounded-xl bg-[#fff2f0] border border-[#f5c4be] text-xs text-[#b64d42] font-semibold">
                  {formError}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2efe7]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#d8e8de] text-xs font-bold text-[#456356] hover:bg-[#f3faf6] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2 rounded-xl bg-[#168b62] hover:bg-[#116e4e] text-white text-xs font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {formSaving ? "Saving..." : editingPlace ? "Update Place" : "Save Place"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirmPlace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-sm rounded-3xl border border-[#f5c4be] bg-white p-5 shadow-2xl space-y-3">
            <h4 className="font-display text-base font-bold text-[#17352b]">
              Delete "{deleteConfirmPlace.name}"?
            </h4>
            <p className="text-xs text-[#60776c]">
              This place will be removed from your saved locations and quick journey shortcuts.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlace(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[#d8e8de] text-xs font-bold text-[#456356] hover:bg-[#f3faf6]"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeletePlace}
                className="px-4 py-1.5 rounded-xl bg-[#c73e34] hover:bg-[#aa2f26] text-white text-xs font-bold shadow-sm disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
