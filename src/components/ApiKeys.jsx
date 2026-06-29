import React, { useEffect, useRef } from "react";
import {
  SectionLabel,
  Card,
  Field,
  FieldLabel,
  CollapseButton,
  Collapsible,
  useCollapsed,
} from "./UI";
import {
  validateTMDBKey,
  validateTraktKey,
  validateMDBListKey,
} from "../lib/tmdb";
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
    <Field style={{ marginBottom: 18 }}>
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
  mdblistKey,
  onTmdbChange,
  onTraktChange,
  onMdblistChange,
}) {
  const tmdbTimer = useRef(null);
  const traktTimer = useRef(null);
  const mdblistTimer = useRef(null);
  const [tmdbStatus, setTmdbStatus] = React.useState({
    state: "",
    message: "",
  });
  const [traktStatus, setTraktStatus] = React.useState({
    state: "",
    message: "",
  });
  const [mdblistStatus, setMdblistStatus] = React.useState({
    state: "",
    message: "",
  });
  const { collapsed, toggle } = useCollapsed("nuvio_collapsed_apikeys");

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

  useEffect(() => {
    clearTimeout(mdblistTimer.current);
    if (!mdblistKey) {
      setMdblistStatus({ state: "", message: "" });
      return;
    }
    setMdblistStatus({ state: "checking", message: "Checking…" });
    mdblistTimer.current = setTimeout(async () => {
      try {
        const ok = await validateMDBListKey(mdblistKey);
        setMdblistStatus(
          ok
            ? { state: "ok", message: "✓ Valid API key" }
            : { state: "err", message: "✗ Invalid API key" },
        );
      } catch {
        setMdblistStatus({
          state: "err",
          message: "✗ Could not reach MDBList",
        });
      }
    }, 600);
  }, [mdblistKey]);

  const validCount = [tmdbStatus, traktStatus, mdblistStatus].filter(
    (s) => s.state === "ok",
  ).length;

  const action = (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 0.5,
          color: "rgba(255,255,255,0.3)",
          textTransform: "none",
        }}
      >
        {validCount}/3
      </span>
      <CollapseButton collapsed={collapsed} onClick={toggle} />
    </div>
  );

  return (
    <div>
      <SectionLabel action={action}>API Keys</SectionLabel>
      <Collapsible open={!collapsed}>
        <Card>
          <KeyInput
            id="tmdbKey"
            label="TMDB Read Access Token (v4)"
            placeholder="eyJhbGci…"
            value={tmdbKey}
            onChange={onTmdbChange}
            status={tmdbStatus}
            getKeyUrl="https://www.themoviedb.org/settings/api"
            getKeyLabel="Get key"
          />
          <KeyInput
            id="traktKey"
            label="Trakt Client ID"
            placeholder="Paste Client ID here"
            value={traktKey}
            onChange={onTraktChange}
            status={traktStatus}
            getKeyUrl="https://trakt.tv/oauth/applications"
            getKeyLabel="Get key"
          />
          <KeyInput
            id="mdblistKey"
            label="MDBList API Key"
            placeholder="Paste API key here"
            value={mdblistKey}
            onChange={onMdblistChange}
            status={mdblistStatus}
            getKeyUrl="https://mdblist.com/preferences#apikey"
            getKeyLabel="Get key"
          />
        </Card>
      </Collapsible>
    </div>
  );
}
