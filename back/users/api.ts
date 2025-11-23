import { api, APIError, ErrCode, Query } from "encore.dev/api";
import { UserDTO, UserService } from "./users";
import { db } from "./database";
import { sessionTokens } from "./schema";
import { AuthData, getAuthData } from "~encore/auth";
import { Errors } from "./errors";
// import { ProblemDetails } from "./errors";

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

const registerHATEOAS = [
   { "rel": "login", "href": "/api/v1/auth/login", "method": "POST" }
];

export const test = api(
   { expose: true, method: "GET", path: "/test" },
   async () => {
      // const users = await db.select().from(sessionTokens);
      // return packResponse(users);
      throw Errors.invalidCredentials("test");
   },
);

// export const register = api(
//    { expose: true, method: "POST", path: "/auth/register" },
//    async (
//       params: UserRegistrationParams,
//    ): Promise<UserRegistrationResponse> => {
//       try {
//          const user = await UserService.register(params);
//          return packResponse(user, registerHATEOAS)
//       } catch (error) {
//          throw APIError.aborted(error?.detail || "Error creating the user");
//       }
//    },
// );

// /**
//  * API endpoint for user login.
//  *
//  * @returns {Promise<UserLoginResponse>} - Response containing the login token.
//  * @throws {APIError} - Throws an error if the login process fails.
//  */
// export const login = api(
//    { expose: true, method: "POST", path: "/login" },
//    async (params: UserLoginParams): Promise<UserLoginResponse> => {
//       try {
//          const tokens = await UserService.login(params.email, params.password);
//          return {
//             result: "ok",
//             data: tokens,
//          };
//       } catch (error) {
//          throw APIError.aborted(error?.detail || "Error creating the user");
//       }
//    },
// );

// export const logout = api(
//    { expose: true, method: "POST", path: "/logout", auth: true },
//    async (params: UserLogoutParams) => {
//       await UserService.logout(params.sessionToken, params.refreshToken);
//       return { result: "ok" };
//    },
// );

// export const refresh = api(
//    { expose: true, method: "POST", path: "/refresh", auth: true },
//    async (params: UserLogoutParams) => {
//       const tokens = await UserService.refresh(
//          params.sessionToken,
//          params.refreshToken,
//       );
//       return {
//          result: "ok",
//          data: tokens,
//       };
//    },
// );

// export const verify = api(
//    { expose: true, method: "GET", path: "/verify" },
//    async (params: VerifyUserParams) => {
//       await UserService.verifyUser(params.token);
//       return {
//          result: "ok"
//       };
//    }
// )


interface StandardResponseWithoutHATEOAS<T> {
   data: T;
}

interface StandardResponseWithHATEOAS<T> {
   data: T;
   links: HATEOAS[];
}

type StandardResponse<T> = StandardResponseWithoutHATEOAS<T> | StandardResponseWithHATEOAS<T>;

export interface UserRegistrationParams {
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   phone: string;
   address?: string;
   dni?: number;
}

interface HATEOASLink {
   rel: string;
   href: string;
   method: string;
}

interface HATEOAS {
   links: HATEOASLink[];
}

interface SuccessfulUserRegistrationData extends HATEOAS {
   data: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      address?: string;
      dni?: number;
      isVerified: boolean;
   };
}

export type UserRegistrationResponse = ProblemDetails | SuccessfulUserRegistrationData;
export interface UserLoginParams {
   email: string;
   password: string;
}

export interface UserLogoutParams {
   sessionToken: string;
   refreshToken: string;
}

export type UserLoginResponse = StandardResponse<UserLogoutParams>;

export interface VerifyUserParams {
   token: Query<string>;
}

function packResponse<T>(data: T): StandardResponseWithoutHATEOAS<T>;
function packResponse<T>(data: T, hateoas?: HATEOAS[]): StandardResponse<T>;

function packResponse<T>(data: T, hateoas?: HATEOAS[]): StandardResponse<T> {
   if (!hateoas)
      return {
         data: data,
      };

   return {
      data: data,
      links: hateoas
   };
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
