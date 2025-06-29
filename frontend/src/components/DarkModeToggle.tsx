"use client";
import { useEffect, useState } from "react";

export default function DarkModeToggle() {
  const [dark, setDark] = useState(false);

  // Only use localStorage, never system theme
  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") setDark(true);
    else setDark(false); // Always default to light if not set
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  }, [dark]);

  return (
    <button
      className="fixed top-4 right-4 z-50 bg-blue-600 text-white px-3 py-1 rounded shadow hover:bg-blue-700 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle dark mode"
    >
      {dark ? "☀️ Light Mode" : "🌙 Dark Mode"}
    </button>
  );
}
