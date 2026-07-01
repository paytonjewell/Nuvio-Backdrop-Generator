export const CACHE_KEY = "nuvio_image_cache";

export const DEFAULT_SOURCE = {
  tab: "filter",
  imageType: "backdrop",
  filter: {
    type: "movie",
    sort: "popular",
    genre: "",
    provider: "",
    decade: null,
    language: "",
  },
  trakt: {
    mode: "url",
    url: "",
    username: "",
    listId: "",
    selectedListName: "",
    mediaType: "movies",
  },
  mdblist: {
    mode: "url",
    url: "",
    listId: "",
    selectedListName: "",
    searchUsername: "",
    mediaType: "",
  },
};

export const DEFAULT_LAYOUT = {
  angle: 12,
  gap: 12,
  scale: 120,
  radius: 8,
  stagger: 120,
  autoStagger: true,
  offsetX: 0,
  offsetY: 0,
  imageOpacity: 100,
};

export const DEFAULT_OVERLAY = {
  preset: "cinematic",
  opacity: 0.85,
  bgColor: "transparent",
  reach: 0.6,
};

export const DEFAULT_TEXT = {
  content: "",
  font: "Inter",
  size: 100,
  preset: "bottom-left",
  offsetX: 0,
  offsetY: 0,
  color: "#ffffff",
  shadow: true,
  shadowBlur: 24,
  gradient: false,
  gradientTo: "#a855f7",
};

export function getSourceKey(source) {
  if (source.tab === "filter") {
    const { type, sort, genre, provider } = source.filter;
    return `filter|${type}|${sort}|${genre}|${provider}`;
  }
  if (source.tab === "trakt") {
    const { mode, url, listId, mediaType } = source.trakt;
    if (mode === "url") return `trakt|url|${url}`;
    if (mode === "trending-media" || mode === "popular-media")
      return `trakt|${mode}|${mediaType}`;
    return `trakt|user|${listId}`;
  }
  const { mode, url, listId } = source.mdblist;
  return `mdblist|${mode}|${mode === "url" ? url : listId}`;
}
