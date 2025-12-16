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
})
// .catcher(403, (err, req) => {
//   // Handle forbidden globally
//   console.log("Forbidden - you don't have access to this resource");
//   // You can add redirection logic here if needed
// }).catcher(500, (err, req) => {
//   // Handle server errors globally
//   console.log("Server error - please try again later");
//   // You can add redirection logic here if needed
// }).catcher(404, (err, req) => {
//   // Handle not found globally
//   console.log("Resource not found");
//   // You can add redirection logic here if needed
// });
