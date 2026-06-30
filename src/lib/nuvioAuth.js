const BASE_URL = "https://dpyhjjcoabcglfmgecug.supabase.co/auth/v1";
const APIKEY = "sb_publishable_zcNkgqGJjBtj8GoRlMvl9A_zkdmXhf5";
const STORAGE_KEY = "nuvio_session";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function saveSession(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function signIn(email, password) {
  const res = await fetch(`${BASE_URL}/token?grant_type=password`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: APIKEY },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.message || "Sign-in failed");
  }
  saveSession(data);
  return data;
}

export async function signOut(accessToken) {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, apikey: APIKEY },
    });
  } finally {
    clearSession();
  }
}

export async function refreshSession(refreshToken) {
  const res = await fetch(`${BASE_URL}/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: APIKEY },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    clearSession();
    throw new Error(data.error_description || data.message || "Refresh failed");
  }
  saveSession(data);
  return data;
}
