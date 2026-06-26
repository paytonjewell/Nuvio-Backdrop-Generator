import React, { useState, useEffect, useCallback, useRef } from "react";
import ApiKeys from "./components/ApiKeys";
import ImageSource from "./components/ImageSource";
import LayoutSettings from "./components/LayoutSettings";
import OverlaySettings from "./components/OverlaySettings";
import TextSettings from "./components/TextSettings";
import CanvasPreview from "./components/CanvasPreview";
import { StatusBar, PrimaryButton, SecondaryButton } from "./components/UI";
import {
  fetchFilterImages,
  fetchTraktImages,
  loadImages,
  shuffle,
} from "./lib/tmdb";
import s from "./App.module.css";

const CACHE_KEY = 'nuvio_image_cache'

function getSourceKey(source) {
  if (source.tab === 'filter') {
    const { type, sort, genre, provider } = source.filter
    return `filter|${type}|${sort}|${genre}|${provider}`
  }
  return `trakt|${source.trakt.url}`
}

const DEFAULT_SOURCE = {
  tab: "filter",
  imageType: "backdrop",
  filter: { type: "movie", sort: "popular", genre: "", provider: "" },
  trakt: { url: "" },
};

const DEFAULT_LAYOUT = {
  angle: 12,
  gap: 20,
  scale: 120,
  radius: 8,
  stagger: 120,
  offsetX: 0,
  offsetY: 0,
  imageOpacity: 100,
};
const DEFAULT_OVERLAY = {
  preset: "cinematic",
  opacity: 0.85,
  bgColor: "transparent",
  reach: 0.6,
};
const DEFAULT_TEXT = {
  content: '',
  font: 'Inter',
  size: 100,
  preset: 'bottom-left',
  offsetX: 0,
  offsetY: 0,
  color: '#ffffff',
  shadow: true,
  shadowBlur: 24,
  gradient: false,
  gradientTo: '#a855f7',
};

