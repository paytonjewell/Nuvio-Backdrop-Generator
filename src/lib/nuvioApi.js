import { getSession, refreshSession, clearSession } from "./nuvioAuth";

const BASE_URL = "https://dpyhjjcoabcglfmgecug.supabase.co/rest/v1";
const APIKEY = "sb_publishable_zcNkgqGJjBtj8GoRlMvl9A_zkdmXhf5";

function authHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
    apikey: APIKEY,
  };
}

function sessionExpiredError() {
  const err = new Error("Your session has expired. Please sign in again.");
  err.code = "SESSION_EXPIRED";
  return err;
}

// Fetch with automatic token refresh on 401
async function authedFetch(accessToken, url, init = {}) {
  const make = (token) =>
    fetch(url, { ...init, headers: authHeaders(token) });

  let res = await make(accessToken);
  if (res.status !== 401) return res;

  const session = getSession();
  if (!session?.refresh_token) {
    clearSession();
    throw sessionExpiredError();
  }
  try {
    const newSession = await refreshSession(session.refresh_token);
    res = await make(newSession.access_token);
    if (res.status === 401) {
      clearSession();
      throw sessionExpiredError();
    }
    return res;
  } catch (e) {
    if (e.code === "SESSION_EXPIRED") throw e;
    clearSession();
    throw sessionExpiredError();
  }
}

async function rpc(accessToken, fnName, body = null) {
  const res = await authedFetch(accessToken, `${BASE_URL}/rpc/${fnName}`, {
    method: "POST",
    ...(body !== null && { body: JSON.stringify(body) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `${fnName} failed (${res.status})`);
  }
  return res.json();
}

export const fetchProfiles = (accessToken) =>
  rpc(accessToken, "sync_pull_profiles");

export const fetchCollections = (accessToken, profileIndex) =>
  rpc(accessToken, "sync_pull_collections", { p_profile_id: profileIndex });

export async function pushCollections(accessToken, profileIndex, collectionsJson) {
  const res = await authedFetch(
    accessToken,
    `${BASE_URL}/rpc/sync_push_collections`,
    {
      method: "POST",
      body: JSON.stringify({
        p_profile_id: profileIndex,
        p_collections_json: collectionsJson,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `sync_push_collections failed (${res.status})`);
  }
}
