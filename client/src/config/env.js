export const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
export const clerkEnabled = Boolean(clerkPublishableKey);

const defaultApiUrl = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:8000/api"
  : "/api";

export const apiBaseURL = import.meta.env.VITE_API_URL || defaultApiUrl;

console.log("[Config] API Base URL:", apiBaseURL);
console.log("[Config] Environment:", import.meta.env.MODE);
