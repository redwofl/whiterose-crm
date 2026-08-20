"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  PhoneCall,
  Calendar,
  CheckSquare,
  Video,
  FileText,
  Building2,
  FolderKanban,
  Wallet,
  BarChart3,
  UsersRound,
  Sparkles,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/follow-ups", label: "Follow-ups", icon: PhoneCall },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/meetings", label: "Meetings", icon: Video },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/clients", label: "Clients", icon: Building2 },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/payments", label: "Payments", icon: Wallet },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/team", label: "Team", icon: UsersRound },
  { href: "/ai-assistant", label: "AI Assistant", icon: Sparkles },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex h-screen flex-col border-r-2 border-r-slate-300 bg-white shadow-sm transition-all duration-200 dark:border-r-slate-700 dark:bg-slate-950 dark:shadow-none",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className="flex h-[88px] items-center gap-3 border-b-2 border-b-slate-300 px-4 dark:border-b-slate-700">
        <img src="/logo.png" alt="WhiteRose" className="h-16 w-16 shrink-0 object-contain" />
        {!collapsed && (
          <div className="leading-tight">
            <p className="text-xl font-bold text-slate-900 dark:text-white">WhiteRose</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Business OS</p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-rose-700 text-white"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon icon={item.icon} className="h-4.5 w-4.5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 border-t-2 border-t-slate-300 px-4 py-3 text-xs text-slate-500 hover:bg-slate-50 dark:border-t-slate-700 dark:text-slate-400 dark:hover:bg-slate-900"
      >
        {collapsed ? <Icon icon={ChevronsRight} className="h-4 w-4" /> : <Icon icon={ChevronsLeft} className="h-4 w-4" />}
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}
