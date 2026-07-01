import { TMDB_IMAGE_BASE, COMBINED_GENRES } from "./constants";

export async function fetchTMDB(endpoint, params = {}, apiKey) {
  if (!apiKey) throw new Error("No TMDB API key provided");
  const url = new URL("https://api.themoviedb.org/3" + endpoint);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    headers: { Authorization: "Bearer " + apiKey },
  });
  if (!res.ok)
    throw new Error("TMDB error " + res.status + " — check your API key");
  return res.json();
}

export async function validateTMDBKey(key) {
  const res = await fetch("https://api.themoviedb.org/3/authentication", {
    headers: { Authorization: "Bearer " + key },
  });
  return res.ok;
}

export async function validateTraktKey(key) {
  const res = await fetch("https://api.trakt.tv/movies/trending?limit=1", {
    headers: { "trakt-api-version": "2", "trakt-api-key": key },
  });
  return res.ok;
}

export async function fetchTraktLists(endpoint, traktKey) {
  if (!traktKey) throw new Error("Please enter your Trakt Client ID");
  const res = await fetch(`https://api.trakt.tv/${endpoint}?limit=100`, {
    headers: { "trakt-api-version": "2", "trakt-api-key": traktKey },
  });
  if (!res.ok)
    throw new Error("Trakt error " + res.status + " — check your Client ID");
  return res.json();
}

