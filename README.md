# Nuvio Backdrop Generator

Generate streaming-style hero backdrop images from TMDB — then save them directly to your Nuvio collection folders, or download as a PNG.

<img width="1200" alt="CleanShot 2026-06-29 at 23 40 41@2x" src="https://github.com/user-attachments/assets/27bc8368-0e14-4da4-a86d-7968e1cd5905" />

## Features

**Image sources**

- **TMDB Filter** — pull from Popular, Top Rated, Trending This Week, Now Playing, or On The Air, filtered by genre, streaming service, decade, or language. Choose **Movies**, **TV Shows**, or **Movies & Shows** (combined).
- **Trakt** — browse trending or popular movies, shows, or both directly (using Trakt's `/media/trending` and `/media/popular` endpoints); search any user's public lists by username, or paste a direct list URL
- **MDBList** — browse your own lists, official MDBList curated collections, the top 25 public lists, or search any user's lists by username; also accepts a direct URL

**Backdrop styles**

- **Backdrops** — classic landscape-orientation hero images (16:9)
- **Posters** — portrait-orientation poster collage (2:3); switching modes reuses fetched data with no extra API call

**Layout**

- Row direction (straight or angled), card scale, gap, corner radius, image opacity, and X/Y canvas offset
- Vertical stagger defaults to **Auto** mode — computes the exact half-card offset for a brick/masonry layout, and recalculates automatically when scale or gap changes
- Each section has a ↺ reset button that restores defaults instantly

**Text overlay**

- Add a title or label directly onto the canvas
- Choose from Inter, Bebas Neue, Montserrat, Oswald, Playfair Display, or Roboto Condensed
- 9-position grid + fine X/Y offset, adjustable size, color, horizontal gradient, and drop shadow

**Overlay**

- Presets: Cinematic, Dark Left, Dark Right, Vignette, Bottom Fade, or None
- Adjustable opacity and gradient coverage

**Save to Nuvio**

Sign in with your Nuvio account (gear menu → Sign in with Nuvio) to unlock the **Save to Collection** button. The flow:

1. Pick a profile and browse your collection folders
2. A before/after comparison slider previews how your generated backdrop looks against the existing one — drag to compare
3. Hit **Save to Nuvio** to upload the image and write it to the folder's `heroBackdropUrl` automatically

Sessions persist locally and refresh automatically. The full collections JSON is reconstructed and pushed in one operation, preserving all existing collections, folders, and their order.

**Export**

- Resolution selector — 720p, 1080p, 1440p, or 4K; preview updates live
- One-click PNG download with transparent background support

**Persistence**

- All settings (layout, text, overlay, source filters) saved to `localStorage` and restored on next visit
- The generated canvas is restored on page refresh — no need to re-generate after an accidental reload
- Both backdrop and poster paths cached per source so switching image style is instant
- Individual TMDB ID lookups cached locally for 30 days — titles shared across lists are only fetched once

## Getting started

### API keys

You'll need a **TMDB API key** (Read Access Token) to use the app. The others are optional depending on which sources you use.

- **TMDB** — create a free account at [themoviedb.org](https://www.themoviedb.org/), go to Settings → API, and copy your **API Read Access Token** (the long JWT, not the short API key)
- **Trakt** — create an app at [trakt.tv/oauth/applications](https://trakt.tv/oauth/applications) and copy the **Client ID**
- **MDBList** — get a free key at [mdblist.com/preferences](https://mdblist.com/preferences#apikey)
- **Nuvio** — sign in with your existing Nuvio account credentials directly in the app (gear menu → Sign in with Nuvio); no separate key required

All keys and session data are saved to `localStorage` and never leave your browser. The API Keys section shows a live validity indicator for each key and can be collapsed once configured.

### Hosted version

[**Open Nuvio Backdrop Generator →**](https://paytonjewell.github.io/nuvio-backdrop-generator/)

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
3. Select **Backdrops** or **Posters** style in the canvas preview toolbar
4. Configure layout, text overlay, and overlay gradient to your taste
5. Click **Generate Backdrop**
6. Use **Shuffle** in the preview toolbar to reorder without re-fetching
7. To save to Nuvio: click **Save to Collection**, pick a profile and folder, compare old vs. new with the slider, and click **Save to Nuvio**
8. To download: click **Download**, select a resolution (720p → 4K), and save the PNG

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TMDB API](https://developer.themoviedb.org/docs)
- [Trakt API](https://docs.trakt.tv/docs/getting-started)
- [MDBList API](https://docs.mdblist.com/docs/api)
- [Nuvio Cloud API](https://nuvio.tv) (Supabase-backed)
- [ImgBB API](https://api.imgbb.com/) for backdrop image hosting
- HTML Canvas for rendering and export
- GitHub Pages for hosting
