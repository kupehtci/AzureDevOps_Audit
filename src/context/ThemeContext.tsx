import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextValue {
    isDark: boolean;
    toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    isDark: true,
    toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [isDark, setIsDark] = useState<boolean>(() => {
        return localStorage.getItem("theme") !== "light";
    });

    useEffect(() => {
        document.documentElement.classList.toggle("light", !isDark);
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }, [isDark]);

    return (
        <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    return useContext(ThemeContext);
}