async function batchedAllSettled(items, fn, batchSize = 40) {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

export async function validateMDBListKey(key) {
  const res = await fetch(`https://api.mdblist.com/user?apikey=${key}`);
  return res.ok;
}

export async function fetchMDBLists(endpoint, mdblistKey, extraParams = {}) {
  const params = new URLSearchParams(extraParams);
  if (mdblistKey) params.set("apikey", mdblistKey);
  const res = await fetch(`https://api.mdblist.com/${endpoint}?${params}`);
  if (!res.ok) throw new Error("MDBList error " + res.status);
  const data = await res.json();
  return Array.isArray(data) ? data : data.lists || data.data || [];
}

const ID_CACHE_KEY = "nuvio_tmdb_ids";
const ID_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days
const ID_CACHE_MAX = 10_000;

function loadIdCache() {
  try {
    return JSON.parse(localStorage.getItem(ID_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveIdCache(cache) {
  try {
    const keys = Object.keys(cache);
    const trimmed =
      keys.length > ID_CACHE_MAX
        ? Object.fromEntries(
            keys.slice(-ID_CACHE_MAX).map((k) => [k, cache[k]]),
          )
        : cache;
    localStorage.setItem(ID_CACHE_KEY, JSON.stringify(trimmed));
  } catch {}
}

const DISCOVER_SORT_MAP = {
  popular: "popularity.desc",
  top_rated: "vote_average.desc",
  now_playing: "popularity.desc",
  upcoming: "primary_release_date.asc",
  on_the_air: "popularity.desc",
  airing_today: "popularity.desc",
  trending_week: "popularity.desc",
};

// Always returns both { backdrop: [...], poster: [...] }
export async function fetchMDBListImages({
  url,
  listId,
  mediaType,
  mdblistKey,
  apiKey,
}) {
  let listPath;
  if (listId) {
    listPath = String(listId);
  } else {
    const m = url?.match(/mdblist\.com\/lists\/([^?#]+)/);
    if (!m)
      throw new Error(
        "Invalid MDBList URL — expected https://mdblist.com/lists/username/listname",
      );
    listPath = m[1].replace(/\/$/, "");
  }

  const params = new URLSearchParams({ limit: "1000" });
  if (mdblistKey) params.set("apikey", mdblistKey);
  if (mediaType) params.set("mediatype", mediaType);

  const res = await fetch(
    `https://api.mdblist.com/lists/${listPath}/items?${params}`,
  );
  if (!res.ok)
    throw new Error(
      "MDBList error " +
        res.status +
        (res.status === 401
          ? " — API key required. Add your MDBList key in the API Keys section."
          : " — check your list URL"),
    );
  const data = await res.json();

  const items = [
    ...(data.movies || []).map((item) => ({
      tmdbId: item.ids?.tmdb || item.id,
      tmdbType: "movie",
    })),
    ...(data.shows || []).map((item) => ({
      tmdbId: item.ids?.tmdb || item.id,
      tmdbType: "tv",
    })),
  ].filter((item) => item.tmdbId);

  const idCache = loadIdCache();
  const newCacheEntries = {};

  const results = await batchedAllSettled(
    items,
    async ({ tmdbId, tmdbType }) => {
      const key = `${tmdbType}:${tmdbId}`;
      const cached = idCache[key];
      if (cached && Date.now() - cached.ts < ID_CACHE_TTL)
        return { backdrop: cached.backdrop, poster: cached.poster };
      const d = await fetchTMDB(`/${tmdbType}/${tmdbId}`, {}, apiKey);
      const entry = {
        backdrop: d.backdrop_path || null,
        poster: d.poster_path || null,
        ts: Date.now(),
      };
      newCacheEntries[key] = entry;
      return { backdrop: entry.backdrop, poster: entry.poster };
    },
  );

  if (Object.keys(newCacheEntries).length > 0)
    saveIdCache({ ...idCache, ...newCacheEntries });

  const fulfilled = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  return {
    backdrop: fulfilled.map((r) => r.backdrop).filter(Boolean),
    poster: fulfilled.map((r) => r.poster).filter(Boolean),
  };
}

// Always returns both { backdrop: [...], poster: [...] }
export async function fetchFilterImages({
  type,
  sort,
  genre,
  provider,
  decade,
  language,
  region,
  apiKey,
  maxBackdrops = 200,
}) {
  // "Movies & Shows" — trending uses the single /trending/all/week endpoint;
  // all other sorts run two parallel single-type requests and merge.
  if (type === "both") {
    const combined = genre ? COMBINED_GENRES.find((g) => g.id === genre) : null;
    const useDiscover = !!(genre || provider || decade || language);
    if (sort === "trending_week" && !useDiscover) {
      const backdrops = new Set(),
        posters = new Set();
      let page = 1;
      while (backdrops.size < maxBackdrops) {
        const data = await fetchTMDB("/trending/all/week", { page }, apiKey);
        for (const item of data.results) {
          if (item.backdrop_path) backdrops.add(item.backdrop_path);
          if (item.poster_path) posters.add(item.poster_path);
        }
        if (page >= Math.min(data.total_pages, 20)) break;
        page++;
      }
      return { backdrop: [...backdrops], poster: [...posters] };
    }
    const half = Math.ceil(maxBackdrops / 2);
    const base = {
      sort,
      provider,
      decade,
      language,
      apiKey,
      maxBackdrops: half,
    };
    const [movies, shows] = await Promise.all([
      fetchFilterImages({
        ...base,
        type: "movie",
        genre: combined ? combined.movieGenre : "",
      }),
      fetchFilterImages({
        ...base,
        type: "tv",
        genre: combined ? combined.tvGenre : "",
      }),
    ]);
    return {
      backdrop: [
        ...movies.backdrop.slice(0, half),
        ...shows.backdrop.slice(0, half),
      ],
      poster: [...movies.poster.slice(0, half), ...shows.poster.slice(0, half)],
    };
  }

  let endpoint,
    params = {};

  const useDiscover = !!(genre || provider || decade || language);

  if (sort === "trending_week" && !useDiscover) {
    endpoint = `/trending/${type}/week`;
  } else if (useDiscover) {
    endpoint = `/discover/${type}`;
    params = {
      sort_by: DISCOVER_SORT_MAP[sort] || "popularity.desc",
      include_adult: "false",
    };
    if (sort === "top_rated") params["vote_count.gte"] = "500";
    if (language) params.with_original_language = language;
    if (genre === "anime") params.with_keywords = "210024";
    else if (genre) params.with_genres = genre;
    if (provider) {
      params.with_watch_providers = provider;
      params.watch_region = "US";
      params.with_watch_monetization_types = "flatrate";
    }
    if (decade) {
      const start = `${decade}-01-01`;
      const end = `${decade + 9}-12-31`;
      if (type === "movie") {
        params["primary_release_date.gte"] = start;
        params["primary_release_date.lte"] = end;
      } else {
        params["first_air_date.gte"] = start;
        params["first_air_date.lte"] = end;
      }
    }
  } else {
    endpoint = `/${type}/${sort}`;
    params = { include_adult: "false" };
    if (sort === "now_playing" && region) params.region = region;
  }

  const backdrops = new Set();
  const posters = new Set();
  let page = 1;
  const maxPages = sort === "now_playing" ? 5 : 20;
  while (backdrops.size < maxBackdrops) {
    const data = await fetchTMDB(endpoint, { ...params, page }, apiKey);
    for (const item of data.results) {
      if (item.backdrop_path) backdrops.add(item.backdrop_path);
      if (item.poster_path) posters.add(item.poster_path);
    }
    if (page >= Math.min(data.total_pages, maxPages)) break;
    page++;
  }
  return { backdrop: [...backdrops], poster: [...posters] };
}

// Always returns both { backdrop: [...], poster: [...] }
export async function fetchTraktImages({
  url,
  mode,
  listId,
  mediaType,
  traktKey,
  apiKey,
}) {
  if (!traktKey) throw new Error("Please enter your Trakt Client ID");

  let items;
  if (!mode || mode === "url") {
    const m = url?.match(/trakt\.tv\/users\/([^/]+)\/lists\/([^/?]+)/);
    if (!m) throw new Error("Invalid Trakt URL format");
    const [, user, list] = m;
    const res = await fetch(
      `https://api.trakt.tv/users/${user}/lists/${list}/items?limit=100`,
      { headers: { "trakt-api-version": "2", "trakt-api-key": traktKey } },
    );
    if (!res.ok)
      throw new Error(
        "Trakt error " +
          res.status +
          " — check Client ID and that the list is public",
      );
    items = await res.json();
  } else if (mode === "trending-media" || mode === "popular-media") {
    const sortPath = mode === "trending-media" ? "trending" : "popular";
    const isTrending = mode === "trending-media";
    const traktHeaders = {
      "trakt-api-version": "2",
      "trakt-api-key": traktKey,
    };

    const fetchTypePath = async (typePath) => {
      const res = await fetch(
        `https://api.trakt.tv/${typePath}/${sortPath}?limit=100`,
        { headers: traktHeaders },
      );
      if (!res.ok)
        throw new Error(
          "Trakt error " + res.status + " — check your Client ID",
        );
      const data = await res.json();
      return data.map((item) =>
        typePath === "movies"
          ? { type: "movie", movie: isTrending ? item.movie : item }
          : { type: "show", show: isTrending ? item.show : item },
      );
    };

    if (mediaType === "both") {
      const endpoint = isTrending ? "media/trending" : "media/popular";
      const res = await fetch(`https://api.trakt.tv/${endpoint}?limit=100`, {
        headers: traktHeaders,
      });
      if (!res.ok)
        throw new Error(
          "Trakt error " + res.status + " — check your Client ID",
        );
      const data = await res.json();
      items = data.map((item) =>
        item.type === "movie"
          ? { type: "movie", movie: item.movie }
          : { type: "show", show: item.show },
      );
    } else {
      items = await fetchTypePath(mediaType === "shows" ? "shows" : "movies");
    }
  } else {
    if (!listId) throw new Error("Please select a list first");
    const res = await fetch(
      `https://api.trakt.tv/lists/${listId}/items?limit=100`,
      { headers: { "trakt-api-version": "2", "trakt-api-key": traktKey } },
    );
    if (!res.ok)
      throw new Error("Trakt error " + res.status + " — check your Client ID");
    items = await res.json();
  }

  const lookups = items
    .map((item) => {
      if (item.type === "movie" && item.movie?.ids?.tmdb)
        return { tmdbId: item.movie.ids.tmdb, tmdbType: "movie" };
      if (item.type === "show" && item.show?.ids?.tmdb)
        return { tmdbId: item.show.ids.tmdb, tmdbType: "tv" };
      return null;
    })
    .filter(Boolean);

  const idCache = loadIdCache();
  const newCacheEntries = {};

  const results = await batchedAllSettled(
    lookups,
    async ({ tmdbId, tmdbType }) => {
      const key = `${tmdbType}:${tmdbId}`;
      const cached = idCache[key];
      if (cached && Date.now() - cached.ts < ID_CACHE_TTL)
        return { backdrop: cached.backdrop, poster: cached.poster };
      const data = await fetchTMDB(`/${tmdbType}/${tmdbId}`, {}, apiKey);
      const entry = {
        backdrop: data.backdrop_path || null,
        poster: data.poster_path || null,
        ts: Date.now(),
      };
      newCacheEntries[key] = entry;
      return { backdrop: entry.backdrop, poster: entry.poster };
    },
  );

  if (Object.keys(newCacheEntries).length > 0)
    saveIdCache({ ...idCache, ...newCacheEntries });

  const fulfilled = results
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  return {
    backdrop: fulfilled.map((r) => r.backdrop).filter(Boolean),
    poster: fulfilled.map((r) => r.poster).filter(Boolean),
  };
}

export async function loadImages(paths) {
  const results = await Promise.allSettled(
    paths.map(
      (p) =>
        new Promise((res, rej) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => res(img);
          img.onerror = rej;
          img.src = TMDB_IMAGE_BASE + "w780" + p;
        }),
    ),
  );
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
