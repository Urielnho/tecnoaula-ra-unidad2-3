const KEY = import.meta.env.VITE_LOCAL_STORAGE_ITEM_NAME || "TECNOAULA_RA23";
export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    localStorage.removeItem(KEY);
    return null;
  }
}
export function setTokens(tokens) {
  localStorage.setItem(KEY, JSON.stringify(tokens));
}
export function removeTokens() {
  localStorage.removeItem(KEY);
}
export function tokenExpiresAt(access) {
  try {
    const base = access.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base)).exp * 1000;
  } catch {
    return 0;
  }
}
