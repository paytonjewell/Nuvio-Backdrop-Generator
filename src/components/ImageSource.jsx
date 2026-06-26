import React from "react";
import { SectionLabel, Card, Field, FieldLabel, ToggleRow, TabGroup, Notice, ResetButton } from "./UI";
import { MOVIE_GENRES, TV_GENRES, MOVIE_SORT_OPTIONS, TV_SORT_OPTIONS, WATCH_PROVIDERS } from "../lib/constants";

export default function ImageSource({ source, onChange, onReset }) {
  const { tab, filter, trakt, imageType } = source;

  const genres = filter.type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const allSortOptions = filter.type === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;
  const sortOptions = filter.provider
    ? allSortOptions.filter((o) => o.value !== "trending_week")
    : allSortOptions;

  const setFilter = (patch) => onChange({ ...source, filter: { ...filter, ...patch } });
  const setTrakt = (patch) => onChange({ ...source, trakt: { ...trakt, ...patch } });

  return (
    <div>
      <SectionLabel action={<ResetButton onClick={onReset} />}>Image Source</SectionLabel>
      <Card>
        <Field>
          <ToggleRow
            options={[
              { value: 'backdrop', label: 'Backdrops' },
              { value: 'poster', label: 'Posters' },
            ]}
            value={imageType}
            onChange={(v) => onChange({ ...source, imageType: v })}
          />
        </Field>
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
                onChange={(e) => {
                  const sort = e.target.value
                  setFilter({ sort, ...(sort === "trending_week" && { provider: "" }) })
                }}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            {filter.sort !== "trending_week" && (
              <Field>
                <FieldLabel>Streaming Service (optional)</FieldLabel>
                <select
                  value={filter.provider}
                  onChange={(e) => setFilter({ provider: e.target.value })}
                >
                  <option value="">Any</option>
                  {WATCH_PROVIDERS.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </Field>
            )}
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
