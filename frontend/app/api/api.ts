import wretch from "wretch";
import AbortAddon from "wretch/addons/abort";
import { logout, useAuthState } from "~/util/AuthContext";

const getFrontOrigin = () => {
  if (typeof window !== "undefined" && window.location) return window.location.origin;
  return "http://localhost:5173";
};

// Use explicit API_URL if provided, otherwise use the front origin + /api
const API_BASE = (import.meta.env.API_URL as string) || `${getFrontOrigin()}/api/v1`;

export const api = wretch(API_BASE)
  .options({
    mode: "cors",
    credentials: "include",
  })
  .addon(AbortAddon())
  .catcher(401, (err, req) => {
    // Handle unauthorized globally
    console.log("Unauthorized - redirecting to login");
    // You can add redirection logic here if needed
    logout(true);
  });
// Additional global catchers (403/500/404) can be added here when needed.
