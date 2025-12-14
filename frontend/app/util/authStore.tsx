export interface UserData {
  name: string;
  role: string;
}
export interface Session {
  authenticated: boolean;
  user: UserData | null;
}

export const authStore = {
  session: {
    authenticated: false,
    user: null,
  } as Session,
  listeners: new Set<Function>(),

  login(session: Session) {
    this.session = session;
    console.log(this.listeners);
    this.listeners.forEach((fn) => fn(session));
  },

  logout() {
    const session = { user: null, authenticated: false };
    this.session = session;
    console.log(this.listeners);
    this.listeners.forEach((fn) => fn(session));
  },

  subscribe(fn: (s: Session) => void) {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  },
};
