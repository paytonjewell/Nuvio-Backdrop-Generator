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

export async function fetchFilterImages({ type, sort, genre, provider, imageType = 'backdrop', apiKey }) {
  let endpoint, params = {}

  if (sort === 'trending_week' && !genre && !provider) {
    endpoint = `/trending/${type}/week`
  } else if (genre || provider) {
    endpoint = `/discover/${type}`
    params = { sort_by: 'popularity.desc', include_adult: 'false' }
    if (genre === 'anime') params.with_keywords = '210024'
    else if (genre) params.with_genres = genre
    if (provider) {
      params.with_watch_providers = provider
      params.watch_region = 'US'
      params.with_watch_monetization_types = 'flatrate'
    }
  } else {
    endpoint = `/${type}/${sort}`
    params = { include_adult: 'false' }
  }

  const paths = new Set()
  let page = 1
  while (paths.size < 200) {
    const data = await fetchTMDB(endpoint, { ...params, page }, apiKey)
    for (const item of data.results) {
      const path = imageType === 'poster' ? item.poster_path : item.backdrop_path
      if (path) paths.add(path)
    }
    if (page >= Math.min(data.total_pages, 20)) break
    page++
  }
  return [...paths]
}

export async function fetchTraktImages({ url, imageType = 'backdrop', traktKey, apiKey }) {
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

  const lookups = items
    .map(item => {
      if (item.type === 'movie' && item.movie?.ids?.tmdb)
        return { tmdbId: item.movie.ids.tmdb, tmdbType: 'movie' }
      if (item.type === 'show' && item.show?.ids?.tmdb)
        return { tmdbId: item.show.ids.tmdb, tmdbType: 'tv' }
      return null
    })
    .filter(Boolean)

  const results = await Promise.allSettled(
    lookups.map(({ tmdbId, tmdbType }) =>
      fetchTMDB(`/${tmdbType}/${tmdbId}`, {}, apiKey).then(data =>
        (imageType === 'poster' ? data.poster_path : data.backdrop_path) || null
      )
    )
  )

  return results
    .filter(r => r.status === 'fulfilled' && r.value)
    .map(r => r.value)
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
