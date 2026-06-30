import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchFilterImages,
  fetchTraktImages,
  fetchMDBListImages,
  loadImages,
  shuffle,
} from "../lib/tmdb";
import { CACHE_KEY, getSourceKey } from "../lib/defaults";

const INITIAL_STATUS = {
  state: "",
  message: "Enter your TMDB API key and pick a source above.",
};

async function restoreFromCache(source, excludedPaths) {
  const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  const excluded =
    excludedPaths instanceof Set
      ? excludedPaths
      : new Set(JSON.parse(localStorage.getItem("nuvio_excluded") || "[]"));
  const rawCached =
    stored.sourceKey === getSourceKey(source) ? stored[source.imageType] : null;
  return rawCached?.filter((p) => !excluded.has(p)) ?? [];
}

export function useImageSession({ tmdbKey, traktKey, mdblistKey, source, excludedPaths }) {
  const [images, setImages] = useState([]);
  const [rawImages, setRawImages] = useState([]);
  const [status, setStatus] = useState(INITIAL_STATUS);
  const [generating, setGenerating] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  // Restore on initial load
  const initialSource = useRef(source);
  useEffect(() => {
    const run = async () => {
      try {
        const paths = await restoreFromCache(initialSource.current, null);
        if (!paths.length) return;
        setStatus({ state: "loading", message: "Restoring images…" });
        const loaded = await loadImages(paths);
        if (loaded.length > 0) {
          setRawImages(loaded);
          setImages(loaded);
          setCanDownload(true);
          setStatus({ state: "success", message: `Done — ${loaded.length} backdrops.` });
        }
      } catch {}
    };
    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Restore cached images when switching between backdrop / poster
  const prevImageType = useRef(source.imageType);
  useEffect(() => {
    if (prevImageType.current === source.imageType) return;
    prevImageType.current = source.imageType;
    const run = async () => {
      try {
        const paths = await restoreFromCache(source, excludedPaths);
        if (paths.length > 0) {
          setStatus({ state: "loading", message: "Restoring images…" });
          const loaded = await loadImages(paths);
          if (loaded.length > 0) {
            setRawImages(loaded);
            setImages(loaded);
            setCanDownload(true);
            setStatus({ state: "success", message: `Done — ${loaded.length} backdrops.` });
            return;
          }
        }
      } catch {}
      setImages([]);
      setRawImages([]);
      setCanDownload(false);
      setStatus({ state: "", message: "Click Generate to create a backdrop." });
    };
    run();
  }, [source.imageType]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = useCallback(async () => {
    if (!tmdbKey) {
      setStatus({ state: "error", message: "Please enter your TMDB API key first." });
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
          decade: source.filter.decade,
          language: source.filter.language,
          excludeNC17: source.filter.excludeNC17,
          apiKey: tmdbKey,
        });
      } else if (source.tab === "trakt") {
        allPaths = await fetchTraktImages({
          mode: source.trakt.mode,
          url: source.trakt.url,
          listId: source.trakt.listId,
          mediaType: source.trakt.mediaType,
          traktKey,
          apiKey: tmdbKey,
        });
      } else {
        allPaths = await fetchMDBListImages({
          url: source.mdblist.mode === "url" ? source.mdblist.url : undefined,
          listId: source.mdblist.mode !== "url" ? source.mdblist.listId : undefined,
          mediaType: source.mdblist.mediaType || undefined,
          mdblistKey,
          apiKey: tmdbKey,
        });
      }

      const shuffledPaths = {
        backdrop: shuffle(allPaths.backdrop),
        poster: shuffle(allPaths.poster),
      };
      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ sourceKey: getSourceKey(source), ...shuffledPaths }),
        );
      } catch {}

      const activePaths = shuffledPaths[source.imageType].filter(
        (p) => !excludedPaths.has(p),
      );
      if (activePaths.length === 0) {
        setStatus({ state: "error", message: "No images found — try a different filter." });
        setGenerating(false);
        return;
      }

      setStatus({ state: "loading", message: `Loading ${activePaths.length} images…` });
      const loaded = await loadImages(activePaths);

      if (loaded.length === 0) {
        setStatus({ state: "error", message: "Images failed to load — check your API key." });
        setGenerating(false);
        return;
      }

      setRawImages(loaded);
      setImages(loaded);
      setCanDownload(true);
      setStatus({ state: "success", message: `Done — ${loaded.length} backdrops.` });
    } catch (err) {
      setStatus({ state: "error", message: "Error: " + err.message });
    } finally {
      setGenerating(false);
    }
  }, [tmdbKey, traktKey, mdblistKey, source, excludedPaths]);

  const reshuffleImages = () => {
    if (rawImages.length === 0) return;
    setImages(shuffle(rawImages));
    setStatus({ state: "success", message: "Images reshuffled." });
  };

  const regenerateWithExclusions = async () => {
    try {
      const stored = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      const cachedPaths =
        stored.sourceKey === getSourceKey(source) ? stored[source.imageType] : null;
      if (!cachedPaths?.length) return;
      const filtered = cachedPaths.filter((p) => !excludedPaths.has(p));
      if (!filtered.length) return;
      setStatus({ state: "loading", message: "Updating backdrop…" });
      const loaded = await loadImages(filtered);
      if (loaded.length > 0) {
        setRawImages(loaded);
        setImages(loaded);
        setCanDownload(true);
        setStatus({ state: "success", message: `Done — ${loaded.length} backdrops.` });
      }
    } catch {}
  };

  const reset = () => {
    setImages([]);
    setRawImages([]);
    setCanDownload(false);
    setStatus(INITIAL_STATUS);
  };

  return {
    images,
    status,
    generating,
    canDownload,
    generate,
    reshuffleImages,
    regenerateWithExclusions,
    reset,
  };
}
