import React, { useState } from "react";
import AeroLogo from "../common/AeroLogo";
import { authService } from "../../services/authService";
import { PROFILES } from "../../constants/appConstants";

export default function AuthFlow({ onAuthenticated }) {
  const [page, setPage] = useState("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    setBusy(true);
    try {
      if (page === "login") {
        const user = await authService.signIn({ email: values.email.trim(), password: values.password, remember: !!form.get("remember") });
        onAuthenticated(user);
      } else {
        await authService.signUp({
          name: values.name.trim(),
          email: values.email.trim(),
          age: values.age,
          health_profile: values.health_profile,
          password: values.password,
        });
        setEmail(values.email.trim());
        setPage("login");
        setMessage("Account created. Please sign in to continue.");
      }
    } catch (reason) { setError(reason.message || "Something went wrong. Please try again."); }
    finally { setBusy(false); }
  }

  function changePage(next) { setPage(next); setError(""); setMessage(""); setShowPassword(false); }

  return <main className="auth-page">
    <section className={page === "login" ? "auth-card auth-card-login" : "auth-card"} aria-labelledby="auth-title">
      <div className="auth-brand"><AeroLogo /><div><strong>AeroMobility</strong><span>Environmental Intelligence</span></div></div>
      {page === "login" && <p className="auth-mobile-hero">Moving Smarter.<br />Breathing Better.</p>}
      <p className="auth-eyebrow">Cleaner journeys start here</p>
      <h1 id="auth-title">{page === "login" ? "Welcome back" : "Create Account"}</h1>
      <p className="auth-subtitle">{page === "login" ? "Sign in to continue your cleaner mobility journey." : "Create your account to plan healthier journeys."}</p>
      <form onSubmit={submit}>
        {page === "signup" && <label className="auth-label">Full Name<input name="name" autoComplete="name" required maxLength="100" /></label>}
        <label className="auth-label">Email<input name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength="254" /></label>
        {page === "signup" && <>
          <label className="auth-label">Age<input name="age" type="number" inputMode="numeric" min="1" max="120" step="1" required /></label>
          <label className="auth-label">Health Profile<select name="health_profile" defaultValue="general" required>{PROFILES.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
        </>}
        <label className="auth-label">Password<span className="auth-password"><input name="password" type={showPassword ? "text" : "password"} autoComplete={page === "login" ? "current-password" : "new-password"} required minLength="8" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span></label>
        {page === "login" && <div className="auth-options"><label><input type="checkbox" name="remember" /> Remember me</label><button type="button" onClick={() => { setError(""); setMessage("Password recovery is not configured yet."); }}>Forgot password?</button></div>}
        {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
        {message && <p className="auth-feedback" role="status">{message}</p>}
        <button className="auth-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : page === "login" ? "Sign In" : "Create Account"}</button>
      </form>
      {page === "login" && <><div className="auth-divider"><span>OR</span></div><button className="auth-google" type="button" onClick={() => setError("Google sign in is not connected yet.")}>Continue with Google</button></>}
      <p className="auth-switch">{page === "login" ? "Don't have an account?" : "Already have an account?"} <button type="button" onClick={() => changePage(page === "login" ? "signup" : "login")}>{page === "login" ? "Create account" : "Sign in"}</button></p>
    </section>
  </main>;
}
