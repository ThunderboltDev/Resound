"use client";

import { Button } from "@workspace/ui/components/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useHotkeys } from "react-hotkeys-hook";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  useHotkeys("l", toggleTheme);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="absolute bottom-5 right-5"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
