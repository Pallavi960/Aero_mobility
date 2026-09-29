import React, { useState, useEffect } from "react";
import { API, GOOGLE_MAPS_KEY, PROFILES } from "./constants/appConstants";
import { useGoogleMaps } from "./hooks/useGoogleMaps";
import { HeaderNavbar, MobileBottomNav } from "./components/common/Navbar";
import HomeScreen from "./components/screens/HomeScreen";
import HistoryScreen from "./components/screens/HistoryScreen";
import DedicatedMapScreen from "./components/screens/DedicatedMapScreen";
import ProfileScreen from "./components/screens/ProfileScreen";
import AboutScreen from "./components/screens/AboutScreen";
import ChatAssistant from "./components/chat/ChatAssistant";

export default function JourneyDashboard({ user: initialUser, onLogout, initialTab = "home", initialHealthProfile = "general" }) {
  const [currentUser, setCurrentUser] = useState(initialUser);

  useEffect(() => {
    setCurrentUser(initialUser);
  }, [initialUser]);

  // Main navigation tabs; profile details open from the header avatar.
  const [activeTab, setActiveTab] = useState(initialTab);

  // Health Profile state
  const [healthProfile, setHealthProfile] = useState(
    PROFILES.some((profile) => profile.id === initialHealthProfile) ? initialHealthProfile : "general"
  );

  // Origin & Destination state
  const [origin, setOrigin] = useState({
    station_id: "site_301",
    station_name: "Anand Vihar, Delhi - DPCC",
    latitude: 28.6508,
    longitude: 77.3152,
    city: "Delhi",
  });
  const [destination, setDestination] = useState({
    station_id: "site_304",
    station_name: "Bawana, Delhi - DPCC",
    latitude: 28.7762,
    longitude: 77.0510,
    city: "Delhi",
  });
  const [originText, setOriginText] = useState("Anand Vihar, Delhi - DPCC");
  const [destinationText, setDestinationText] = useState("Bawana, Delhi - DPCC");

  // Search Results state
  const [routesData, setRoutesData] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState("");

  // Google Maps SDK Loader
  const { loaded: mapsLoaded } = useGoogleMaps(GOOGLE_MAPS_KEY);

  // Trigger Route Search
  const handleFindRoutes = async (
    overrideOrigin = origin,
    overrideDest = destination,
    overrideProfile = healthProfile
  ) => {
    if (!overrideOrigin?.latitude || !overrideDest?.latitude) {
      setRouteError("Please select both an origin and destination station.");
      return;
    }

    setLoadingRoutes(true);
    setRouteError("");
    setActiveTab("home");

    try {
      const q = new URLSearchParams({
        origin_lat: overrideOrigin.latitude,
        origin_lng: overrideOrigin.longitude,
        destination_lat: overrideDest.latitude,
        destination_lng: overrideDest.longitude,
        health_profile: overrideProfile,
        origin_name: overrideOrigin.station_name || overrideOrigin.name || "Origin",
        destination_name: overrideDest.station_name || overrideDest.name || "Destination",
      });

      const res = await fetch(`${API}/api/routes/find?${q}`);
      const data = await res.json();

      if (data.success && data.routes && data.routes.length > 0) {
        setRoutesData(data);
        setSelectedRouteId(null);
      } else {
        setRouteError(data.error || "No route alternatives found for this path.");
      }
    } catch {
      setRouteError("Unable to connect to route intelligence backend.");
    } finally {
      setLoadingRoutes(false);
    }
  };

  // Quick Journey shortcut handler from Saved Places
  const handleQuickJourney = (fromStation, toStation) => {
    if (!fromStation?.latitude || !toStation?.latitude) return;
    setOrigin(fromStation);
    setDestination(toStation);
    setOriginText(fromStation.station_name || fromStation.name || "Origin");
    setDestinationText(toStation.station_name || toStation.name || "Destination");

    handleFindRoutes(fromStation, toStation, healthProfile);
  };

  // Location Autodetect
  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`${API}/api/aqi/nearest?latitude=${latitude}&longitude=${longitude}`);
          const data = await res.json();
          if (data.success && data.nearest_station) {
            const st = data.nearest_station;
            setOrigin(st);
            setOriginText(`${st.station_name} (Current Location)`);
          } else {
            setOrigin({ latitude, longitude, station_name: "My Current GPS Location" });
            setOriginText("My Current GPS Location");
          }
        } catch {
          setOrigin({ latitude, longitude, station_name: "My Current GPS Location" });
          setOriginText("My Current GPS Location");
        }
      },
      () => {
        alert("Location access denied or unavailable.");
      }
    );
  };

  // Recalculate trip from history
  const handleRecalculateTrip = (trip) => {
    if (!trip?.from || !trip?.to) return;
    const fromStation = {
      station_name: trip.from.name,
      latitude: trip.from.latitude,
      longitude: trip.from.longitude,
    };
    const toStation = {
      station_name: trip.to.name,
      latitude: trip.to.latitude,
      longitude: trip.to.longitude,
    };
    const pId = trip.healthProfile?.id || "general";

    setOrigin(fromStation);
    setDestination(toStation);
    setOriginText(trip.from.name);
    setDestinationText(trip.to.name);
    setHealthProfile(pId);

    handleFindRoutes(fromStation, toStation, pId);
  };

  const activeProfileObj = PROFILES.find((p) => p.id === healthProfile) || PROFILES[0];

  return (
    <div className="app-shell min-h-screen bg-[#f4f7f2] text-[#17352b] flex flex-col font-sans selection:bg-[#168b62] selection:text-white">
      {/* ── TOP NAVBAR ── */}
      <HeaderNavbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfileObj={activeProfileObj}
        currentUser={currentUser}
      />

      {/* ── MAIN BODY CONTENT ── */}
      <main className="app-content flex-1 w-full">
        {/* TAB 1: HOME (PLANNER ON LEFT, MAP ON RIGHT, DETAILS BELOW) */}
        {activeTab === "home" && (
          <HomeScreen
            origin={origin}
            setOrigin={setOrigin}
            originText={originText}
            setOriginText={setOriginText}
            destination={destination}
            setDestination={setDestination}
            destinationText={destinationText}
            setDestinationText={setDestinationText}
            healthProfile={healthProfile}
            setHealthProfile={setHealthProfile}
            activeProfileObj={activeProfileObj}
            routesData={routesData}
            selectedRouteId={selectedRouteId}
            setSelectedRouteId={setSelectedRouteId}
            loadingRoutes={loadingRoutes}
            routeError={routeError}
            mapsLoaded={mapsLoaded}
            currentUser={currentUser}
            onFindRoutes={handleFindRoutes}
            onSelectQuickJourney={handleQuickJourney}
            onUseLocation={handleUseLocation}
          />
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === "history" && (
          <HistoryScreen onRecalculateTrip={handleRecalculateTrip} />
        )}

        {/* TAB 3: DEDICATED MAP */}
        {activeTab === "map" && (
          <DedicatedMapScreen mapsLoaded={mapsLoaded} />
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === "profile" && (
          <ProfileScreen
            user={currentUser}
            onUpdateUser={setCurrentUser}
            activeProfile={healthProfile}
            onSelectProfile={(p) => {
              setHealthProfile(p);
              if (routesData) {
                handleFindRoutes(origin, destination, p);
              }
            }}
            onLogout={onLogout}
          />
        )}

        {activeTab === "about" && <AboutScreen onNavigateHome={() => setActiveTab("home")} />}
      </main>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── AEROMOBILITY ASSISTANT CHATBOT ── */}
      <ChatAssistant
        origin={origin}
        originText={originText}
        destination={destination}
        destinationText={destinationText}
        healthProfile={healthProfile}
        routesData={routesData}
        activeTab={activeTab}
      />
    </div>
  );
}
