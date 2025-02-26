import { Gateway, Header, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { getUserById, UserDTO } from "./users";
import { verifyToken } from "./tokens";


interface AuthParams {
  authorization: Header<"Authorization">;
}

interface AuthData extends UserDTO {
  userID: string;
}

// The function passed to authHandler will be called for all incoming API call that requires authentication.
// Remove if your app does not require authentication.
export const myAuthHandler = authHandler(
  async (params: AuthParams): Promise<AuthData> => {
    const token = params.authorization.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("no token provided");
    }

    try {
      // Verify the JWT
      const decoded = verifyToken(token);
      const user = await getUserById(decoded.userID)
      return {
        ...user,
        userID: user.id.toString()
      }

    } catch (e) {
      throw APIError.unauthenticated("invalid token");
    }
  },
);

export const mygw = new Gateway({ authHandler: myAuthHandler });
