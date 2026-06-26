export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/'

export const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 'anime', name: 'Anime' }, { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' }, { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' }, { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
]

export const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' },
  { id: 'anime', name: 'Anime' }, { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' }, { id: 9648, name: 'Mystery' }, { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' }, { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' }, { id: 10768, name: 'War & Politics' }, { id: 37, name: 'Western' },
]


export const RESOLUTIONS = [
  { label: '4K — 3840×2160', width: 3840, height: 2160 },
  { label: '1440p — 2560×1440', width: 2560, height: 1440 },
  { label: '1080p — 1920×1080', width: 1920, height: 1080 },
  { label: '720p — 1280×720', width: 1280, height: 720 },
]

export const TEXT_FONTS = [
  { value: 'Inter',            weight: 700 },
  { value: 'Bebas Neue',       weight: 400 },
  { value: 'Montserrat',       weight: 800 },
  { value: 'Oswald',           weight: 600 },
  { value: 'Playfair Display', weight: 700 },
  { value: 'Roboto Condensed', weight: 700 },
]

export const WATCH_PROVIDERS = [
  { id: '8',       name: 'Netflix' },
  { id: '10',      name: 'Amazon Prime' },
  { id: '337',     name: 'Disney+' },
  { id: '1899',    name: 'HBO Max' },
  { id: '2',       name: 'Apple TV+' },
  { id: '15',      name: 'Hulu' },
  { id: '2303',    name: 'Paramount+' },
  { id: '386|387', name: 'Peacock' },
  { id: '290',     name: 'Hallmark' },
  { id: '99',      name: 'Shudder' },
  { id: '520',     name: 'Discovery+' },
  { id: '190',     name: 'Curiosity Stream' },
  { id: '1956',    name: 'Angel Studios' },
]

export const DECADES = [
  { value: 1960, label: "60s" },
  { value: 1970, label: "70s" },
  { value: 1980, label: "80s" },
  { value: 1990, label: "90s" },
  { value: 2000, label: "00s" },
  { value: 2010, label: "10s" },
  { value: 2020, label: "20s" },
]

export const MOVIE_SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'now_playing', label: 'Now Playing' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'trending_week', label: 'Trending This Week' },
]

export const TV_SORT_OPTIONS = [
  { value: 'popular', label: 'Popular' },
  { value: 'top_rated', label: 'Top Rated' },
  { value: 'on_the_air', label: 'On The Air' },
  { value: 'airing_today', label: 'Airing Today' },
  { value: 'trending_week', label: 'Trending This Week' },
]

