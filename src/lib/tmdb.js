import { TMDB_IMAGE_BASE } from './constants'

export async function fetchTMDB(endpoint, params = {}, apiKey) {
  if (!apiKey) throw new Error('No TMDB API key provided')
  const url = new URL('https://api.themoviedb.org/3' + endpoint)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), { headers: { Authorization: 'Bearer ' + apiKey } })
  if (!res.ok) throw new Error('TMDB error ' + res.status + ' — check your API key')
  return res.json()
}

export async function validateTMDBKey(key) {
  const res = await fetch('https://api.themoviedb.org/3/authentication', {
    headers: { Authorization: 'Bearer ' + key },
  })
  return res.ok
}

export async function validateTraktKey(key) {
  const res = await fetch('https://api.trakt.tv/movies/trending?limit=1', {
    headers: { 'trakt-api-version': '2', 'trakt-api-key': key },
  })
  return res.ok
}

export async function fetchFilterImages({ type, sort, genre, apiKey }) {
  let endpoint, params = {}

  if (sort === 'trending_week' && !genre) {
    endpoint = `/trending/${type}/week`
  } else if (genre) {
    endpoint = `/discover/${type}`
    params = { with_genres: genre, sort_by: 'popularity.desc', include_adult: 'false' }
  } else {
    endpoint = `/${type}/${sort}`
    params = { include_adult: 'false' }
  }

  const paths = new Set()
  let page = 1
  while (paths.size < 200) {
    const data = await fetchTMDB(endpoint, { ...params, page }, apiKey)
    for (const item of data.results) {
      if (item.backdrop_path) paths.add(item.backdrop_path)
    }
    if (page >= Math.min(data.total_pages, 20)) break
    page++
  }
  return [...paths]
}

export async function fetchTraktImages({ url, traktKey, apiKey }) {
  const m = url.match(/trakt\.tv\/users\/([^/]+)\/lists\/([^/?]+)/)
  if (!m) throw new Error('Invalid Trakt URL format')
  const [, user, list] = m
  if (!traktKey) throw new Error('Please enter your Trakt Client ID')
  const res = await fetch(
    `https://api.trakt.tv/users/${user}/lists/${list}/items?limit=100`,
    { headers: { 'trakt-api-version': '2', 'trakt-api-key': traktKey } }
  )
  if (!res.ok) throw new Error('Trakt error ' + res.status + ' — check Client ID and that the list is public')
  const items = await res.json()
  const paths = []
  for (const item of items) {
    let tmdbId, tmdbType
    if (item.type === 'movie' && item.movie?.ids?.tmdb) {
      tmdbId = item.movie.ids.tmdb
      tmdbType = 'movie'
    } else if (item.type === 'show' && item.show?.ids?.tmdb) {
      tmdbId = item.show.ids.tmdb
      tmdbType = 'tv'
    } else {
      continue
    }
    try {
      const data = await fetchTMDB(`/${tmdbType}/${tmdbId}`, {}, apiKey)
      if (data.backdrop_path) paths.push(data.backdrop_path)
    } catch (e) { /* skip */ }
  }
  return paths
}

export function loadImages(paths) {
  return Promise.allSettled(
    paths.map(p => new Promise((res, rej) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => res(img)
      img.onerror = rej
      img.src = TMDB_IMAGE_BASE + 'w780' + p
    }))
  ).then(results => results.filter(r => r.status === 'fulfilled').map(r => r.value))
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
