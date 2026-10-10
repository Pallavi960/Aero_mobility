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
  const [password, setPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Password strength validation
  const validatePassword = (pwd) => {
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };
    const allValid = Object.values(checks).every(Boolean);
    return { checks, allValid };
  };

  const passwordValidation = validatePassword(password);
  const showPasswordHints = page === "signup" && passwordTouched && !passwordValidation.allValid;

  async function submit(event) {
    event.preventDefault();
    setError(""); setMessage("");
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(form.entries());
    
    // Frontend password validation for signup
    if (page === "signup") {
      const validation = validatePassword(values.password);
      if (!validation.allValid) {
        setError("Please ensure your password meets all requirements.");
        setPasswordTouched(true);
        return;
      }
    }
    
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

  function changePage(next) { setPage(next); setError(""); setMessage(""); setShowPassword(false); setPassword(""); setPasswordTouched(false); }

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
        <label className="auth-label">Password<span className="auth-password"><input name="password" type={showPassword ? "text" : "password"} autoComplete={page === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} onBlur={() => setPasswordTouched(true)} required minLength="8" /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? "Hide" : "Show"}</button></span></label>
        {showPasswordHints && (
          <div style={{ fontSize: "0.875rem", marginTop: "0.5rem", padding: "0.75rem", backgroundColor: "#fef3c7", border: "1px solid #fbbf24", borderRadius: "0.5rem" }}>
            <p style={{ fontWeight: "600", marginBottom: "0.5rem", color: "#92400e" }}>Password requirements:</p>
            <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "#92400e" }}>
              <li style={{ color: passwordValidation.checks.length ? "#16a34a" : "#dc2626" }}>
                {passwordValidation.checks.length ? "✓" : "✗"} At least 8 characters
              </li>
              <li style={{ color: passwordValidation.checks.uppercase ? "#16a34a" : "#dc2626" }}>
                {passwordValidation.checks.uppercase ? "✓" : "✗"} One uppercase letter
              </li>
              <li style={{ color: passwordValidation.checks.lowercase ? "#16a34a" : "#dc2626" }}>
                {passwordValidation.checks.lowercase ? "✓" : "✗"} One lowercase letter
              </li>
              <li style={{ color: passwordValidation.checks.number ? "#16a34a" : "#dc2626" }}>
                {passwordValidation.checks.number ? "✓" : "✗"} One number
              </li>
              <li style={{ color: passwordValidation.checks.special ? "#16a34a" : "#dc2626" }}>
                {passwordValidation.checks.special ? "✓" : "✗"} One special character
              </li>
            </ul>
          </div>
        )}
        {page === "login" && <div className="auth-options"><label><input type="checkbox" name="remember" /> Remember me</label><button type="button" onClick={() => { setError(""); setMessage("Please contact support to reset your password."); }}>Forgot password?</button></div>}
        {error && <p className="auth-feedback auth-error" role="alert">{error}</p>}
        {message && <p className="auth-feedback" role="status">{message}</p>}
        <button className="auth-primary" type="submit" disabled={busy}>{busy ? "Please wait…" : page === "login" ? "Sign In" : "Create Account"}</button>
      </form>
      <p className="auth-switch">{page === "login" ? "Don't have an account?" : "Already have an account?"} <button type="button" onClick={() => changePage(page === "login" ? "signup" : "login")}>{page === "login" ? "Create account" : "Sign in"}</button></p>
    </section>
  </main>;
}
