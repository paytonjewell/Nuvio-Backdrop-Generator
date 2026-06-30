import React from "react";
import {
  SectionLabel, Card, Field, FieldLabel, CollapseButton, Collapsible, useCollapsed,
} from "./ui/index.js";
import {
  validateTMDBKey, validateTraktKey, validateMDBListKey,
} from "../lib/tmdb";
import { useAsyncValidation } from "../hooks";
import s from "./ApiKeys.module.css";

function KeyInput({ id, label, placeholder, value, onChange, status, getKeyUrl, getKeyLabel }) {
  return (
    <Field style={{ marginBottom: 18 }}>
      <FieldLabel
        action={
          <a href={getKeyUrl} target="_blank" rel="noopener" className={s.getKeyLink}>
            {getKeyLabel} ↗
          </a>
        }
      >
        {label}
      </FieldLabel>
      <input
        type="text" id={id} value={value} placeholder={placeholder} spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className={`${s.keyStatus} ${s[status.state] || ""}`}>{status.message}</div>
    </Field>
  )
}

export default function ApiKeys({ tmdbKey, traktKey, mdblistKey, onTmdbChange, onTraktChange, onMdblistChange }) {
  const { collapsed, toggle } = useCollapsed("nuvio_collapsed_apikeys");

  const tmdbStatus    = useAsyncValidation(tmdbKey,    validateTMDBKey,    { ok: "✓ Valid token",      err: "✗ Invalid token",      errNetwork: "✗ Could not reach TMDB" });
  const traktStatus   = useAsyncValidation(traktKey,   validateTraktKey,   { ok: "✓ Valid Client ID",  err: "✗ Invalid Client ID",  errNetwork: "✗ Could not reach Trakt" });
  const mdblistStatus = useAsyncValidation(mdblistKey, validateMDBListKey, { ok: "✓ Valid API key",    err: "✗ Invalid API key",    errNetwork: "✗ Could not reach MDBList" });

  const validCount = [tmdbStatus, traktStatus, mdblistStatus].filter(s => s.state === "ok").length;

  const action = (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.5, color: "rgba(255,255,255,0.3)", textTransform: "none" }}>
        {validCount}/3
      </span>
      <CollapseButton collapsed={collapsed} onClick={toggle} />
    </div>
  );

  return (
    <div>
      <SectionLabel action={action} onClick={toggle}>API Keys</SectionLabel>
      <Collapsible open={!collapsed}>
        <Card>
          <KeyInput id="tmdbKey"    label="TMDB Read Access Token (v4)" placeholder="eyJhbGci…"           value={tmdbKey}    onChange={onTmdbChange}    status={tmdbStatus}    getKeyUrl="https://www.themoviedb.org/settings/api"    getKeyLabel="Get key" />
          <KeyInput id="traktKey"   label="Trakt Client ID"              placeholder="Paste Client ID here" value={traktKey}   onChange={onTraktChange}   status={traktStatus}   getKeyUrl="https://trakt.tv/oauth/applications"        getKeyLabel="Get key" />
          <KeyInput id="mdblistKey" label="MDBList API Key"               placeholder="Paste API key here"   value={mdblistKey} onChange={onMdblistChange} status={mdblistStatus} getKeyUrl="https://mdblist.com/preferences#apikey"     getKeyLabel="Get key" />
        </Card>
      </Collapsible>
    </div>
  )
}
