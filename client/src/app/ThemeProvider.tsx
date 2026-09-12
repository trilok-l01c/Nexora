"use client";

import {
    createContext,
    useContext,
    useEffect,
    useSyncExternalStore,
    type ReactNode,
} from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
    theme: Theme;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "nexora-theme";

// The theme lives outside React (localStorage / OS preference), so it is read
// through useSyncExternalStore. The server snapshot is always "light", which
// matches the inline <head> script in layout.tsx and keeps hydration stable;
// React re-renders with the resolved client value after hydration.
const themeListeners = new Set<() => void>();
let currentTheme: Theme | null = null;

function resolveTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function getThemeSnapshot(): Theme {
    if (currentTheme === null) {
        currentTheme = resolveTheme();
    }
    return currentTheme;
}

function getThemeServerSnapshot(): Theme {
    return "light";
}

function subscribeToTheme(onChange: () => void) {
    themeListeners.add(onChange);
    return () => {
        themeListeners.delete(onChange);
    };
}

function setTheme(next: Theme) {
    currentTheme = next;
    themeListeners.forEach((listener) => listener());
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const theme = useSyncExternalStore(
        subscribeToTheme,
        getThemeSnapshot,
        getThemeServerSnapshot,
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    function toggleTheme() {
        const next: Theme = theme === "light" ? "dark" : "light";
        // Only an explicit user choice is persisted, so the system
        // preference keeps controlling the theme until then.
        window.localStorage.setItem(STORAGE_KEY, next);
        setTheme(next);
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
