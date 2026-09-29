import { API } from "../constants/appConstants";

const PLACES_URL = `${API}/api/places`;

function getLocalKey(userId) {
  return `aeromobility_saved_places_${userId || "anonymous"}`;
}

export const placesService = {
  async getSavedPlaces(userId) {
    if (!userId) return [];
    try {
      const res = await fetch(`${PLACES_URL}?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.places)) {
        // Update local cache
        localStorage.setItem(getLocalKey(userId), JSON.stringify(data.places));
        return data.places;
      }
    } catch {
      // Fallback to local cache if network/backend is briefly unavailable
      const cached = localStorage.getItem(getLocalKey(userId));
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return [];
        }
      }
    }
    return [];
  },

  async createSavedPlace(placeData) {
    const res = await fetch(PLACES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(placeData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to save place.");
    }
    return data.place;
  },

  async updateSavedPlace(placeId, placeData) {
    const res = await fetch(`${PLACES_URL}/${placeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(placeData),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to update place.");
    }
    return data.place;
  },

  async deleteSavedPlace(placeId, userId) {
    const res = await fetch(`${PLACES_URL}/${placeId}?user_id=${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || "Failed to delete place.");
    }
    return true;
  },
};
