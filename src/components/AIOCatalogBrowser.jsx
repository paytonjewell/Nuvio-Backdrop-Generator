import React, { useState, useRef } from "react";
import { Notice } from "./ui/index.js";
import {
  catalogUniqueKey,
  isTMDBCatalog,
  loadStoredAIOCatalogs,
  saveAIOCatalogs,
  clearAIOCatalogs,
} from "../lib/aioCatalog";
import s from "./AIOCatalogBrowser.module.css";
import aioScreenshot from "../public/AIOMetadataScreenshot.png";

const MAX_SELECTIONS = 4;

export default function AIOCatalogBrowser({ selectedIds, onChange }) {
  const [catalogs, setCatalogs] = useState(() => loadStoredAIOCatalogs());
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [error, setError] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const fileRef = useRef(null);

  const applyJSON = (text) => {
    try {
      const json = JSON.parse(text);
      const cats = json.catalogs;
      if (!Array.isArray(cats))
        throw new Error("No 'catalogs' array found in JSON");
      setCatalogs(cats);
      saveAIOCatalogs(cats);
      onChange([]);
      setPasteText("");
      setError("");
    } catch (err) {
      setError("Invalid JSON: " + err.message);
    }
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => applyJSON(ev.target.result);
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    setCatalogs(null);
    clearAIOCatalogs();
    onChange([]);
  };

  const handleClear = () => {
    onChange([]);
  };

  const toggleId = (key, supported) => {
    if (!supported) return;
    if (selectedIds.includes(key)) {
      onChange(selectedIds.filter((id) => id !== key));
    } else {
      if (selectedIds.length >= MAX_SELECTIONS) return;
      onChange([...selectedIds, key]);
    }
  };

  const availableTags = catalogs
    ? [...new Set(catalogs.flatMap((c) => c.tags ?? []))]
    : [];

  const filteredCatalogs = catalogs
    ? catalogs.filter((c) => {
        const matchSearch =
          !search || c.name.toLowerCase().includes(search.toLowerCase());
        const matchTag =
          tagFilter === "all" || (c.tags ?? []).includes(tagFilter);
        return matchSearch && matchTag;
      })
    : [];

  if (!catalogs) {
    return (
      <>
        <div className={s.importArea}>
          <p className={s.importHint}>
            Import your AIOMetadata catalog JSON to use specific catalogs as
            your image source.
          </p>
          <div className={s.importBtnRow}>
            <button
              className={s.importBtn}
              onClick={() => fileRef.current?.click()}
            >
              Import Catalog JSON
            </button>
            <button
              className={s.helpBtn}
              onClick={() => setHelpOpen(true)}
              title="How to get your catalog JSON"
              aria-label="Help"
            >
              ?
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className={s.fileInput}
            onChange={handleFileImport}
          />
          <div className={s.pasteDivider}>or paste below</div>
          <textarea
            className={s.pasteArea}
            placeholder='{ "catalogs": [ … ] }'
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={4}
            spellCheck={false}
          />
          {pasteText.trim() && (
            <button
              className={s.importBtn}
              onClick={() => applyJSON(pasteText)}
            >
              Load JSON
            </button>
          )}
        </div>
        {error && <Notice style={{ marginTop: 8 }}>{error}</Notice>}

        {helpOpen && (
          <div className={s.helpOverlay} onClick={() => setHelpOpen(false)}>
            <div className={s.helpModal} onClick={(e) => e.stopPropagation()}>
              <div className={s.helpHeader}>
                <span className={s.helpTitle}>
                  How to export your catalog JSON
                </span>
                <button
                  className={s.helpClose}
                  onClick={() => setHelpOpen(false)}
                >
                  ✕
                </button>
              </div>
              <img
                src={aioScreenshot}
                alt="AIOMetadata Catalog Management screen showing the Share Setup button"
                className={s.helpScreenshot}
              />
              <ol className={s.helpSteps}>
                <li>
                  Open <strong>AIOMetadata</strong> and make sure your
                  configuration is loaded.
                </li>
                <li>
                  Go to the <strong>Catalogs</strong> section.
                </li>
                <li>
                  Near the top, click <strong>Share Setup</strong>.
                </li>
                <li>
                  Click <strong>Copy to Clipboard</strong> and paste it into the
                  box, or click <strong>Download .json</strong> and import it
                  here.
                </li>
              </ol>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className={s.importedHeader}>
        <span className={s.importedName}>
          {catalogs.length} catalogs loaded
        </span>
        <div className={s.importedActions}>
          <button
            className={s.actionBtn}
            onClick={handleClear}
            title="Clear selection"
          >
            Clear
          </button>
          <button
            className={s.actionBtn}
            onClick={handleReset}
            title="Remove catalog and start over"
          >
            Reset
          </button>
        </div>
      </div>

      <div className={s.controls}>
        <input
          className={s.search}
          type="text"
          placeholder="Filter catalogs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={s.tagFilters}>
          {["all", ...availableTags].map((tag) => (
            <button
              key={tag}
              className={`${s.tagBtn} ${tagFilter === tag ? s.tagActive : ""}`}
              onClick={() => setTagFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className={s.counter}>
        {selectedIds.length}/{MAX_SELECTIONS} selected
      </div>

      <div className={s.list}>
        {filteredCatalogs.length === 0 && (
          <div className={s.empty}>No catalogs match.</div>
        )}
        {filteredCatalogs.map((c) => {
          const key = catalogUniqueKey(c);
          const supported = isTMDBCatalog(c);
          const checked = selectedIds.includes(key);
          const atLimit = !checked && selectedIds.length >= MAX_SELECTIONS;
          const disabled = !supported || atLimit;

          return (
            <label
              key={key}
              className={`${s.item} ${disabled ? s.itemDisabled : ""} ${checked ? s.itemChecked : ""}`}
              title={
                !supported
                  ? "Non-TMDB catalog — not supported"
                  : atLimit
                    ? "Maximum 4 catalogs selected"
                    : ""
              }
            >
              <input
                type="checkbox"
                className={s.checkbox}
                checked={checked}
                disabled={disabled}
                onChange={() => toggleId(key, supported)}
              />
              <span className={s.itemName}>{c.name}</span>
              <div className={s.badges}>
                <span
                  className={`${s.badge} ${c.type === "movie" ? s.badgeMovie : s.badgeSeries}`}
                >
                  {c.type === "movie" ? "🎬" : "📺"}
                </span>
                {(c.tags ?? []).slice(0, 1).map((tag) => (
                  <span key={tag} className={s.badge}>
                    {tag}
                  </span>
                ))}
              </div>
            </label>
          );
        })}
      </div>

      {error && <Notice style={{ marginTop: 8 }}>{error}</Notice>}
    </>
  );
}
