# Nuvio Backdrop Generator

Generate streaming-style hero backdrop images from TMDB — download as a 1920×1080 PNG ready for Plex, Jellyfin, home dashboards, or wherever you need a cinematic background.

<img width="1200" alt="CleanShot 2026-06-25 at 15 38 19" src="https://github.com/user-attachments/assets/db200508-bd54-4fed-95ef-f39487b7e395" />

## Features

**Image sources**
- **TMDB Filter** — pull from Popular, Top Rated, Trending This Week, Now Playing, or On The Air
- **Genre filter** — any TMDB genre including Anime
- **Decade filter** — scope results to the 60s, 70s, 80s, 90s, 00s, 10s, or 20s
- **Streaming service filter** — narrow to Netflix, Amazon Prime, Disney+, HBO Max, Apple TV+, Hulu, Paramount+, Peacock, Hallmark, Shudder, Discovery+, Curiosity Stream, or Angel Studios
- **Trakt Lists** — paste any public Trakt list URL; movies and shows are detected automatically, mixed lists supported

**Backdrop styles**
- **Backdrops** — classic landscape-orientation hero images (16:9)
- **Posters** — portrait-orientation poster collage (2:3); switching modes reuses fetched data with no extra API call

**Layout**
- Row direction (straight or angled), card scale, gap, corner radius, vertical stagger, image opacity, and X/Y canvas offset
- Per-section **reset buttons** restore defaults instantly

**Text overlay**
- Add a title or label directly onto the canvas
- Choose from Inter, Bebas Neue, Montserrat, Oswald, Playfair Display, or Roboto Condensed
- 9-position grid + fine X/Y offset, adjustable size, color, horizontal gradient, and drop shadow

**Overlay**
- Presets: Cinematic, Dark Left, Dark Right, Vignette, Bottom Fade, or None
- Adjustable opacity and gradient coverage

**Export**
- **Resolution selector** — export at 720p, 1080p, 1440p, or 4K; preview updates live
- One-click PNG download with transparent background support

**Persistence**
- Layout, text, and overlay settings are saved to `localStorage` and restored on next visit
- Image cache stores both backdrop and poster paths so switching modes is instant

## Getting started

### API keys

You'll need a **TMDB API key** (Read Access Token) to use the app. A Trakt Client ID is only required if you want to pull from Trakt lists.

- **TMDB** — create a free account at [themoviedb.org](https://www.themoviedb.org/), go to Settings → API, and copy your **API Read Access Token** (the long JWT, not the short API key)
- **Trakt** — create an app at [trakt.tv/oauth/applications](https://trakt.tv/oauth/applications) and copy the **Client ID**

Keys are saved to `localStorage` and never leave your browser.

<!-- ### Hosted version

[**Open Nuvio Backdrop Generator →**](https://paytonpierce.dev/Nuvio-Backdrop-Generator/) -->

### Run locally

```bash
git clone https://github.com/paytonjewell/Nuvio-Backdrop-Generator.git
cd Nuvio-Backdrop-Generator
npm install
npm run dev
```

## Usage

1. Enter your TMDB API Read Access Token in the API Keys section
2. Choose a source — **TMDB Filter** or **Trakt**
3. Toggle between **Backdrops** and **Posters** style
4. Configure layout, text, and overlay to your taste
5. Click **Generate Backdrop**
6. Optionally **Shuffle Images** to reorder without re-fetching
7. Select an export resolution (720p → 4K) and click **Download PNG**

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TMDB API](https://developer.themoviedb.org/docs)
- [Trakt API](https://trakt.docs.apiary.io/)
- HTML Canvas for rendering and export
- GitHub Pages for hosting
