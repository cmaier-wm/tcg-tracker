export const AUTH_SESSION_COOKIE_NAME = "tcg-tracker.session";
export const AUTH_SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
export const AUTH_SESSION_MAX_AGE_SECONDS = Math.floor(AUTH_SESSION_MAX_AGE_MS / 1000);
export const AUTH_SIGNED_OUT_REDIRECT = "/login";
export const PASSWORD_RESET_TOKEN_MAX_AGE_MS = 30 * 60 * 1000;
export const PASSWORD_RESET_REQUEST_ROUTE = "/reset-password";

export function getAuthCookieSecure() {
  return process.env.NODE_ENV === "production";
}

export function getAuthSessionExpiryDate(now = Date.now()) {
  return new Date(now + AUTH_SESSION_MAX_AGE_MS);
}

export function getPasswordResetExpiryDate(now = Date.now()) {
  return new Date(now + PASSWORD_RESET_TOKEN_MAX_AGE_MS);
}

export function isSafeReturnToPath(path: string | null | undefined) {
  if (!path) {
    return false;
  }

  return path === "/cards" || /^\/cards\/[^/]+\/[^/]+$/.test(path);
}

export function getPostAuthRedirect(path: string | null | undefined) {
  return isSafeReturnToPath(path) ? path ?? "/portfolio" : "/portfolio";
}
