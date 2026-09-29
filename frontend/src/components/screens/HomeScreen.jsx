import React from "react";
import InteractiveMap from "../map/InteractiveMap";
import JourneyPlannerForm from "../journey/JourneyPlannerForm";
import SavedPlacesSection from "../journey/SavedPlacesSection";
import RouteCard from "../journey/RouteCard";
import SelectedRouteSummary from "../journey/SelectedRouteSummary";
import CurrentConditionsSection from "../journey/CurrentConditionsSection";
import AqiForecastSection from "../journey/AqiForecastSection";
import JourneyInsightSection from "../journey/JourneyInsightSection";
import RecommendationInsight from "../journey/RecommendationInsight";

export default function HomeScreen({
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
  activeProfileObj,
  routesData,
  selectedRouteId,
  setSelectedRouteId,
  loadingRoutes,
  routeError,
  mapsLoaded,
  currentUser,
  onFindRoutes,
  onSelectQuickJourney,
  onUseLocation,
}) {
  const currentRoutes = routesData?.routes || [];
  const recommendedRouteId = routesData?.recommended_route_id;
  const selectedRoute = currentRoutes.find((r) => r.route_id === selectedRouteId);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 pb-24 space-y-6">
      {/* ── TOP SECTION: 2-COLUMN GRID (PLANNER & SAVED PLACES ON LEFT, GOOGLE MAP ON RIGHT) ── */}
      <div className="flex flex-col lg:flex-row items-stretch gap-5">
        {/* LEFT COLUMN: JOURNEY PLANNER FORM + SAVED PLACES */}
        <div className="w-full lg:w-[440px] xl:w-[480px] shrink-0 flex flex-col gap-5">
          <JourneyPlannerForm
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
            loadingRoutes={loadingRoutes}
            routeError={routeError}
            onFindRoutes={onFindRoutes}
            onUseLocation={onUseLocation}
          />

          <SavedPlacesSection
            user={currentUser}
            onSelectQuickJourney={onSelectQuickJourney}
            onSetOrigin={(st) => {
              setOrigin(st);
              setOriginText(st.station_name || st.name);
            }}
            onSetDestination={(st) => {
              setDestination(st);
              setDestinationText(st.station_name || st.name);
            }}
          />
        </div>

        {/* RIGHT COLUMN: FULLY WORKING GOOGLE MAP */}
        <div className="flex-1 min-w-0 h-[460px] lg:h-auto min-h-[460px] lg:min-h-[580px]">
          <InteractiveMap
            routes={currentRoutes}
            recommendedId={recommendedRouteId}
            selectedId={selectedRouteId}
            onSelectRoute={(id) => setSelectedRouteId(id)}
            origin={origin}
            destination={destination}
            mapsLoaded={mapsLoaded}
          />
        </div>
      </div>

      {/* ── BOTTOM SECTION: DYNAMIC JOURNEY RESULTS (APPEARS WHEN SEARCHED) ── */}
      {routesData && (
        <div className="space-y-6 animate-fadeIn pt-2">
          {/* 1. JOURNEY HEADER */}
          <div className="rounded-3xl border border-[#cbe4d5] bg-gradient-to-r from-[#eef9f3] via-[#f7fcf9] to-[#ffffff] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#168b62] text-white">
                  {currentRoutes.length} Routes Analyzed
                </span>
                <span className="text-xs font-bold text-[#315447] flex items-center gap-1">
                  Profile: {activeProfileObj.icon} {activeProfileObj.name}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 font-display text-lg sm:text-xl font-bold text-[#17352b]">
                <span>{origin?.station_name || origin?.name || "Origin"}</span>
                <span className="text-[#168b62] text-sm">➔</span>
                <span>{destination?.station_name || destination?.name || "Destination"}</span>
              </div>
            </div>

            <span className="text-xs font-bold text-[#168b62] bg-white px-3.5 py-1.5 rounded-xl border border-[#bfe1ce] shadow-sm self-start md:self-center">
              ⭐ Recommended: {recommendedRouteId}
            </span>
          </div>

          {/* SMART "WHY THIS ROUTE?" RECOMMENDATION INSIGHT */}
          <RecommendationInsight
            routes={currentRoutes}
            recommendedId={recommendedRouteId}
            healthProfile={healthProfile}
            appliedProfileName={routesData?.health_profile}
          />

          {/* 2. ROUTE OPTIONS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#168b62]">Comparison</p>
                <h3 className="font-display text-lg font-bold text-[#17352b]">Available Route Options</h3>
              </div>
              <span className="text-xs text-[#789087] font-semibold">Click a card to switch path on map</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
              {currentRoutes.slice(0, 3).map((r) => (
                <RouteCard
                  key={r.route_id}
                  route={r}
                  recommended={r.route_id === recommendedRouteId}
                  selected={r.route_id === selectedRouteId}
                  onSelect={() => setSelectedRouteId(r.route_id)}
                />
              ))}
            </div>
          </div>

          {/* 3. SELECTED ROUTE SUMMARY */}
          {selectedRoute && <SelectedRouteSummary route={selectedRoute} />}

          {/* 4. CURRENT CONDITIONS & 5. 24-HOUR AQI FORECAST */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <CurrentConditionsSection
              point={origin}
              userKey={currentUser?.id || currentUser?.email || "guest"}
              healthProfile={healthProfile}
              originName={origin?.station_name || origin?.name}
            />
            <AqiForecastSection
              stationId={origin?.station_id || "site_301"}
              stationName={origin?.station_name || "Origin Station"}
            />
          </div>

          {/* 6. JOURNEY INSIGHT */}
          <JourneyInsightSection
            routes={currentRoutes}
            recommendedId={recommendedRouteId}
            profileId={healthProfile}
            appliedProfileName={routesData?.health_profile}
          />
        </div>
      )}
    </div>
  );
}
