import wretch from "wretch";
import AbortAddon from "wretch/addons/abort";

const getFrontOrigin = () => {
  if (typeof window !== "undefined" && window.location) return window.location.origin;
  return "http://localhost:5173";
};

// Use explicit API_URL if provided, otherwise use the front origin + /api
const API_BASE = (import.meta.env.API_URL as string) || `${getFrontOrigin()}/api/v1`;
console.log("API Base URL:", API_BASE);

export const api = wretch(API_BASE)
  .options({
    mode: "cors",
    credentials: "include",
  })
  .addon(AbortAddon())