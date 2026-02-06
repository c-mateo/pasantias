import React, {
  createContext,
  useContext,
  useEffect,
} from "react";
import { api } from "~/api/api";
import type { LoginResponse, ProfileResponse } from "~/api/types";
import { create } from "zustand";

export interface UserData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

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
}));

export async function checkSession() {
  try {
    const res = await api.get("/profile").json<ProfileResponse>();
    const auth = useAuthState.getState();
    auth.setUser(res?.data ?? null);
  } catch {
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

  // If login failed the API may return 401 or an empty response; ensure we
  // throw so callers (Login page) handle the error and do not redirect.
  if (!res || !res.data || !res.data.user) {
    throw new Error("Invalid credentials");
  }

  const auth = useAuthState.getState();
  auth.setUser(res.data.user as UserData);
  return res;
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
