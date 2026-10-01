import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { getErrorMessage, getStatus, setUnauthorizedHandler, tokenStorage } from "@/lib/api";
import { authService } from "@/services/authService";
import type { User } from "@/types";

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "offline";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  /** Why the user was signed out (e.g. expired session); shown on the login screen. */
  sessionMessage: string | null;
  offlineMessage: string | null;
  /** True right after the user chose to log out (vs. being signed out by an expired session). */
  loggedOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  retry: () => void;
  clearSessionMessage: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() => (tokenStorage.get() ? "loading" : "unauthenticated"));
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [loggedOut, setLoggedOut] = useState(false);

  const signOutLocally = useCallback((message: string | null) => {
    tokenStorage.clear();
    setUserState(null);
    setStatus("unauthenticated");
    setSessionMessage(message);
  }, []);

  // Restore the session after a page refresh.
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    setStatus("loading");
    authService
      .me()
      .then((me) => {
        if (cancelled) return;
        setUserState(me);
        setStatus("authenticated");
      })
      .catch((error) => {
        if (cancelled) return;
        if (getStatus(error) === 401) {
          signOutLocally("Your session has expired. Please log in again.");
        } else {
          // Keep the token: the server may just be temporarily unreachable.
          setOfflineMessage(getErrorMessage(error));
          setStatus("offline");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [attempt, signOutLocally]);

  useEffect(() => {
    setUnauthorizedHandler((message) => signOutLocally(message));
    return () => setUnauthorizedHandler(null);
  }, [signOutLocally]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authService.login(email, password);
    tokenStorage.set(result.access_token);
    setUserState(result.user);
    setSessionMessage(null);
    setLoggedOut(false);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await authService.register(name, email, password);
    tokenStorage.set(result.access_token);
    setUserState(result.user);
    setSessionMessage(null);
    setLoggedOut(false);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout(); // revokes the token server-side
    } catch {
      /* still sign out locally if the server is unreachable */
    } finally {
      setLoggedOut(true);
      signOutLocally(null);
    }
  }, [signOutLocally]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      sessionMessage,
      offlineMessage,
      loggedOut,
      login,
      register,
      logout,
      setUser: setUserState,
      retry: () => setAttempt((n) => n + 1),
      clearSessionMessage: () => setSessionMessage(null),
    }),
    [user, status, sessionMessage, offlineMessage, loggedOut, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
