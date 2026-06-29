# Nuvio Backdrop Generator

Generate streaming-style hero backdrop images from TMDB — download as a PNG ready for Nuvio collections, or wherever you need a cinematic background.

<img width="1200" alt="CleanShot 2026-06-25 at 15 38 19" src="https://github.com/user-attachments/assets/db200508-bd54-4fed-95ef-f39487b7e395" />

## Features

**Image sources**

- **TMDB Filter** — pull from Popular, Top Rated, Trending This Week, Now Playing, or On The Air, filtered by genre (including Anime), streaming service, or decade
- **Trakt Lists** — paste any public Trakt list URL; movies and shows are detected automatically, mixed lists supported
- **MDBList** — browse your own lists, official MDBList curated collections, the top 25 public lists, or search any user's lists by username; also accepts a direct URL

**Backdrop styles**

- **Backdrops** — classic landscape-orientation hero images (16:9)
- **Posters** — portrait-orientation poster collage (2:3); switching modes reuses fetched data with no extra API call

**Layout**

- Row direction (straight or angled), card scale, gap, corner radius, vertical stagger, image opacity, and X/Y canvas offset
- Each section has a ↺ reset button that restores defaults instantly

**Text overlay**

- Add a title or label directly onto the canvas
- Choose from Inter, Bebas Neue, Montserrat, Oswald, Playfair Display, or Roboto Condensed
- 9-position grid + fine X/Y offset, adjustable size, color, horizontal gradient, and drop shadow

**Overlay**

- Presets: Cinematic, Dark Left, Dark Right, Vignette, Bottom Fade, or None
- Adjustable opacity and gradient coverage

**Export**

- Resolution selector — 720p, 1080p, 1440p, or 4K; preview updates live
- One-click PNG download with transparent background support

**Persistence**

- Settings saved to `localStorage` and restored on next visit
- Both backdrop and poster paths cached per source so switching image style is instant
- Individual TMDB ID lookups cached locally for 30 days — titles shared across lists are only fetched once

## Getting started

### API keys

You'll need a **TMDB API key** (Read Access Token) to use the app. The others are optional depending on which sources you use.

- **TMDB** — create a free account at [themoviedb.org](https://www.themoviedb.org/), go to Settings → API, and copy your **API Read Access Token** (the long JWT, not the short API key)
- **Trakt** — create an app at [trakt.tv/oauth/applications](https://trakt.tv/oauth/applications) and copy the **Client ID**
- **MDBList** — get a free key at [mdblist.com/preferences](https://mdblist.com/preferences#apikey)

All keys are saved to `localStorage` and never leave your browser. The API Keys section shows a live validity indicator for each key and can be collapsed once configured.

<!-- ### Hosted version

[**Open Nuvio Backdrop Generator →**](https://paytonjewell.github.io/Nuvio-Backdrop-Generator/) -->

### Run locally

```bash
git clone https://github.com/paytonjewell/Nuvio-Backdrop-Generator.git
cd Nuvio-Backdrop-Generator
npm install
npm run dev
```

## Usage

1. Enter your TMDB API Read Access Token in the API Keys section
2. Choose a source — **TMDB Filter**, **Trakt**, or **MDBList**
3. Select **Backdrops** or **Posters** style in the Layout section
4. Configure layout, text overlay, and overlay gradient to your taste
5. Click **Generate Backdrop**
6. Use **Shuffle** in the preview toolbar to reorder without re-fetching
7. Select an export resolution (720p → 4K) and click **Download PNG**

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TMDB API](https://developer.themoviedb.org/docs)
- [Trakt API](https://trakt.docs.apiary.io/)
- [MDBList API](https://mdblist.com/api)
- HTML Canvas for rendering and export
- GitHub Pages for hosting
