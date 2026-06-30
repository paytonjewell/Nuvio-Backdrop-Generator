import React, { useState, useEffect } from "react";
import { signIn } from "../lib/nuvioAuth";
import s from "./NuvioAuthModal.module.css";

export default function NuvioAuthModal({ onSuccess, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await signIn(email, password);
      onSuccess(session);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.overlay} onClick={onClose} role="presentation">
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nuvio-auth-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.header}>
          <span className={s.title} id="nuvio-auth-title">Sign in with Nuvio</span>
          <button className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form className={s.form} onSubmit={handleSubmit}>
          <div className={s.field}>
            <label className={s.label} htmlFor="nuvio-email">Email</label>
            <input
              id="nuvio-email"
              className={s.input}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className={s.field}>
            <label className={s.label} htmlFor="nuvio-password">Password</label>
            <input
              id="nuvio-password"
              className={s.input}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <p className={s.error}>{error}</p>}

          <button className={s.submitBtn} type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
