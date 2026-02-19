"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/giver", label: "Giver Mode" },
  { href: "/receiver", label: "Receiver Mode" },
  { href: "/login", label: "Login" }
];

type ThemeMode = "morning" | "dark";
const THEME_STORAGE_KEY = "fairfortune-theme";

export function SiteHeader() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<ThemeMode>("morning");

  function applyTheme(next: ThemeMode) {
    document.documentElement.setAttribute("data-theme", next);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "morning" || saved === "dark") {
      setTheme(saved);
      applyTheme(saved);
      return;
    }

    const hour = new Date().getHours();
    const auto: ThemeMode = hour >= 18 || hour < 6 ? "dark" : "morning";
    setTheme(auto);
    applyTheme(auto);
  }, []);

  function changeTheme(next: ThemeMode) {
    setTheme(next);
    applyTheme(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }

  return (
    <header className="site-header sticky top-0 z-50 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 md:px-8">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="FairFortune home">
          <Image
            src="/assets/logo-fairfortune-cny.png"
            alt="FairFortune logo"
            width={220}
            height={52}
            priority
            className="h-auto w-[190px] md:w-[220px]"
          />
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <nav className="site-nav flex items-center gap-1 rounded-full p-1 text-sm md:gap-2">
            {tabs.map((tab) => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "site-nav-link rounded-full px-3 py-2 font-medium",
                    active && "site-nav-link-active"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="theme-toggle inline-flex items-center rounded-full p-1">
            <button
              type="button"
              onClick={() => changeTheme("morning")}
              className={cn("theme-toggle-btn", theme === "morning" && "theme-toggle-btn-active")}
              aria-pressed={theme === "morning"}
            >
              Morning
            </button>
            <button
              type="button"
              onClick={() => changeTheme("dark")}
              className={cn("theme-toggle-btn", theme === "dark" && "theme-toggle-btn-active")}
              aria-pressed={theme === "dark"}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
