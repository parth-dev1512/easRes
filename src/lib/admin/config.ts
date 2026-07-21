// Admins are managed via an env var allowlist rather than a DB table —
// there are only ever a handful of accounts, and keeping the list server-only
// means it can't be read or altered through the app/DB.
function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.trim().toLowerCase());
}
