import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocalStorage, useImageSession, loadStored } from "./hooks";
import ApiKeys from "./components/ApiKeys";
import ImageSource from "./components/ImageSource";
import LayoutSettings from "./components/LayoutSettings";
import OverlaySettings from "./components/OverlaySettings";
import TextSettings from "./components/TextSettings";
import ExcludedModal from "./components/ExcludedModal";
import CanvasPreview from "./components/CanvasPreview";
import {
  StatusBar,
  PrimaryButton,
  SecondaryButton,
} from "./components/ui/index.js";
import DownloadModal from "./components/DownloadModal";
import NuvioAuthModal from "./components/NuvioAuthModal";
import CollectionsModal from "./components/CollectionsModal";
import { getSession, signOut } from "./lib/nuvioAuth";
import {
  DEFAULT_SOURCE,
  DEFAULT_LAYOUT,
  DEFAULT_OVERLAY,
  DEFAULT_TEXT,
} from "./lib/defaults";
import s from "./App.module.css";

export default function App() {
  const [tmdbKey, setTmdbKey] = useState(
    () => localStorage.getItem("tmdb_key") || "",
  );
  const [traktKey, setTraktKey] = useState(
    () => localStorage.getItem("trakt_key") || "",
  );
  const [mdblistKey, setMdblistKey] = useState(
    () => localStorage.getItem("mdblist_key") || "",
  );
  const [source, setSource] = useState(() => {
    const stored = loadStored("nuvio_source", {});
    return {
      ...DEFAULT_SOURCE,
      ...stored,
      filter: { ...DEFAULT_SOURCE.filter, ...(stored.filter || {}) },
      trakt: { ...DEFAULT_SOURCE.trakt, ...(stored.trakt || {}) },
      mdblist: { ...DEFAULT_SOURCE.mdblist, ...(stored.mdblist || {}) },
    };
  });
  const [layout, setLayout] = useState(() => ({
    ...DEFAULT_LAYOUT,
    ...loadStored("nuvio_layout", {}),
  }));
  const [overlay, setOverlay] = useState(() => ({
    ...DEFAULT_OVERLAY,
    ...loadStored("nuvio_overlay", {}),
  }));
  const [text, setText] = useState(() => ({
    ...DEFAULT_TEXT,
    ...loadStored("nuvio_text", {}),
  }));
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [excludedModalOpen, setExcludedModalOpen] = useState(false);
  const [nuvioAuthOpen, setNuvioAuthOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [nuvioSession, setNuvioSession] = useState(() => getSession());
  const pendingCollections = useRef(false);
  const [excludedPaths, setExcludedPaths] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("nuvio_excluded") || "[]"));
    } catch {
      return new Set();
    }
  });
  const [renderTick, setRenderTick] = useState(0);

  // API keys stored as raw strings — keep direct effects
  useEffect(() => { localStorage.setItem("tmdb_key", tmdbKey); }, [tmdbKey]);
  useEffect(() => { localStorage.setItem("trakt_key", traktKey); }, [traktKey]);
  useEffect(() => { localStorage.setItem("mdblist_key", mdblistKey); }, [mdblistKey]);

  const excludedPathsArray = useMemo(() => [...excludedPaths], [excludedPaths]);
  useLocalStorage("nuvio_excluded", excludedPathsArray);
  useLocalStorage("nuvio_source", source, 500);
  useLocalStorage("nuvio_layout", layout, 500);
  useLocalStorage("nuvio_overlay", overlay, 500);
  useLocalStorage("nuvio_text", text, 500);

  const {
    images,
    status,
    generating,
    canDownload,
    generate,
    reshuffleImages,
    regenerateWithExclusions,
    reset: resetSession,
  } = useImageSession({ tmdbKey, traktKey, mdblistKey, source, excludedPaths });

  // Adjust layout defaults when switching between backdrops and posters
  const prevImageType = useRef(source.imageType);
  useEffect(() => {
    if (prevImageType.current === source.imageType) return;
    prevImageType.current = source.imageType;
    if (source.imageType === "poster") {
      setLayout((l) => ({ ...l, scale: 100, imageOpacity: 50 }));
    } else {
      setLayout((l) => ({
        ...l,
        scale: DEFAULT_LAYOUT.scale,
        imageOpacity: DEFAULT_LAYOUT.imageOpacity,
      }));
    }
  }, [source.imageType]);

  // Re-render canvas when layout, overlay, text, or exclusions change
  useEffect(() => {
    if (images.length > 0) setRenderTick((t) => t + 1);
  }, [layout, overlay, text, excludedPaths]);

  const toggleExclusion = (path) => {
    setExcludedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const resetSource = () => setSource(DEFAULT_SOURCE);
  const resetLayout = () =>
    setLayout(
      source.imageType === "poster"
        ? { ...DEFAULT_LAYOUT, scale: 100, imageOpacity: 50 }
        : DEFAULT_LAYOUT,
    );
  const resetText = () => setText(DEFAULT_TEXT);
  const resetOverlay = () => setOverlay(DEFAULT_OVERLAY);
  const resetAll = () => {
    setSource(DEFAULT_SOURCE);
    setLayout(DEFAULT_LAYOUT);
    setOverlay(DEFAULT_OVERLAY);
    setText(DEFAULT_TEXT);
    resetSession();
    setSettingsOpen(false);
  };

  const handleNuvioSignIn = (session) => {
    setNuvioSession(session);
    setNuvioAuthOpen(false);
    if (pendingCollections.current) {
      pendingCollections.current = false;
      setCollectionsOpen(true);
    }
  };

  const handleSaveToCollection = () => {
    if (nuvioSession) {
      setCollectionsOpen(true);
    } else {
      pendingCollections.current = true;
      setNuvioAuthOpen(true);
    }
  };

  const handleNuvioSignOut = async () => {
    if (nuvioSession?.access_token) {
      await signOut(nuvioSession.access_token);
    }
    setNuvioSession(null);
    setSettingsOpen(false);
  };

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.logoMark}>🎬</div>
        <h1 className={s.title}>Backdrop Generator</h1>
        <span className={s.subtitle}>
          — streaming-style hero images for your Nuvio collections.
        </span>
        <div className={s.headerRight}>
          <div className={s.settingsWrap}>
            <button
              className={s.settingsBtn}
              onClick={() => setSettingsOpen((o) => !o)}
              title="Settings"
              aria-label="Settings"
              aria-expanded={settingsOpen}
              aria-haspopup="menu"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            {settingsOpen && (
              <>
                <div
                  className={s.settingsBackdrop}
                  onClick={() => setSettingsOpen(false)}
                />
                <div className={s.settingsMenu}>
                  {nuvioSession ? (
                    <>
                      <div className={s.settingsMenuUser}>
                        {nuvioSession.user?.email}
                      </div>
                      <button className={s.settingsMenuItem} onClick={handleNuvioSignOut}>
                        Sign out of Nuvio
                      </button>
                    </>
                  ) : (
                    <button
                      className={s.settingsMenuItem}
                      onClick={() => {
                        setNuvioAuthOpen(true);
                        setSettingsOpen(false);
                      }}
                    >
                      Sign in with Nuvio
                    </button>
                  )}
                  <div className={s.settingsMenuDivider} />
                  <button
                    className={s.settingsMenuItem}
                    onClick={() => {
                      setExcludedModalOpen(true);
                      setSettingsOpen(false);
                    }}
                  >
                    Excluded Images
                    {excludedPaths.size > 0 && (
                      <span className={s.menuBadge}>{excludedPaths.size}</span>
                    )}
                  </button>
                  <button className={s.settingsMenuItem} onClick={resetAll}>
                    Reset all to defaults
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {nuvioAuthOpen && (
        <NuvioAuthModal
          onSuccess={handleNuvioSignIn}
          onClose={() => setNuvioAuthOpen(false)}
        />
      )}

      {collectionsOpen && nuvioSession && (
        <CollectionsModal
          accessToken={nuvioSession.access_token}
          onClose={() => setCollectionsOpen(false)}
          onSessionExpired={() => { setNuvioSession(null); setCollectionsOpen(false); }}
          images={images}
          imageType={source.imageType}
          layout={layout}
          overlay={overlay}
          text={text}
          excludedPaths={excludedPathsArray}
        />
      )}

      {excludedModalOpen && (
        <ExcludedModal
          paths={[...excludedPaths]}
          onToggle={toggleExclusion}
          onClearAll={() => setExcludedPaths(new Set())}
          onClose={() => setExcludedModalOpen(false)}
        />
      )}

      {downloadModalOpen && (
        <DownloadModal
          images={images}
          imageType={source.imageType}
          layout={layout}
          overlay={overlay}
          text={text}
          excludedPaths={excludedPathsArray}
          onClose={() => setDownloadModalOpen(false)}
        />
      )}

      <div className={s.layout}>
        <aside className={s.sidebar}>
          <div className={s.sidebarScroll}>
            <ApiKeys
              tmdbKey={tmdbKey}
              traktKey={traktKey}
              mdblistKey={mdblistKey}
              onTmdbChange={setTmdbKey}
              onTraktChange={setTraktKey}
              onMdblistChange={setMdblistKey}
            />
            <ImageSource
              source={source}
              onChange={setSource}
              onReset={resetSource}
              traktKey={traktKey}
              mdblistKey={mdblistKey}
            />
            <LayoutSettings
              layout={layout}
              onChange={setLayout}
              onReset={resetLayout}
            />
            <TextSettings text={text} onChange={setText} onReset={resetText} />
            <OverlaySettings
              overlay={overlay}
              onChange={setOverlay}
              onReset={resetOverlay}
            />
          </div>

          <div className={s.actions}>
            <StatusBar status={status} />
            <PrimaryButton onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "Generate Backdrop"}
            </PrimaryButton>
            <div style={{ display: "flex", gap: 6 }}>
              <PrimaryButton
                onClick={handleSaveToCollection}
                disabled={!canDownload}
                style={{ flex: 2, fontSize: 12, padding: "9px 12px", background: "#a855f7" }}
              >
                Save to Collection
              </PrimaryButton>
              <SecondaryButton
                onClick={() => setDownloadModalOpen(true)}
                disabled={!canDownload}
                style={{ flex: 1 }}
              >
                Download
              </SecondaryButton>
            </div>
          </div>
        </aside>

        <main className={s.main}>
          <CanvasPreview
            images={images}
            imageType={source.imageType}
            onImageTypeChange={(v) => setSource((s) => ({ ...s, imageType: v }))}
            layout={layout}
            overlay={overlay}
            text={text}
            excludedPaths={excludedPathsArray}
            onToggleExclusion={toggleExclusion}
            onExitEditMode={regenerateWithExclusions}
            onShuffle={reshuffleImages}
            triggerRender={renderTick}
          />
        </main>
      </div>
    </div>
  );
}
