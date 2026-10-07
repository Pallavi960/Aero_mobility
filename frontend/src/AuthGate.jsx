import React, { useEffect, useState } from "react";
import JourneyDashboard from "./JourneyDashboard";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const BACKEND_LABEL = API_BASE || "the local /api proxy (Flask on port 5000)";
const API = `${API_BASE}/api/auth`;
const PROFILES = [["general", "General"], ["respiratory", "Asthma / Respiratory Sensitivity"], ["cardiovascular", "Cardiovascular Sensitivity"], ["elderly", "Elderly"], ["child", "Child"]];

async function readResponse(response) {
  const body = await response.text();
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

function responseError(response, data, fallback) {
  return data.error || (response.status
    ? `${fallback} (server returned HTTP ${response.status}).`
    : fallback);
}

export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API}/me`, { credentials: "include" }).then(async response => {
      const data = await readResponse(response);
      if (response.ok) setUser(data.user);
      else setError(responseError(response, data, "Could not check your account session."));
    }).catch(() => setError(`Could not reach ${BACKEND_LABEL}. Make sure the Flask backend is running.`))
      .finally(() => setChecking(false));
  }, []);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    if (mode === "register") payload.age = Number(payload.age);
    try {
      const response = await fetch(`${API}/${mode}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await readResponse(response);
      if (!response.ok) throw new Error(responseError(response, data, "Unable to continue."));
      if (!data.user) throw new Error("The server response was incomplete. Please try again.");
      setUser(data.user);
    } catch (reason) { setError(reason instanceof TypeError ? `Could not reach ${BACKEND_LABEL}. Make sure the Flask backend is running.` : reason.message || "Unable to continue."); }
    finally { setBusy(false); }
  }

  async function logout() {
    try { await fetch(`${API}/logout`, { method: "POST", credentials: "include" }); }
    finally { setUser(null); setMode("login"); }
  }

  if (checking) return <div className="auth-page"><div className="auth-card"><p className="auth-eyebrow">AeroMobility</p><p>Checking your account…</p></div></div>;
  if (user) return <JourneyDashboard user={user} onLogout={logout} onUserUpdated={setUser} />;

  return <main className="auth-page"><section className="auth-card">
    <div className="auth-brand"><span className="auth-mark">✦</span><div><p className="auth-eyebrow">AeroMobility</p><p className="auth-subtitle">AQI + smart routes</p></div></div>
    <h1>{mode === "register" ? "Create your account" : "Welcome back"}</h1>
    <p className="auth-intro">{mode === "register" ? "Set up your profile for health-aware route planning." : "Sign in to plan a cleaner journey."}</p>
    <form className="auth-form" onSubmit={submit}>
      {mode === "register" && <>
        <label>Full name<input name="full_name" autoComplete="name" required minLength="2" maxLength="100" /></label>
        <div className="auth-two-col"><label>Age<input name="age" type="number" min="1" max="120" required /></label><label>Health profile<select name="health_profile" defaultValue="general">{PROFILES.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label></div>
      </>}
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Password<input name="password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} minLength={mode === "register" ? 8 : undefined} required />{mode === "register" && <small>Use at least 8 characters.</small>}</label>
      {error && <p className="auth-error" role="alert">{error}</p>}
      <button className="auth-submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Create account" : "Log in"}</button>
    </form>
    <p className="auth-switch">{mode === "register" ? "Already have an account?" : "New to AeroMobility?"} <button onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>{mode === "register" ? "Log in" : "Create account"}</button></p>
  </section></main>;
}
