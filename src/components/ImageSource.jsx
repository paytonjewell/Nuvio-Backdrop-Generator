import React from "react";
import {
  SectionLabel,
  Card,
  Field,
  FieldLabel,
  TabGroup,
  CollapseButton,
  Collapsible,
  useCollapsed,
  SearchableSelect,
} from "./ui/index.js";
import {
  MOVIE_GENRES,
  TV_GENRES,
  COMBINED_GENRES,
  MOVIE_SORT_OPTIONS,
  TV_SORT_OPTIONS,
  WATCH_PROVIDERS,
  DECADES,
  LANGUAGES,
  REGIONS,
} from "../lib/constants";
import MDBListBrowser, { MDBLIST_MODES } from "./MDBListBrowser";
import TraktBrowser, { TRAKT_MODES } from "./TraktBrowser";

const TIME_SENSITIVE_SORTS = [
  "trending_week",
  "now_playing",
  "upcoming",
  "on_the_air",
  "airing_today",
];

export default function ImageSource({
  source,
  onChange,
  onReset,
  traktKey,
  mdblistKey,
}) {
  const { tab, filter, trakt, mdblist } = source;
  const { collapsed, toggle } = useCollapsed("nuvio_collapsed_imagesource");

  const genres =
    filter.type === "tv"
      ? TV_GENRES
      : filter.type === "both"
        ? COMBINED_GENRES
        : MOVIE_GENRES;
  const allSortOptions =
    filter.type === "tv" ? TV_SORT_OPTIONS : MOVIE_SORT_OPTIONS;
  const sortOptions = filter.provider
    ? allSortOptions.filter((o) => o.value !== "trending_week")
    : allSortOptions;

  const isTimeSensitive = TIME_SENSITIVE_SORTS.includes(filter.sort);
  const isNowPlaying = filter.sort === "now_playing";

  const setFilter = (patch) =>
    onChange({ ...source, filter: { ...filter, ...patch } });
  const setTrakt = (patch) =>
    onChange({ ...source, trakt: { ...trakt, ...patch } });
  const setMdblist = (patch) =>
    onChange({ ...source, mdblist: { ...mdblist, ...patch } });

  return (
    <div>
      <SectionLabel
        action={<CollapseButton collapsed={collapsed} onClick={toggle} />}
        onClick={toggle}
      >
        Image Source
      </SectionLabel>
      <Collapsible open={!collapsed}>
        <Card onReset={onReset}>
          <TabGroup
            tabs={[
              { value: "trakt", label: "Trakt" },
              { value: "mdblist", label: "MDBList" },
              { value: "filter", label: "TMDB Filter" },
            ]}
            value={tab}
            onChange={(t) => onChange({ ...source, tab: t })}
          />

          {tab === "filter" && (
            <>
              <Field>
                <FieldLabel>Content Type</FieldLabel>
                <SearchableSelect
                  value={filter.type}
                  onChange={(v) =>
                    setFilter({ type: v, sort: "popular", genre: "" })
                  }
                  options={[
                    { value: "movie", label: "Movies" },
                    { value: "tv", label: "TV Shows" },
                    { value: "both", label: "Movies & Shows" },
                  ]}
                />
              </Field>
              <Field>
                <FieldLabel>Source</FieldLabel>
                <SearchableSelect
                  value={filter.sort}
                  onChange={(sort) => {
                    const timeSensitive = TIME_SENSITIVE_SORTS.includes(sort);
                    const nowPlaying = sort === "now_playing";
                    setFilter({
                      sort,
                      ...(sort === "trending_week" && { provider: "" }),
                      ...(timeSensitive && filter.decade && { decade: null }),
                      ...(nowPlaying && { genre: "", provider: "", language: "" }),
                    });
                  }}
                  options={sortOptions}
                />
              </Field>
              {!isNowPlaying && filter.sort !== "trending_week" && (
                <Field>
                  <FieldLabel>Streaming Service (optional)</FieldLabel>
                  <SearchableSelect
                    value={filter.provider}
                    onChange={(v) => setFilter({ provider: v })}
                    options={WATCH_PROVIDERS.map((p) => ({
                      value: p.id,
                      label: p.name,
                    }))}
                    emptyLabel="Any"
                  />
                </Field>
              )}
              {!isNowPlaying && (
                <Field>
                  <FieldLabel>Genre (optional)</FieldLabel>
                  <SearchableSelect
                    value={filter.genre}
                    onChange={(v) => setFilter({ genre: v })}
                    options={genres.map((g) => ({ value: g.id, label: g.name }))}
                    emptyLabel="Any Genre"
                  />
                </Field>
              )}
              {!isNowPlaying && (
                <Field>
                  <FieldLabel>Language (optional)</FieldLabel>
                  <SearchableSelect
                    value={filter.language || ""}
                    onChange={(v) => setFilter({ language: v })}
                    options={LANGUAGES.map((l) => ({
                      value: l.code,
                      label: l.name,
                    }))}
                    emptyLabel="Any Language"
                  />
                </Field>
              )}
              {isNowPlaying && (
                <Field>
                  <FieldLabel>Region</FieldLabel>
                  <SearchableSelect
                    value={filter.region || "US"}
                    onChange={(v) => setFilter({ region: v })}
                    options={REGIONS.map((r) => ({ value: r.code, label: r.name }))}
                  />
                </Field>
              )}
              {!isTimeSensitive && (
                <Field>
                  <FieldLabel>Decade (optional)</FieldLabel>
                  <SearchableSelect
                    value={filter.decade != null ? String(filter.decade) : ""}
                    onChange={(v) =>
                      setFilter({ decade: v ? Number(v) : null })
                    }
                    options={DECADES.map((d) => ({
                      value: String(d.value),
                      label: d.label,
                    }))}
                    emptyLabel="Any Era"
                  />
                </Field>
              )}
            </>
          )}

          {tab === "trakt" && (
            <>
              <Field>
                <FieldLabel>Source</FieldLabel>
                <SearchableSelect
                  value={trakt.mode}
                  onChange={(v) =>
                    setTrakt({ mode: v, listId: "", selectedListName: "" })
                  }
                  options={TRAKT_MODES}
                />
              </Field>

              {trakt.mode === "url" ? (
                <Field>
                  <FieldLabel>Trakt List URL</FieldLabel>
                  <input
                    type="text"
                    value={trakt.url}
                    onChange={(e) => setTrakt({ url: e.target.value })}
                    placeholder="https://trakt.tv/users/username/lists/listname"
                  />
                </Field>
              ) : (
                <TraktBrowser
                  trakt={trakt}
                  traktKey={traktKey}
                  onChange={setTrakt}
                />
              )}
            </>
          )}

          {tab === "mdblist" && (
            <>
              <Field>
                <FieldLabel>Source</FieldLabel>
                <SearchableSelect
                  value={mdblist.mode}
                  onChange={(v) =>
                    setMdblist({ mode: v, listId: "", selectedListName: "" })
                  }
                  options={MDBLIST_MODES}
                />
              </Field>

              {mdblist.mode === "url" ? (
                <>
                  <Field>
                    <FieldLabel>MDBList URL</FieldLabel>
                    <input
                      type="text"
                      value={mdblist.url}
                      onChange={(e) => setMdblist({ url: e.target.value })}
                      placeholder="https://mdblist.com/lists/username/listname"
                    />
                  </Field>
                </>
              ) : (
                <MDBListBrowser
                  mdblist={mdblist}
                  mdblistKey={mdblistKey}
                  onChange={setMdblist}
                />
              )}
            </>
          )}
        </Card>
      </Collapsible>
    </div>
  );
}
