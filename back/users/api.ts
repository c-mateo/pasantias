import { api, APIError, Query } from "encore.dev/api";
import { UserDTO, UserService } from "./users";
import { db } from "./database";
import { sessionTokens } from "./schema";
import { AuthData, getAuthData } from "~encore/auth";

// Welcome to Encore!
// This is a simple "Hello World" project to get you started.
//
// To run it, execute "encore run" in your favorite shell.

// ==================================================================

// This is a simple REST API that responds with a personalized greeting.
// To call it, run in your terminal:
//
//	curl http://localhost:4000/hello/World
//

/**
 * Registers a new user.
 *
 * @remarks
 * This endpoint is exposed as a POST method at the path `/register`.
 * It accepts user registration parameters and returns a response with the registered user data.
 *
 * @param params - The user registration parameters.
 * @returns A promise that resolves to a UserRegistrationResponse object containing the result and user data.
 *
 * @throws APIError - If there is an error creating the user.
 *
 * @example
 * ```typescript
 * const response = await register({
 *   firstName: "John",
 *   lastName: "Doe",
 *   email: "john.doe@example.com",
 *   phone: "1234567890",
 *   password: "password123",
 *   address: "123 Main St",
 *   dni: 12345678
 * });
 * ```
 */
export const register = api(
   { expose: true, method: "POST", path: "/register" },
   async (
      params: UserRegistrationParams,
   ): Promise<UserRegistrationResponse> => {
      try {
         const user = await UserService.register(params);
         return {
            result: "ok",
            data: user,
         };
      } catch (error) {
         throw APIError.aborted(error?.detail || "Error creating the user");
      }
   },
);

/**
 * API endpoint for user login.
 *
 * @returns {Promise<UserLoginResponse>} - Response containing the login token.
 * @throws {APIError} - Throws an error if the login process fails.
 */
export const login = api(
   { expose: true, method: "POST", path: "/login" },
   async (params: UserLoginParams): Promise<UserLoginResponse> => {
      try {
         const tokens = await UserService.login(params.email, params.password);
         return {
            result: "ok",
            data: tokens,
         };
      } catch (error) {
         throw APIError.aborted(error?.detail || "Error creating the user");
      }
   },
);

export const logout = api(
   { expose: true, method: "POST", path: "/logout", auth: true },
   async (params: UserLogoutParams) => {
      await UserService.logout(params.sessionToken, params.refreshToken);
      return { result: "ok" };
   },
);

export const refresh = api(
   { expose: true, method: "POST", path: "/refresh", auth: true },
   async (params: UserLogoutParams) => {
      const tokens = await UserService.refresh(
         params.sessionToken,
         params.refreshToken,
      );
      return {
         result: "ok",
         data: tokens,
      };
   },
);

export const verify = api(
   { expose: true, method: "GET", path: "/verify" },
   async (params: VerifyUserParams) => {
      await UserService.verifyUser(params.token);
      return {
         result: "ok"
      };
   }
)



// export const tokens = api(
//    { expose: true, method: "GET", path: "/tokens" },
//    async () => {
//       return await db.select().from(sessionTokens);
//    },
// );

// export const _private = api(
//    { expose: true, method: "GET", path: "/private", auth: true },
//    async (): Promise<{ message: string }> => {
//       const data = getAuthData() as UserDTO & { userID: string };
//       return {
//          message: `Hola ${data.firstName} ${data.lastName}`,
//       };
//    },
// );

interface DataWithMessage<T> {
   result: string;
   error?: string;
   data?: T;
}

export interface UserRegistrationParams {
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   password: string;
   address?: string;
   dni?: number;
}

export type UserRegistrationResponse = DataWithMessage<{
   id: number;
   firstName: string;
   lastName: string;
   email: string;
   phone: string;
   address: string | null;
   dni: number | null;
   verified: boolean;
}>;

export interface UserLoginParams {
   email: string;
   password: string;
}

export interface UserLogoutParams {
   sessionToken: string;
   refreshToken: string;
}

export type UserLoginResponse = DataWithMessage<UserLogoutParams>;

export interface VerifyUserParams {
   token: Query<string>;
}

// ==================================================================

// Encore comes with a built-in development dashboard for
// exploring your API, viewing documentation, debugging with
// distributed tracing, and more. Visit your API URL in the browser:
//
//     http://localhost:9400
//

// ==================================================================

// Next steps
//
// 1. Deploy your application to the cloud
//
//     git add -A .
//     git commit -m 'Commit message'
//     git push encore
//
// 2. To continue exploring Encore, check out these topics in docs:
//
//    Building a REST API:   https://encore.dev/docs/ts/tutorials/rest-api
//    Creating Services:      https://encore.dev/docs/ts/primitives/services
//    Creating APIs:         https://encore.dev/docs/ts/primitives/defining-apis
//    Using SQL Databases:        https://encore.dev/docs/ts/primitives/databases
//    Using Pub/Sub:         https://encore.dev/docs/ts/primitives/pubsub
//    Authenticating users:  https://encore.dev/docs/ts/develop/auth
//    Using Cron Jobs: https://encore.dev/docs/ts/primitives/cron-jobs
//    Using Secrets: https://encore.dev/docs/ts/primitives/secrets