function loadStored(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [tmdbKey, setTmdbKey] = useState(
    () => localStorage.getItem("tmdb_key") || "",
  );
  const [traktKey, setTraktKey] = useState(
    () => localStorage.getItem("trakt_key") || "",
  );
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [layout, setLayout] = useState(() => ({ ...DEFAULT_LAYOUT, ...loadStored('nuvio_layout', {}) }));
  const [overlay, setOverlay] = useState(() => ({ ...DEFAULT_OVERLAY, ...loadStored('nuvio_overlay', {}) }));
  const [text, setText] = useState(() => ({ ...DEFAULT_TEXT, ...loadStored('nuvio_text', {}) }));

  const [images, setImages] = useState([]); // loaded Image objects, shuffled
  const [rawImages, setRawImages] = useState([]); // unshuffled, for re-shuffling
  const [status, setStatus] = useState({
    state: "",
    message: "Enter your TMDB API key and pick a source above.",
  });
  const [generating, setGenerating] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [renderTick, setRenderTick] = useState(0); // bump to force re-render

  // Persist keys
  useEffect(() => {
    localStorage.setItem("tmdb_key", tmdbKey);
  }, [tmdbKey]);
  useEffect(() => {
    localStorage.setItem("trakt_key", traktKey);
  }, [traktKey]);

  // Persist layout/text/overlay to localStorage (debounced)
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem('nuvio_layout', JSON.stringify(layout)), 500);
    return () => clearTimeout(t);
  }, [layout]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem('nuvio_overlay', JSON.stringify(overlay)), 500);
    return () => clearTimeout(t);
  }, [overlay]);
  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem('nuvio_text', JSON.stringify(text)), 500);
    return () => clearTimeout(t);
  }, [text]);

  // Re-render canvas whenever layout/overlay changes (images stay the same)
  useEffect(() => {
    if (images.length > 0) setRenderTick((t) => t + 1);
  }, [layout, overlay, text]);

  // Apply mode defaults and restore cached images when switching between backdrops/posters
  const prevImageType = useRef(source.imageType);
  useEffect(() => {
    if (prevImageType.current === source.imageType) return;
    prevImageType.current = source.imageType;
    if (source.imageType === "poster") {
      setLayout((l) => ({ ...l, stagger: 200, scale: 100, imageOpacity: 50 }));
    } else {
      setLayout((l) => ({ ...l, stagger: DEFAULT_LAYOUT.stagger, scale: DEFAULT_LAYOUT.scale, imageOpacity: DEFAULT_LAYOUT.imageOpacity }));
    }
    const restore = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
        const cachedPaths = stored.sourceKey === getSourceKey(source) ? stored[source.imageType] : null
        if (cachedPaths?.length > 0) {
          setStatus({ state: 'loading', message: 'Restoring images…' })
          const loaded = await loadImages(cachedPaths)
          if (loaded.length > 0) {
            setRawImages(loaded)
            setImages(loaded)
            setCanDownload(true)
            setStatus({ state: 'success', message: `Done — ${loaded.length} unique backdrops, zero repeats.` })
            return
          }
        }
      } catch {}
      setImages([])
      setRawImages([])
      setCanDownload(false)
      setStatus({ state: '', message: 'Click Generate to create a backdrop.' })
    }
    restore()
  }, [source.imageType]);

  const resetLayout = () =>
    setLayout(
      source.imageType === "poster"
        ? { ...DEFAULT_LAYOUT, stagger: 200, scale: 100, imageOpacity: 50 }
        : DEFAULT_LAYOUT
    );
  const resetText = () => setText(DEFAULT_TEXT);
  const resetOverlay = () => setOverlay(DEFAULT_OVERLAY);
  const resetSource = () => setSource(DEFAULT_SOURCE);

  const generate = useCallback(async () => {
    if (!tmdbKey) {
      setStatus({
        state: "error",
        message: "Please enter your TMDB API key first.",
      });
      return;
    }
    setGenerating(true);
    setCanDownload(false);
    setStatus({ state: "loading", message: "Fetching image list…" });

    try {
      let allPaths;
      if (source.tab === "filter") {
        allPaths = await fetchFilterImages({
          type: source.filter.type,
          sort: source.filter.sort,
          genre: source.filter.genre,
          provider: source.filter.provider,
          apiKey: tmdbKey,
        });
      } else {
        allPaths = await fetchTraktImages({
          url: source.trakt.url,
          traktKey,
          apiKey: tmdbKey,
        });
      }

      // Shuffle each set once and cache both
      const shuffledPaths = {
        backdrop: shuffle(allPaths.backdrop),
        poster: shuffle(allPaths.poster),
      };
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          sourceKey: getSourceKey(source),
          ...shuffledPaths,
        }));
      } catch {}

      const activePaths = shuffledPaths[source.imageType];
      if (activePaths.length === 0) {
        setStatus({
          state: "error",
          message: "No images found — try a different filter.",
        });
        setGenerating(false);
        return;
      }

      setStatus({ state: "loading", message: `Loading ${activePaths.length} images…` });
      const loaded = await loadImages(activePaths);

      if (loaded.length === 0) {
        setStatus({
          state: "error",
          message: "Images failed to load — check your API key.",
        });
        setGenerating(false);
        return;
      }

      setRawImages(loaded);
      setImages(loaded);
      setCanDownload(true);
      setStatus({
        state: "success",
        message: `Done — ${loaded.length} unique backdrops, zero repeats.`,
      });
    } catch (err) {
      setStatus({ state: "error", message: "Error: " + err.message });
    } finally {
      setGenerating(false);
    }
  }, [tmdbKey, traktKey, source]);

  const reshuffleImages = () => {
    if (rawImages.length === 0) return;
    setImages(shuffle(rawImages));
    setStatus({ state: "success", message: "Images reshuffled." });
  };

  const downloadImage = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `backdrop-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  return (
    <div className={s.app}>
      <header className={s.header}>
        <div className={s.logoMark}>🎬</div>
        <h1 className={s.title}>Backdrop Generator</h1>
        <span className={s.subtitle}>
          — streaming-style hero images from TMDB or Trakt
        </span>
      </header>

      <div className={s.layout}>
        <aside className={s.sidebar}>
          <ApiKeys
            tmdbKey={tmdbKey}
            traktKey={traktKey}
            onTmdbChange={setTmdbKey}
            onTraktChange={setTraktKey}
          />
          <ImageSource source={source} onChange={setSource} onReset={resetSource} />
          <LayoutSettings layout={layout} onChange={setLayout} onReset={resetLayout} />
          <TextSettings text={text} onChange={setText} onReset={resetText} />
          <OverlaySettings overlay={overlay} onChange={setOverlay} onReset={resetOverlay} />

          <div className={s.actions}>
            <StatusBar status={status} />
            <PrimaryButton onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "Generate Backdrop"}
            </PrimaryButton>
            <SecondaryButton
              onClick={reshuffleImages}
              disabled={images.length === 0}
            >
              Shuffle Images
            </SecondaryButton>
            <SecondaryButton onClick={downloadImage} disabled={!canDownload}>
              Download PNG
            </SecondaryButton>
          </div>
        </aside>

        <main className={s.main}>
          <CanvasPreview
            images={images}
            imageType={source.imageType}
            layout={layout}
            overlay={overlay}
            text={text}
            triggerRender={renderTick}
          />
        </main>
      </div>
    </div>
  );
}
