import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchProfiles, fetchCollections, pushCollections } from "../lib/nuvioApi";
import { renderCanvas } from "../lib/canvas";
import { uploadToImgbb } from "../lib/imgbb";
import s from "./CollectionsModal.module.css";

function FolderCard({ folder, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const isPoster = folder.tileShape === "POSTER";
  const showImg = folder.coverImageUrl && !imgFailed;

  return (
    <button
      className={`${s.folderCard} ${isPoster ? s.folderCardPoster : ""}`}
      onClick={onClick}
    >
      {showImg ? (
        <img
          className={s.folderCardImg}
          src={folder.coverImageUrl}
          alt={folder.title}
          onError={() => setImgFailed(true)}
        />
      ) : folder.coverEmoji ? (
        <div className={s.folderCardEmoji}>{folder.coverEmoji}</div>
      ) : (
        <div className={s.folderCardEmpty}>{folder.title}</div>
      )}
    </button>
  );
}

export default function CollectionsModal({
  accessToken,
  onClose,
  onSessionExpired,
  // render props for canvas preview
  images,
  imageType,
  layout,
  overlay,
  text,
  excludedPaths,
}) {
  const [step, setStep] = useState("profiles");
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [thumbImgFailed, setThumbImgFailed] = useState(false);
  const [view, setView] = useState("current"); // "current" | "new"
  const [newPreviewUrl, setNewPreviewUrl] = useState("");
  const [rendering, setRendering] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const offscreen = useRef(null);
  const successTimer = useRef(null);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => clearTimeout(successTimer.current);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchProfiles(accessToken)
      .then(setProfiles)
      .catch((err) => {
        if (err.code === "SESSION_EXPIRED") { onSessionExpired?.(); return; }
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const buildSettings = useCallback(() => ({
    gap: layout.gap,
    scale: layout.scale / 100,
    radius: layout.radius,
    stagger: layout.stagger,
    autoStagger: layout.autoStagger,
    angleDeg: layout.angle,
    offsetX: layout.offsetX,
    offsetY: layout.offsetY,
    imageOpacity: layout.imageOpacity / 100,
    bgColor: overlay.bgColor,
    overlayPreset: overlay.preset,
    overlayOpacity: overlay.opacity,
    overlayReach: overlay.reach,
    imageType,
    width: 1920,
    height: 1080,
  }), [layout, overlay, imageType]);

  // Render canvas whenever the "new" tab is active in folder detail
  useEffect(() => {
    if (step !== "folder" || view !== "new" || !images.length) return;
    if (!offscreen.current) offscreen.current = document.createElement("canvas");

    let cancelled = false;
    const run = async () => {
      setRendering(true);
      await document.fonts.ready;
      if (cancelled) return;
      renderCanvas(offscreen.current, images, buildSettings(), text, excludedPaths);
      if (!cancelled) {
        setNewPreviewUrl(offscreen.current.toDataURL("image/png"));
        setRendering(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [step, view, images, buildSettings, text, excludedPaths]);

  const selectProfile = async (profile) => {
    setSelectedProfile(profile);
    setStep("collections");
    setLoading(true);
    setError("");
    try {
      const data = await fetchCollections(accessToken, profile.profile_index);
      const cols = data?.[0]?.collections_json ?? [];
      console.log("[Nuvio Collections]", data);
      setCollections(cols);
    } catch (err) {
      if (err.code === "SESSION_EXPIRED") { onSessionExpired?.(); return; }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectFolder = (collection, folder) => {
    setSelectedCollection(collection);
    setSelectedFolder(folder);
    setThumbImgFailed(false);
    setView("current");
    setNewPreviewUrl("");
    setSaveError("");
    setStep("folder");
  };

  const goBack = () => {
    if (step === "folder") {
      setStep("collections");
      setSelectedFolder(null);
      setSelectedCollection(null);
      setView("current");
      setNewPreviewUrl("");
      setSaveError("");
    } else if (step === "collections") {
      setStep("profiles");
      setSelectedProfile(null);
      setCollections([]);
    }
    setError("");
  };

  const handleSave = async () => {
    if (!newPreviewUrl || !selectedProfile || !selectedCollection || !selectedFolder) return;
    setSaving(true);
    setSaveError("");
    try {
      const hostedUrl = await uploadToImgbb(newPreviewUrl);
      const newCollectionsJson = collections.map((col) => {
        if (col.id !== selectedCollection.id) return col;
        return {
          ...col,
          folders: col.folders.map((f) =>
            f.id !== selectedFolder.id ? f : { ...f, heroBackdropUrl: hostedUrl }
          ),
        };
      });
      await pushCollections(accessToken, selectedProfile.profile_index, newCollectionsJson);
      setCollections(newCollectionsJson);
      setSelectedFolder((f) => ({ ...f, heroBackdropUrl: hostedUrl }));
      setView("current");
      setSaveSuccess(true);
      clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      if (err.code === "SESSION_EXPIRED") { onSessionExpired?.(); return; }
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const title = {
    profiles: "Select a Profile",
    collections: `Collections — ${selectedProfile?.name ?? ""}`,
    folder: selectedFolder?.title ?? "Folder",
  }[step];

  return (
    <div className={s.overlay} onClick={onClose} role="presentation">
      <div
        className={s.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="collections-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={s.header}>
          <div className={s.headerLeft}>
            {step !== "profiles" && (
              <button className={s.backBtn} onClick={goBack} aria-label="Back">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <span className={s.title} id="collections-modal-title">{title}</span>
          </div>
          <div className={s.headerRight}>
            {step === "folder" && images.length > 0 && (
              <div className={s.viewToggle}>
                <button
                  className={`${s.viewToggleBtn} ${view === "current" ? s.viewToggleBtnActive : ""}`}
                  onClick={() => setView("current")}
                >
                  Current
                </button>
                <button
                  className={`${s.viewToggleBtn} ${view === "new" ? s.viewToggleBtnActive : ""}`}
                  onClick={() => setView("new")}
                >
                  New
                </button>
              </div>
            )}
            <button className={s.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* Step 1: Profiles */}
        {step === "profiles" && (
          <div className={s.body}>
            {error && <p className={s.error}>{error}</p>}
            {loading ? (
              <p className={s.hint}>Loading profiles…</p>
            ) : (
              <div className={s.profileGrid}>
                {profiles.map((p) => (
                  <button key={p.id} className={s.profileCard} onClick={() => selectProfile(p)}>
                    {p.avatar_url ? (
                      <img className={s.avatarImg} src={p.avatar_url} alt={p.name} />
                    ) : (
                      <div className={s.avatar} style={{ background: p.avatar_color_hex ?? "#6c63ff" }}>
                        {p.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <span className={s.profileName}>{p.name}</span>
                  </button>
                ))}
                {profiles.length === 0 && !error && (
                  <p className={s.hint}>No profiles found.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Collections */}
        {step === "collections" && (
          <div className={s.body}>
            {error && <p className={s.error}>{error}</p>}
            {loading ? (
              <p className={s.hint}>Loading collections…</p>
            ) : (
              <div className={s.collectionsScroll}>
                {collections.map((col) => (
                  <div key={col.id} className={s.collectionGroup}>
                    <span className={s.collectionTitle}>{col.title}</span>
                    <div className={s.foldersRow}>
                      {(col.folders ?? []).map((folder) => (
                        <FolderCard
                          key={folder.id}
                          folder={folder}
                          onClick={() => selectFolder(col, folder)}
                        />
                      ))}
                      {!col.folders?.length && (
                        <p className={s.hint}>No folders.</p>
                      )}
                    </div>
                  </div>
                ))}
                {collections.length === 0 && !error && (
                  <p className={s.hint}>No collections found for this profile.</p>
                )}
              </div>
            )}
          </div>
        )}

        {saveSuccess && (
          <div className={s.successOverlay}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className={s.successText}>Backdrop saved!</span>
          </div>
        )}

        {/* Step 3: Folder detail */}
        {step === "folder" && selectedFolder && (
          <div className={s.folderDetailWrap}>
            <div className={s.heroPreview}>
              {view === "current" ? (
                selectedFolder.heroBackdropUrl ? (
                  <img
                    className={s.heroPreviewImg}
                    src={selectedFolder.heroBackdropUrl}
                    alt={`${selectedFolder.title} backdrop`}
                  />
                ) : (
                  <div className={s.heroPreviewEmpty}>No backdrop set</div>
                )
              ) : (
                rendering || !newPreviewUrl ? (
                  <div className={s.heroPreviewEmpty}>
                    {images.length === 0 ? "Generate a backdrop first" : "Rendering…"}
                  </div>
                ) : (
                  <img
                    className={s.heroPreviewImg}
                    src={newPreviewUrl}
                    alt="New backdrop"
                  />
                )
              )}
            </div>

            <div className={s.folderDetailMeta}>
              <div className={`${s.folderThumb} ${selectedFolder.tileShape === "POSTER" ? s.folderThumbPoster : ""}`}>
                {selectedFolder.coverImageUrl && !thumbImgFailed ? (
                  <img
                    className={s.folderThumbImg}
                    src={selectedFolder.coverImageUrl}
                    alt={selectedFolder.title}
                    onError={() => setThumbImgFailed(true)}
                  />
                ) : selectedFolder.coverEmoji ? (
                  <div className={s.folderThumbEmoji}>{selectedFolder.coverEmoji}</div>
                ) : (
                  <div className={s.folderThumbEmpty} />
                )}
              </div>
              <div className={s.folderDetailInfo}>
                <span className={s.folderDetailTitle}>{selectedFolder.title}</span>
                <span className={s.folderDetailSub}>{selectedCollection?.title}</span>
                {saveError && <span className={s.saveError}>{saveError}</span>}
              </div>
              {view === "new" && newPreviewUrl && (
                <button
                  className={s.saveBtn}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save to Nuvio"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
