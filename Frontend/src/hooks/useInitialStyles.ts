import { useEffect } from "react";

/**
 * A hook that applies initial styles before React components render
 * This ensures the correct theme is applied immediately without flashing
 */
export function useInitialStyles() {
  useEffect(() => {
    // Set immediate styles without animation first
    document.body.style.transition = "none";
    document.documentElement.style.transition = "none";

    // Get theme from localStorage or system preference
    const savedTheme =
      localStorage.getItem("theme") ||
      (window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");

    // Apply class to both document element and body
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(savedTheme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(savedTheme);

    // Apply styles directly to both html and body elements
    if (savedTheme === "dark") {
      // Apply to documentElement (html)
      document.documentElement.style.backgroundColor = "#111111";
      document.documentElement.style.color = "#f5f5f5";

      // Apply to body
      document.body.style.backgroundColor = "#111111";
      document.body.style.color = "#f5f5f5";

      // Set CSS variables for Tailwind
      document.documentElement.style.setProperty("--background", "0 0% 6%");
      document.documentElement.style.setProperty("--foreground", "0 0% 95%");
    } else {
      // Apply to documentElement (html)
      document.documentElement.style.backgroundColor = "#ffffff";
      document.documentElement.style.color = "#111111";

      // Apply to body
      document.body.style.backgroundColor = "#ffffff";
      document.body.style.color = "#111111";

      // Set CSS variables for Tailwind
      document.documentElement.style.setProperty("--background", "0 0% 100%");
      document.documentElement.style.setProperty("--foreground", "0 0% 5%");
    }

    // Re-enable transitions after initial render
    setTimeout(() => {
      document.body.style.transition = "";
      document.documentElement.style.transition = "";
    }, 100);

    console.log("Initial styles applied:", savedTheme);
  }, []);
}
