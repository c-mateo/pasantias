import wretch from "wretch";
import AbortAddon from "wretch/addons/abort";
import { logout, useAuthState } from "~/util/AuthContext";

export const api = wretch("http://localhost:5173/api/v1")
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
