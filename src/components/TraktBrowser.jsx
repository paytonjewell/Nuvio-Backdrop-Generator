import React, { useState } from "react";
import { Field, FieldLabel, Notice, SearchableSelect } from "./ui/index.js";
import { fetchTraktLists } from "../lib/tmdb";
import s from "./MDBListBrowser.module.css";

export const TRAKT_MODES = [
  { value: "url", label: "URL" },
  { value: "trending-media", label: "Trending on Trakt" },
  { value: "popular-media", label: "Popular on Trakt" },
  { value: "user", label: "Search by username" },
];

const TYPED_MODES = ["trending-media", "popular-media"];

export default function TraktBrowser({ trakt, traktKey, onChange }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState(trakt.username || "");

  const needsType = TYPED_MODES.includes(trakt.mode);
  const mediaType = trakt.mediaType || "movies";

  const searchUser = () => {
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    onChange({ username: username.trim(), listId: "", selectedListName: "" });
    fetchTraktLists(`users/${username.trim()}/lists`, traktKey)
      .then((data) => { setLists(data); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  };

  const getListId = (list) => String(list.ids.trakt);

  const selectList = (list) =>
    onChange({ listId: getListId(list), selectedListName: list.name });

  const listLabel = (list) => {
    const count = list.item_count != null ? ` (${list.item_count})` : "";
    return `${list.name}${count}`;
  };

  if (!traktKey)
    return (
      <Notice style={{ marginTop: 8 }}>
        Add your Trakt Client ID above to browse lists.
      </Notice>
    );

  return (
    <>
      {needsType && (
        <Field>
          <FieldLabel>Content Type</FieldLabel>
          <SearchableSelect
            value={mediaType}
            onChange={(v) => onChange({ mediaType: v })}
            options={[
              { value: "movies", label: "Movies" },
              { value: "shows", label: "Shows" },
              { value: "both", label: "Movies & Shows" },
            ]}
          />
        </Field>
      )}

      {trakt.mode === "user" && (
        <Field>
          <FieldLabel>Username</FieldLabel>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="text"
              value={username}
              placeholder="trakt username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
              style={{ flex: 1 }}
            />
            <button onClick={searchUser} className={s.searchBtn}>
              Search
            </button>
          </div>
        </Field>
      )}

      {loading && <div className={s.loading}>Loading lists…</div>}

      {error && <Notice style={{ marginTop: 8 }}>{error}</Notice>}

      {!loading && !error && lists.length > 0 && (
        <Field>
          <FieldLabel>Select List</FieldLabel>
          <SearchableSelect
            value={trakt.listId}
            onChange={(v) => {
              const found = lists.find((l) => getListId(l) === v);
              if (found) selectList(found);
            }}
            options={lists.map((l) => ({ value: getListId(l), label: listLabel(l) }))}
            emptyLabel="— choose a list —"
          />
        </Field>
      )}
    </>
  );
}
