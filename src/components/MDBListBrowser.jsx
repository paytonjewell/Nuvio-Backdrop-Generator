import React, { useState, useEffect } from "react";
import { Field, FieldLabel, Notice } from "./ui/index.js";
import { fetchMDBLists } from "../lib/tmdb";
import s from "./MDBListBrowser.module.css";

export const MDBLIST_MODES = [
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

export default function MDBListBrowser({ mdblist, mdblistKey, onChange }) {
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

  const selectList = (list) =>
    onChange({ listId: getListPath(list), selectedListName: list.name });

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
              placeholder="mdblist username"
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchUser()}
              style={{ flex: 1 }}
            />
            <button onClick={searchUser} className={s.searchBtn}>Search</button>
          </div>
        </Field>
      )}

      {loading && <div className={s.loading}>Loading lists…</div>}

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
        <div className={s.empty}>No lists found.</div>
      )}
    </>
  );
}
