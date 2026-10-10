/**
 * "Coba dulu" guest mode. Stored as a cookie (not localStorage) so the middleware
 * can decide on the server whether to show the welcome screen.
 */
export const GUEST_COOKIE = "niibooo_guest";

export function enableGuest() {
  document.cookie = `${GUEST_COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function clearGuest() {
  document.cookie = `${GUEST_COOKIE}=; path=/; max-age=0; samesite=lax`;
}
