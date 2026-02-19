export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("isAdmin") === "true";
}
