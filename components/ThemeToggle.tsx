"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle("dark");
    setDark(html.classList.contains("dark"));
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        relative w-10 h-10
        rounded-2xl
        flex items-center justify-center
        bg-gray-100 dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        shadow-sm
        hover:shadow-md
        transition-all duration-300
      "
    >
      <div className="relative w-5 h-5">
        <SunIcon
          className={`absolute w-5 h-5 transition-all duration-300 ${
            dark ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
          }`}
        />
        <MoonIcon
          className={`absolute w-5 h-5 transition-all duration-300 ${
            dark ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
          }`}
        />
      </div>
    </button>
  );
}