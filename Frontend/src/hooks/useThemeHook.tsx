import { createContext, useContext, useState, useEffect } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: "dark",
  setTheme: () => null,
});

export function useThemeHook() {
  return useContext(ThemeContext);
}
