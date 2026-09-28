import { API } from "../constants/appConstants";

const AUTH_URL = `${API}/api/auth`;
const SESSION_KEY = "aeromobility.auth.session";

async function request(path, credentials, persistSession = true) {
  let response;
  try {
    response = await fetch(`${AUTH_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  } catch {
    throw new Error("Could not reach the authentication service. Please try again.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.user) throw new Error(data.error || "Authentication failed. Check your details and try again.");
  if (persistSession) sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: data.user }));
  return data.user;
}

export const authService = {
  getCurrentUser() {
    try {
      const user = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")?.user || null;
      if (user && user.email && !user.profile_image) {
        const storedAvatar = localStorage.getItem(`aeromobility_avatar_${user.email}`);
        if (storedAvatar) {
          user.profile_image = storedAvatar;
        }
      }
      return user;
    } catch {
      return null;
    }
  },
  updateCurrentUser(updatedFields) {
    try {
      const current = this.getCurrentUser();
      if (!current) return null;
      const updated = { ...current, ...updatedFields };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user: updated }));
      if ("profile_image" in updatedFields && current.email) {
        if (updatedFields.profile_image) {
          localStorage.setItem(`aeromobility_avatar_${current.email}`, updatedFields.profile_image);
        } else {
          localStorage.removeItem(`aeromobility_avatar_${current.email}`);
        }
        fetch(`${AUTH_URL}/profile-photo`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: current.email, profile_image: updatedFields.profile_image }),
        }).catch(() => {});
      }
      return updated;
    } catch {
      return null;
    }
  },
  signOut() {
    sessionStorage.removeItem(SESSION_KEY);
  },
  async signIn(credentials) {
    const user = await request("/login", credentials);
    if (user && user.email && !user.profile_image) {
      const storedAvatar = localStorage.getItem(`aeromobility_avatar_${user.email}`);
      if (storedAvatar) {
        user.profile_image = storedAvatar;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
      }
    }
    return user;
  },
  signUp: (credentials) => request("/register", credentials, false),
};
