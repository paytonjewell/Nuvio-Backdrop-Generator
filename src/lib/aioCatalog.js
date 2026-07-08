import { fetchTMDB } from "./tmdb";

const AIO_CATALOG_KEY = "nuvio_aio_catalog";

// IDs that AIOMetadata ships without a metadata.discover block
const BUILTIN_IDS = new Set([
  "tmdb.trending",
  "tmdb.trending.movie",
  "tmdb.trending.series",
  "tmdb.top",
  "tmdb.top_rated",
]);

function resolveAIODate(token) {
  const match = token.match(/^__tmdb_date__:([^:]+):([^:]+)$/);
  if (!match) return token;
  const [, preset, side] = match;

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const fmt = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (preset === "today") return fmt(now);
  if (preset === "this_year") {
    return side === "from"
      ? `${now.getFullYear()}-01-01`
      : `${now.getFullYear()}-12-31`;
  }
  if (preset === "last_year") {
    if (side === "from") {
      const d = new Date(now);
      d.setFullYear(d.getFullYear() - 1);
      return fmt(d);
    }
    return fmt(now);
  }
  return token;
}

function resolveParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) => [
      k,
      typeof v === "string" && v.startsWith("__tmdb_date__")
        ? resolveAIODate(v)
        : v,
    ]),
  );
}

// Maps built-in catalog IDs to TMDB endpoint builders
function builtinEndpoint(catalogId, tmdbType) {
  if (catalogId === "tmdb.trending")
    return { endpoint: `/trending/${tmdbType}/week`, params: {} };
  if (catalogId === "tmdb.top")
    return {
      endpoint: `/${tmdbType}/popular`,
      params: { include_adult: "false" },
    };
  if (catalogId === "tmdb.top_rated")
    return {
      endpoint: `/${tmdbType}/top_rated`,
      params: { include_adult: "false" },
    };
  return null;
}

async function fetchOneCatalog(catalog, apiKey, maxBackdrops) {
  const tmdbType = catalog.type === "series" ? "tv" : "movie";

  let endpoint, params;

  if (catalog.metadata?.discover?.params) {
    endpoint = `/discover/${catalog.metadata.discover.mediaType}`;
    params = resolveParams(catalog.metadata.discover.params);
  } else {
    const builtin = builtinEndpoint(catalog.id, tmdbType);
    if (!builtin) return { backdrop: [], poster: [] };
    ({ endpoint, params } = builtin);
  }

  const backdrops = new Set();
  const posters = new Set();
  let page = 1;

  while (backdrops.size < maxBackdrops) {
    const data = await fetchTMDB(endpoint, { ...params, page }, apiKey);
    for (const item of data.results ?? []) {
      if (item.backdrop_path) backdrops.add(item.backdrop_path);
      if (item.poster_path) posters.add(item.poster_path);
    }
    if (page >= Math.min(data.total_pages ?? 1, 20)) break;
    page++;
  }

  return { backdrop: [...backdrops], poster: [...posters] };
}

export async function fetchAIOCatalogImages({
  catalogs,
  selectedIds,
  apiKey,
  maxTotal = 200,
}) {
  const selected = catalogs.filter(
    (c) => selectedIds.includes(catalogUniqueKey(c)) && c.source === "tmdb",
  );

  if (!selected.length) return { backdrop: [], poster: [] };

  const maxPerCatalog = Math.ceil(maxTotal / selected.length);

  const results = await Promise.allSettled(
    selected.map((c) => fetchOneCatalog(c, apiKey, maxPerCatalog)),
  );

  const backdrops = new Set();
  const posters = new Set();

  for (const r of results) {
    if (r.status === "fulfilled") {
      r.value.backdrop.forEach((p) => backdrops.add(p));
      r.value.poster.forEach((p) => posters.add(p));
    }
  }

  return { backdrop: [...backdrops], poster: [...posters] };
}

export function catalogUniqueKey(catalog) {
  return `${catalog.id}|${catalog.type}`;
}

export function isTMDBCatalog(catalog) {
  if (catalog.source !== "tmdb") return false;
  return !!catalog.metadata?.discover?.params || BUILTIN_IDS.has(catalog.id);
}

export function loadStoredAIOCatalogs() {
  try {
    return JSON.parse(localStorage.getItem(AIO_CATALOG_KEY) || "null");
  } catch {
    return null;
  }
}

export function saveAIOCatalogs(catalogs) {
  try {
    localStorage.setItem(AIO_CATALOG_KEY, JSON.stringify(catalogs));
  } catch {}
}

export function clearAIOCatalogs() {
  localStorage.removeItem(AIO_CATALOG_KEY);
}
