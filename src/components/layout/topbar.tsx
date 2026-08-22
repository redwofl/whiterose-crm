"use client";

import * as React from "react";
import { Search, Bell, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "@/components/layout/theme-provider";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export function Topbar({
  userName,
  onOpenMobileNav,
}: {
  userName: string;
  onOpenMobileNav?: () => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 flex h-[88px] items-center gap-3 border-b-2 border-b-slate-400 bg-white/80 px-4 backdrop-blur dark:border-b-slate-500 dark:bg-slate-950/80">
      <button
        className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        onClick={onOpenMobileNav}
        aria-label="Open menu"
      >
        <Icon icon={Menu} className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-xl flex-1 md:block">
        <Icon icon={Search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search leads, clients, phone numbers... (Ctrl+K)"
          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {!mounted ? (
            <div className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Icon icon={Sun} className="h-4 w-4" />
          ) : (
            <Icon icon={Moon} className="h-4 w-4" />
          )}
        </Button>
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Icon icon={Bell} className="h-4 w-4" />
        </Button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-700 text-sm font-semibold text-white">
          {userName
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
      </div>
    </header>
  );
}
