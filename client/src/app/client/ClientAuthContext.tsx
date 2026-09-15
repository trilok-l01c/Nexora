"use client";

// Single source of truth for whether a client session exists. The portal
// layout, mobile drawer, login page, and account page all read this context,
// so logging out (or an expired session) updates every navigation surface at
// once instead of each component keeping its own conflicting auth state.
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { apiUrl } from "../apiConfig";

type SessionUser = {
    id: string;
    email: string;
    role: string;
    companyId?: string;
};

type AuthStatus = "loading" | "authenticated" | "guest";

type ClientAuthValue = {
    status: AuthStatus;
    user: SessionUser | null;
    refresh: () => Promise<void>;
    logout: () => Promise<void>;
};

const ClientAuthContext = createContext<ClientAuthValue | null>(null);

export function ClientAuthProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [user, setUser] = useState<SessionUser | null>(null);

    // Promise-chained (not async/await) so every setState happens inside a
    // callback — never synchronously when this runs inside an effect.
    const refresh = useCallback((): Promise<void> => {
        return fetch(`${apiUrl}/api/auth/session`, {
            credentials: "include",
        })
            .then(async (response) => {
                const result = await response.json();
                if (response.ok && result?.success && result.data?.authenticated) {
                    setUser(result.data.user ?? null);
                    setStatus("authenticated");
                    return;
                }
                setUser(null);
                setStatus("guest");
            })
            .catch(() => {
                setUser(null);
                setStatus("guest");
            });
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const logout = useCallback(async () => {
        // Clears the HttpOnly session cookie via the existing secure endpoint
        // and immediately flips the shared state so the navigation renders
        // the signed-out layout.
        await fetch(`${apiUrl}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        }).catch(() => undefined);
        setUser(null);
        setStatus("guest");
    }, []);

    return (
        <ClientAuthContext.Provider value={{ status, user, refresh, logout }}>
            {children}
        </ClientAuthContext.Provider>
    );
}

export function useClientAuth() {
    const context = useContext(ClientAuthContext);
    if (!context) {
        throw new Error(
            "useClientAuth must be used within a ClientAuthProvider",
        );
    }
    return context;
}