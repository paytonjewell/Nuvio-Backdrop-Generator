import React, { useState, useEffect, useCallback } from "react";
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

const DEFAULT_SOURCE = {
  tab: "filter",
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
  size: 80,
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
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [overlay, setOverlay] = useState(DEFAULT_OVERLAY);
  const [text, setText] = useState(DEFAULT_TEXT);

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

  // Re-render canvas whenever layout/overlay changes (images stay the same)
  useEffect(() => {
    if (images.length > 0) setRenderTick((t) => t + 1);
  }, [layout, overlay, text]);

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
      let paths = [];
      if (source.tab === "filter") {
        paths = await fetchFilterImages({
          type: source.filter.type,
          sort: source.filter.sort,
          genre: source.filter.genre,
          provider: source.filter.provider,
          apiKey: tmdbKey,
        });
      } else {
        paths = await fetchTraktImages({
          url: source.trakt.url,
          traktKey,
          apiKey: tmdbKey,
        });
      }

      if (paths.length === 0) {
        setStatus({
          state: "error",
          message: "No images found — try a different filter or IDs.",
        });
        setGenerating(false);
        return;
      }

      setStatus({
        state: "loading",
        message: `Loading ${paths.length} images…`,
      });
      const loaded = await loadImages(paths);

      if (loaded.length === 0) {
        setStatus({
          state: "error",
          message: "Images failed to load — check your API key.",
        });
        setGenerating(false);
        return;
      }

      const shuffled = shuffle(loaded);
      setRawImages(loaded);
      setImages(shuffled);
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
          <ImageSource source={source} onChange={setSource} />
          <LayoutSettings layout={layout} onChange={setLayout} />
          <TextSettings text={text} onChange={setText} />
          <OverlaySettings overlay={overlay} onChange={setOverlay} />

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
