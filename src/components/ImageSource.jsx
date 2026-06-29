import React, { useState, useEffect } from "react";
import {
  SectionLabel,
  Card,
  Field,
  FieldLabel,
  TabGroup,
  Notice,
  CollapseButton,
  Collapsible,
  useCollapsed,
} from "./UI";
import {
  MOVIE_GENRES,
  TV_GENRES,
  MOVIE_SORT_OPTIONS,
  TV_SORT_OPTIONS,
  WATCH_PROVIDERS,
  DECADES,
} from "../lib/constants";
import { fetchMDBLists } from "../lib/tmdb";

const MDBLIST_MODES = [
  { value: "url", label: "URL" },
  { value: "my-lists", label: "My lists" },
  { value: "official", label: "Official lists" },
  { value: "top", label: "Top lists" },
  { value: "user", label: "Search by username" },
];

const MDBLIST_ENDPOINTS = {
  "my-lists": "lists/user",
  official: "lists/official",
  top: "lists/top",
};

function MDBListBrowser({ mdblist, mdblistKey, onChange }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState(mdblist.searchUsername || "");

  const endpoint = MDBLIST_ENDPOINTS[mdblist.mode];
  const needsKey = ["my-lists", "official", "top", "user"].includes(
    mdblist.mode,
  );

  useEffect(() => {
    if (!endpoint) return;
    if (needsKey && !mdblistKey) {
      setLists([]);
      return;
    }
    setLoading(true);
    setError("");
    fetchMDBLists(
      endpoint,
      mdblistKey,
      mdblist.mode === "top" ? { limit: "25" } : {},
    )
      .then((data) => {
        setLists(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, [mdblist.mode, mdblistKey]);

  const searchUser = () => {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    onChange({
      searchUsername: username.trim(),
      listId: "",
      selectedListName: "",
    });
    fetchMDBLists(`lists/user/${username.trim()}`, mdblistKey)
      .then((data) => {
        setLists(data);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  const getListPath = (list) =>
    mdblist.mode === "official" && list.slug
      ? `official/${list.slug}`
      : String(list.id);

  const selectList = (list) => {
    onChange({ listId: getListPath(list), selectedListName: list.name });
  };

  const listLabel = (list) => {
    const count = list.items != null ? ` (${list.items})` : "";
    const user =
      mdblist.mode === "top" && list.user_name ? ` · ${list.user_name}` : "";
    return `${list.name}${count}${user}`;
  };

  if (needsKey && !mdblistKey)
    return (
      <Notice style={{ marginTop: 8 }}>
        Add your MDBList API key above to browse lists.
      </Notice>
    );

  return (
    <>
      {mdblist.mode === "user" && (
        <Field>
          <FieldLabel>Username</FieldLabel>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
              placeholder="mdblist username"
              style={{ flex: 1 }}
            />
            <button
              onClick={searchUser}
              style={{
                padding: "6px 10px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                color: "#e8e8f0",
                fontSize: 11,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Search
            </button>
          </div>
        </Field>
      )}

      {loading && (
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            marginTop: 6,
          }}
        >
          Loading lists…
        </div>
      )}

      {error && <Notice style={{ marginTop: 8 }}>{error}</Notice>}

      {!loading && !error && lists.length > 0 && (
        <Field>
          <FieldLabel>Select List</FieldLabel>
          <select
            value={mdblist.listId}
            onChange={(e) => {
              const found = lists.find(
                (l) => getListPath(l) === e.target.value,
              );
              if (found) selectList(found);
            }}
          >
            <option value="">— choose a list —</option>
            {lists.map((l) => (
              <option key={l.id} value={getListPath(l)}>
                {listLabel(l)}
              </option>
            ))}
          </select>
        </Field>
      )}

      {mdblist.mode === "official" && (
        <Field>
          <FieldLabel>Content Type</FieldLabel>
          <select
            value={mdblist.mediaType || ""}
            onChange={(e) => onChange({ mediaType: e.target.value })}
          >
            <option value="">Movies & Shows</option>
            <option value="movie">Movies</option>
            <option value="show">Shows</option>
          </select>
        </Field>
      )}

      {!loading && !error && lists.length === 0 && mdblist.mode !== "user" && (
        <div
          style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 6 }}
        >
          No lists found.
        </div>
      )}
    </>
  );
}

export default function ImageSource({ source, onChange, onReset, mdblistKey }) {
  const { tab, filter, trakt, mdblist } = source;
  const { collapsed, toggle } = useCollapsed("nuvio_collapsed_imagesource");

  const genres = filter.type === "movie" ? MOVIE_GENRES : TV_GENRES;
  const allSortOptions =
    filter.type === "movie" ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS;
  const sortOptions = filter.provider
    ? allSortOptions.filter((o) => o.value !== "trending_week")
    : allSortOptions;

  const TIME_SENSITIVE_SORTS = [
    "trending_week",
    "now_playing",
    "upcoming",
    "on_the_air",
    "airing_today",
  ];
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
