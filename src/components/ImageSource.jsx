import React from "react";
import { SectionLabel, Card, Field, FieldLabel, TabGroup, Notice } from "./UI";
import { MOVIE_GENRES, TV_GENRES, MOVIE_SORT_OPTIONS, TV_SORT_OPTIONS } from "../lib/constants";

export default function ImageSource({ source, onChange }) {
  const { tab, filter, trakt } = source;

  const genres = filter.type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const sortOptions = filter.type === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;

  const setFilter = (patch) => onChange({ ...source, filter: { ...filter, ...patch } });
  const setTrakt = (patch) => onChange({ ...source, trakt: { ...trakt, ...patch } });

  return (
    <div>
      <SectionLabel>Image Source</SectionLabel>
      <Card>
        <TabGroup
          tabs={[
            { value: "filter", label: "TMDB Filter" },
            { value: "trakt", label: "Trakt" },
          ]}
          value={tab}
          onChange={(t) => onChange({ ...source, tab: t })}
        />

        {tab === "filter" && (
          <>
            <Field>
              <FieldLabel>Content Type</FieldLabel>
              <select
                value={filter.type}
                onChange={(e) => setFilter({ type: e.target.value, sort: "popular", genre: "" })}
              >
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </Field>
            <Field>
              <FieldLabel>Source</FieldLabel>
              <select
                value={filter.sort}
                onChange={(e) => setFilter({ sort: e.target.value })}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Genre (optional)</FieldLabel>
              <select
                value={filter.genre}
                onChange={(e) => setFilter({ genre: e.target.value })}
              >
                <option value="">Any Genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {tab === "trakt" && (
          <>
            <Field>
              <FieldLabel>Trakt List URL</FieldLabel>
              <input
                type="text"
                value={trakt.url}
                onChange={(e) => setTrakt({ url: e.target.value })}
                placeholder="https://trakt.tv/users/username/lists/listname"
              />
            </Field>
            <Notice style={{ marginTop: 8 }}>
              List must be public. Trakt Client ID required above.
            </Notice>
          </>
        )}
      </Card>
    </div>
  );
}
