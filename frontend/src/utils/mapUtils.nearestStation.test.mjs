import assert from "node:assert/strict";
import { test } from "node:test";
import { stationFromNearestAqiResponse } from "./mapUtils.js";

test("uses the backend station field from /api/aqi/nearest", () => {
  const station = stationFromNearestAqiResponse({
    success: true,
    location: { latitude: 28.65, longitude: 77.31 },
    station: {
      station_id: "site_301",
      station_name: "Anand Vihar, Delhi - DPCC",
      city: "Delhi",
      state: "Delhi",
      latitude: 28.6508,
      longitude: 77.3152,
      distance_km: 0.42,
    },
    aqi: 187,
  });

  assert.equal(station.station_id, "site_301");
  assert.equal(station.station_name, "Anand Vihar, Delhi - DPCC");
  assert.equal(station.latitude, 28.6508);
  assert.equal(station.longitude, 77.3152);
});

test("does not treat a successful nearest-AQI response as a miss", () => {
  const data = {
    success: true,
    station: {
      station_id: "site_304",
      station_name: "Bawana, Delhi - DPCC",
      latitude: 28.7762,
      longitude: 77.051,
    },
  };

  assert.equal(Boolean(data.success && data.nearest_station), false);
  assert.ok(stationFromNearestAqiResponse(data));
});

test("falls back when the lookup failed or has no coordinates", () => {
  assert.equal(stationFromNearestAqiResponse({ success: false, error: "Invalid" }), null);
  assert.equal(
    stationFromNearestAqiResponse({ success: true, station: { station_name: "Unknown" } }),
    null,
  );
});
