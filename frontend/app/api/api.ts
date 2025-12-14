import wretch from "wretch";
import { logout, useAuthState } from "~/util/AuthContext";


export const api = wretch("http://localhost:5173/api/v1").options({
  mode: "cors",
  credentials: "include",
}).catcher(401, (err, req) => {
  // Handle unauthorized globally
  console.log("Unauthorized - redirecting to login");
  // You can add redirection logic here if needed
  logout(true);
});
