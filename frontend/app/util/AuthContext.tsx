import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { api } from "~/api/api";
import type { LoginResponse, ProfileResponse } from "~/api/types";
import { create } from "zustand";

export interface UserData {
  firstName: string;
  lastName: string;
  role: string;
}
// export type UserData = ProfileResponse["data"]

function createValue(userData: UserData | null) {
  return {
    userData,
    login,
    logout,
  };
}

type AuthContextType = ReturnType<typeof createValue>;

const AuthContext = createContext<AuthState | null>(null);

export let loaderAccess: UserData | null = null;

// type Callback<T> = (newValue: T) => void;

// class GlobalState<T> {
//   listeners = new Set<Callback<T>>();

//   constructor(private value: T) {}

//   update(newValue: T) {
//     console.log("Updating", newValue);
//     this.value = newValue;
//     this.listeners.forEach((fn) => fn(newValue));
//   }

//   get() {
//     return this.value;
//   }

//   addListener(c: Callback<T>) {
//     console.log("Listening");
//     const a = (value) => {
//       console.log("Callback", this.value);
//       c(value);
//     };
//     this.listeners.add(a);
//     return () => {
//       this.listeners.delete(a);
//     };
//   }
// }

// function useGlobal<T>(init: T){
//   const c = new GlobalState(init)
//   return init.
// }

interface AuthState {
  checked: boolean;
  user: UserData | null;
  setChecked: (newValue: boolean) => void;
  setUser: (newValue: UserData | null) => void;
}

export const useAuthState = create<AuthState>((set) => ({
  checked: false,
  user: null,
  setChecked: (checked: boolean) => set((state) => ({ checked })),
  setUser: (user: UserData | null) => set((state) => ({ user })),
  // checkSession: async () => {
  //   if (checkPromise) return;
  //   try {
  //     checkPromise = api.get("/profile").json<ProfileResponse>();
  //     const res = await checkPromise;
  //     const auth = useAuthState.getState();
  //     auth.setUser(res.data);
  //     console.log("Check session", res.data);
  //   } catch {
  //   } finally {
  //     checkPromise = null;
  //   }
  // },
  // checkSessionOnce: async () => {
  //   const auth = useAuthState.getState();
  //   if (!auth.checked) {
  //     await checkSession();
  //     auth.setChecked(true);
  //   }
  // },
  // login: async (email: string, password: string) => {
  //   const res = await api
  //     .post({ email, password }, "/auth/login")
  //     .json<LoginResponse>();

  //   // TODO: Fix
  //   const auth = useAuthState.getState();
  //   auth.setUser(res.data.user as UserData);
  // },
  // logout: async () => {
  //   const res = await api.post({}, "/auth/logout").json();
  //   console.log("Logout", res);
  //   const auth = useAuthState.getState();
  //   auth.setUser(null);
  // },
}));

let checkPromise: Promise<ProfileResponse> | null = null;

export async function checkSession() {
  // if (checkPromise) return;
  try {
    const checkPromise = api.get("/profile").json<ProfileResponse>();
    const res = await checkPromise;
    const auth = useAuthState.getState();
    auth.setUser(res?.data ?? null);
  } catch {
  } finally {
    checkPromise = null;
  }
}

export async function checkSessionOnce() {
  const auth = useAuthState.getState();
  if (!auth.checked) {
    await checkSession();
    auth.setChecked(true);
  }
}

export async function login(email: string, password: string) {
  const res = await api
    .post({ email, password }, "/auth/login")
    .json<LoginResponse>();

  // TODO: Fix
  const auth = useAuthState.getState();
  auth.setUser(res?.data?.user as UserData ?? null);
}

export async function logout(skip: boolean = false) {
  if (!skip) {
    console.log("Logging out");
    const res = await api.post({}, "/auth/logout").json();
  }
  const auth = useAuthState.getState();
  auth.setUser(null);
}

export function isLogged() {
  const auth = useAuthState.getState();
  return !!auth.user;
}

export function getUserRole() {
  const auth = useAuthState.getState();
  return auth.user?.role;
}

export async function requireUser() {
  await checkSessionOnce();
  const auth = useAuthState.getState();
  return auth.user;
}

// export function useSession() {
//   const [_checked, setChecked] = useState(false);
//   const [userData, setUserData] = useState<UserData | null>(null);

//   useEffect(() => {
//     return auth.addListener(setUserData);
//   }, []);

//   useEffect(() => {
//     return checked.addListener(setChecked);
//   }, []);

//   useEffect(() => {
//     // Check session
//     checkSessionOnce();
//   }, []);

//   return { checked: _checked, userData };
// }

export const AuthProvider = ({
  // checked,
  // userData,
  children,
}: {
  checked?: boolean;
  userData?: UserData | null;
  children: React.ReactNode;
}) => {
  // console.log("Context", userData);
  // const value = useMemo(() => createValue(userData ?? null), [userData]);
  const session = useAuthState();

  useEffect(() => {
    // Check session
    (async () => {
      try {
        const res = await api.get("/profile").json<ProfileResponse>();
        const auth = useAuthState();
        auth.setUser(res?.data ?? null);
      } catch {
      } finally {
        checkPromise = null;
      }
    })();
  }, []);
  return (
    <AuthContext.Provider value={session}>
      {session.checked && children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
