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
} from "./ui/index.js";
import {
  MOVIE_GENRES,
  TV_GENRES,
  MOVIE_SORT_OPTIONS,
  TV_SORT_OPTIONS,
  WATCH_PROVIDERS,
  DECADES,
  LANGUAGES,
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

export default function ImageSource({ source, onChange, onReset, traktKey, mdblistKey }) {
  const { tab, filter, trakt, mdblist } = source;
  const { collapsed, toggle } = useCollapsed("nuvio_collapsed_imagesource");

  const genres = filter.type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const allSortOptions =
    filter.type === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;
  const sortOptions = filter.provider
    ? allSortOptions.filter((o) => o.value !== "trending_week")
    : allSortOptions;

  const isTimeSensitive = TIME_SENSITIVE_SORTS.includes(filter.sort);

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
              { value: "filter", label: "TMDB Filter" },
              { value: "trakt", label: "Trakt" },
              { value: "mdblist", label: "MDBList" },
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
                  onChange={(e) =>
                    setFilter({
                      type: e.target.value,
                      sort: "popular",
                      genre: "",
                    })
                  }
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
                    const sort = e.target.value;
                    const timeSensitive = TIME_SENSITIVE_SORTS.includes(sort);
                    setFilter({
                      sort,
                      ...(sort === "trending_week" && { provider: "" }),
                      ...(timeSensitive && filter.decade && { decade: null }),
                    });
                  }}
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
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
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
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
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <FieldLabel>Language (optional)</FieldLabel>
                <select
                  value={filter.language || ""}
                  onChange={(e) => setFilter({ language: e.target.value })}
                >
                  <option value="">Any Language</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </Field>
              {!isTimeSensitive && (
                <Field>
                  <FieldLabel>Decade (optional)</FieldLabel>
                  <select
                    value={filter.decade ?? ""}
                    onChange={(e) =>
                      setFilter({
                        decade: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                  >
                    <option value="">Any Era</option>
                    {DECADES.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field>
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filter.excludeNC17 || false}
                    onChange={(e) =>
                      setFilter({ excludeNC17: e.target.checked })
                    }
                    style={{
                      accentColor: "#6c63ff",
                      cursor: "pointer",
                      marginTop: 1,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {filter.type === "movie"
                      ? "Exclude NC-17"
                      : "Exclude TV-MA"}
                    <span
                      title="Best-effort only. Relies on TMDB certification data, which is incomplete — films without a US rating entry in TMDB will still appear."
                      style={{
                        color: "rgba(255,255,255,0.25)",
                        cursor: "help",
                        lineHeight: 1,
                        flexShrink: 0,
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
                        <path
                          d="M6 5.5v3M6 3.5v.5"
                          stroke="currentColor"
                          strokeWidth="1.2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  </span>
                </label>
              </Field>
            </>
          )}

          {tab === "trakt" && (
            <>
              <Field>
                <FieldLabel>Source</FieldLabel>
                <select
                  value={trakt.mode}
                  onChange={(e) =>
                    setTrakt({
                      mode: e.target.value,
                      listId: "",
                      selectedListName: "",
                    })
                  }
                >
                  {TRAKT_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
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
                <select
                  value={mdblist.mode}
                  onChange={(e) =>
                    setMdblist({
                      mode: e.target.value,
                      listId: "",
                      selectedListName: "",
                    })
                  }
                >
                  {MDBLIST_MODES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
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
