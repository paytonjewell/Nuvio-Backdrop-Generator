# Nuvio Backdrop Generator

Generate streaming-style hero backdrop images from TMDB — download as a 1920×1080 PNG ready for Plex, Jellyfin, home dashboards, or wherever you need a cinematic background.

<img width="1200" alt="CleanShot 2026-06-25 at 15 38 19" src="https://github.com/user-attachments/assets/db200508-bd54-4fed-95ef-f39487b7e395" />


## Features

- **TMDB Filter** — pull from Popular, Top Rated, Trending This Week, Now Playing, or On The Air, optionally filtered by genre
- **Trakt Lists** — paste any public Trakt list URL; movies and shows are detected automatically
- **Layout controls** — angle, card scale, gap, corner radius, vertical stagger, and X/Y position offset
- **Overlay presets** — Cinematic, Dark Left, Dark Right, Vignette, Bottom Fade, or None
- **1920×1080 PNG export** — one-click download
- **Shuffle** — reshuffle the loaded images without re-fetching

## Getting started

### API keys

You'll need a **TMDB API key** (Read Access Token) to use the app. A Trakt Client ID is only required if you want to pull from Trakt lists.

- **TMDB** — create a free account at [themoviedb.org](https://www.themoviedb.org/), go to Settings → API, and copy your **API Read Access Token** (the long JWT, not the short API key)
- **Trakt** — create an app at [trakt.tv/oauth/applications](https://trakt.tv/oauth/applications) and copy the **Client ID**

Keys are saved to `localStorage` and never leave your browser.

### Hosted version

[**Open Nuvio Backdrop Generator →**](https://paytonpierce.dev/Nuvio-Backdrop-Generator/)

### Run locally

```bash
git clone https://github.com/paytonpierce/Nuvio-Backdrop-Generator.git
cd Nuvio-Backdrop-Generator
npm install
npm run dev
```

## Usage

1. Enter your TMDB API Read Access Token in the API Keys section
2. Choose a source — **TMDB Filter** or **Trakt**
3. Configure the layout and overlay to your taste
4. Click **Generate Backdrop**
5. Optionally **Shuffle Images** to reorder without re-fetching
6. Click **Download PNG** to save the 1920×1080 image

## Tech stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TMDB API](https://developer.themoviedb.org/docs)
- [Trakt API](https://trakt.docs.apiary.io/)
- HTML Canvas for rendering and export
- GitHub Pages for hosting
