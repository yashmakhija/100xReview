import React from "react";
import { useThemeHook } from "../hooks/useThemeHook";
import { Moon, Sun } from "lucide-react";
import { cn } from "../lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useThemeHook();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    console.log("Toggling theme from", theme, "to", newTheme);

    // Apply the theme immediately for instant feedback
    if (newTheme === "dark") {
      document.body.style.backgroundColor = "#111111";
      document.body.style.color = "#f5f5f5";
      document.documentElement.style.backgroundColor = "#111111";
      document.documentElement.style.color = "#f5f5f5";
    } else {
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111111";
      document.documentElement.style.backgroundColor = "#ffffff";
      document.documentElement.style.color = "#111111";
    }

    // Then update the theme state
    setTheme(newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-lg bg-primary/10 text-foreground hover:bg-accent transition-colors flex items-center justify-center",
        className
      )}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5" />
      ) : (
        <Sun className="w-5 h-5" />
      )}
    </button>
  );
}
