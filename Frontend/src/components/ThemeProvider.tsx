import React, { useState, useEffect } from "react";
import { ThemeContext } from "../hooks/useThemeHook";

type Theme = "light" | "dark";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Initial theme setup from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  }, []);

  // Apply theme whenever it changes
  useEffect(() => {
    // Skip first render if theme is default "dark"
    if (document.documentElement.classList.contains(theme)) {
      return;
    }

    // Apply theme classes
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    localStorage.setItem("theme", theme);

    // Apply background color directly to body and documentElement
    if (theme === "dark") {
      // Dark theme
      document.body.style.backgroundColor = "#111111";
      document.body.style.color = "#f5f5f5";
      document.documentElement.style.backgroundColor = "#111111";
      document.documentElement.style.color = "#f5f5f5";

      // Also set CSS variables
      document.documentElement.style.setProperty("--background", "0 0% 6%");
      document.documentElement.style.setProperty("--foreground", "0 0% 95%");
      document.documentElement.style.setProperty("--card", "0 0% 3.9%");
      document.documentElement.style.setProperty(
        "--card-foreground",
        "0 0% 98%"
      );
      document.documentElement.style.setProperty("--muted", "0 0% 14.9%");
      document.documentElement.style.setProperty(
        "--muted-foreground",
        "0 0% 63.9%"
      );
      document.documentElement.style.setProperty("--border", "0 0% 14.9%");
      document.documentElement.style.setProperty("--input", "0 0% 14.9%");
    } else {
      // Light theme
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111111";
      document.documentElement.style.backgroundColor = "#ffffff";
      document.documentElement.style.color = "#111111";

      // Also set CSS variables
      document.documentElement.style.setProperty("--background", "0 0% 100%");
      document.documentElement.style.setProperty("--foreground", "0 0% 5%");
      document.documentElement.style.setProperty("--card", "0 0% 100%");
      document.documentElement.style.setProperty(
        "--card-foreground",
        "0 0% 3.9%"
      );
      document.documentElement.style.setProperty("--muted", "0 0% 96.1%");
      document.documentElement.style.setProperty(
        "--muted-foreground",
        "0 0% 45.1%"
      );
      document.documentElement.style.setProperty("--border", "0 0% 89.8%");
      document.documentElement.style.setProperty("--input", "0 0% 89.8%");
    }

    console.log("Theme applied:", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
