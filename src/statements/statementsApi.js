// Client for the statement-import backend (same server as Lean, JWT-authed).
// The PDF is uploaded to /api/statements/analyze, where the backend extracts the
// text, asks Claude to structure + categorize the transactions, stores them in
// Supabase (per user), and returns them. Nothing is parsed on-device.
import { Platform } from "react-native";
import { LEAN_BACKEND_URL } from "../bank/config";
import { getAccessToken } from "../lib/supabase";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Wake a sleeping free-tier host before the real (slow) request.
async function wakeUp(onProgress) {
  for (let i = 0; i < 20; i++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    try {
      const r = await fetch(`${LEAN_BACKEND_URL}/health`, { signal: ctrl.signal });
      if (r.ok) return true;
    } catch {
      /* not up yet */
    } finally {
      clearTimeout(timer);
    }
    if (i === 0) onProgress?.("Waking up the server…");
    await sleep(2500);
  }
  return false;
}

async function authHeader() {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// JSON POST helper (list / clear).
async function postJson(path, body) {
  const res = await fetch(`${LEAN_BACKEND_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
    body: JSON.stringify(body || {}),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Server error ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

// Turn an expo-document-picker asset into a multipart body part.
async function fileFromAsset(asset) {
  if (Platform.OS === "web") {
    // Web returns a real File on `asset.file`; fall back to fetching the blob URL.
    if (asset.file) return asset.file;
    const blob = await fetch(asset.uri).then((r) => r.blob());
    return new File([blob], asset.name || "statement.pdf", { type: asset.mimeType || "application/pdf" });
  }
  // Native: RN FormData accepts a { uri, name, type } descriptor.
  return { uri: asset.uri, name: asset.name || "statement.pdf", type: asset.mimeType || "application/pdf" };
}

// Upload a picked PDF and get back the extracted, categorized, stored transactions.
export async function uploadStatement(asset, onProgress) {
  onProgress?.("Preparing upload…");
  await wakeUp(onProgress);

  const form = new FormData();
  form.append("file", await fileFromAsset(asset));

  onProgress?.("Analyzing your statement…");
  const res = await fetch(`${LEAN_BACKEND_URL}/api/statements/analyze`, {
    method: "POST",
    headers: { ...(await authHeader()) }, // no Content-Type — fetch sets the multipart boundary
    body: form,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Analysis failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json(); // { count, transactions, summary? }
}

// All of the signed-in user's imported transactions. Retries once after waking
// a cold server so a sleeping host doesn't look like "no data" on login.
export async function listImported() {
  try {
    const { transactions } = await postJson("/api/statements/list", {});
    return transactions || [];
  } catch {
    await wakeUp();
    const { transactions } = await postJson("/api/statements/list", {});
    return transactions || [];
  }
}

// Remove all imported transactions for the signed-in user.
export async function clearImported() {
  return postJson("/api/statements/clear", {});
}
