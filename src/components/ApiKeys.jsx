import React, { useEffect, useRef } from "react";
import { SectionLabel, Card, Field, FieldLabel } from "./UI";
import { validateTMDBKey, validateTraktKey } from "../lib/tmdb";
import s from "./ApiKeys.module.css";

function KeyInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  status,
  getKeyUrl,
  getKeyLabel,
}) {
  return (
    <Field>
      <FieldLabel
        action={
          <a
            href={getKeyUrl}
            target="_blank"
            rel="noopener"
            className={s.getKeyLink}
          >
            {getKeyLabel} ↗
          </a>
        }
      >
        {label}
      </FieldLabel>
      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      <div className={`${s.keyStatus} ${s[status.state] || ""}`}>
        {status.message}
      </div>
    </Field>
  );
}

export default function ApiKeys({
  tmdbKey,
  traktKey,
  onTmdbChange,
  onTraktChange,
}) {
  const tmdbTimer = useRef(null);
  const traktTimer = useRef(null);
  const [tmdbStatus, setTmdbStatus] = React.useState({
    state: "",
    message: "",
  });
  const [traktStatus, setTraktStatus] = React.useState({
    state: "",
    message: "",
  });

  useEffect(() => {
    clearTimeout(tmdbTimer.current);
    if (!tmdbKey) {
      setTmdbStatus({ state: "", message: "" });
      return;
    }
    setTmdbStatus({ state: "checking", message: "Checking…" });
    tmdbTimer.current = setTimeout(async () => {
      try {
        const ok = await validateTMDBKey(tmdbKey);
        setTmdbStatus(
          ok
            ? { state: "ok", message: "✓ Valid token" }
            : { state: "err", message: "✗ Invalid token" },
        );
      } catch {
        setTmdbStatus({ state: "err", message: "✗ Could not reach TMDB" });
      }
    }, 600);
  }, [tmdbKey]);

  useEffect(() => {
    clearTimeout(traktTimer.current);
    if (!traktKey) {
      setTraktStatus({ state: "", message: "" });
      return;
    }
    setTraktStatus({ state: "checking", message: "Checking…" });
    traktTimer.current = setTimeout(async () => {
      try {
        const ok = await validateTraktKey(traktKey);
        setTraktStatus(
          ok
            ? { state: "ok", message: "✓ Valid Client ID" }
            : { state: "err", message: "✗ Invalid Client ID" },
        );
      } catch {
        setTraktStatus({ state: "err", message: "✗ Could not reach Trakt" });
      }
    }, 600);
  }, [traktKey]);

  return (
    <div>
      <SectionLabel>API Keys</SectionLabel>
      <Card>
        <KeyInput
          id="tmdbKey"
          label="TMDB Read Access Token (v4)"
          placeholder="eyJhbGci…"
          value={tmdbKey}
          onChange={onTmdbChange}
          status={tmdbStatus}
          getKeyUrl="https://www.themoviedb.org/settings/api"
          getKeyLabel="Get free key"
        />
        <KeyInput
          id="traktKey"
          label={
            <>
              Trakt Client ID{" "}
              <span
                style={{ color: "rgba(255,255,255,0.22)", fontWeight: 400 }}
              >
                (Trakt lists only)
              </span>
            </>
          }
          placeholder="Paste Client ID here"
          value={traktKey}
          onChange={onTraktChange}
          status={traktStatus}
          getKeyUrl="https://trakt.tv/oauth/applications"
          getKeyLabel="Get free key"
        />
      </Card>
    </div>
  );
}
