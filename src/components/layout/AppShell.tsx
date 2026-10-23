"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  Receipt,
  BarChart3,
  CreditCard,
  Users,
  Settings,
  LogOut,
  Sun,
  Moon,
  Plus,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { BillFormModal } from "@/components/bills/BillFormModal";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [defaultConsumer, setDefaultConsumer] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    fetch("/api/consumers")
      .then((res) => res.json())
      .then((data) => {
        if (data.defaultConsumer) {
          setDefaultConsumer(data.defaultConsumer);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Bills", href: "/bills", icon: Receipt },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
    { name: "Payments", href: "/payments", icon: CreditCard },
    { name: "KSEB Profile", href: "/consumers", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#080d16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row pb-16 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-40 bg-white/90 dark:bg-[#0c1322]/90 border-r border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
        {/* Brand */}
        <div className="h-18 flex items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-600/25 ring-1 ring-white/20">
            <Zap className="h-5 w-5 fill-white text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                WaTrack
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                KSEB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
              Electricity Bill Manager
            </p>
          </div>
        </div>

        {/* Quick New Bill Action */}
        <div className="p-4">
          <Button
            onClick={() => setIsBillModalOpen(true)}
            className="w-full justify-center gap-2 font-semibold shadow-md shadow-emerald-600/20"
          >
            <Plus className="h-4 w-4" />
            Add New Bill
          </Button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-transform group-hover:scale-110",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Active Consumer Widget */}
        {defaultConsumer && (
          <div className="p-3 mx-3 mb-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Consumer
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                {defaultConsumer.tariff}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {defaultConsumer.name}
            </p>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
              C#: {defaultConsumer.consumerNumber}
            </p>
            <a
              href="https://wss.kseb.in"
              target="_blank"
              rel="noreferrer"
              className="mt-2 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50"
            >
              <span>Pay on KSEB Portal</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}

        {/* Bottom User & Theme */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold truncate">{currentUser?.name || "Owner"}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || "Authenticated"}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              onClick={handleLogout}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden h-14 bg-white/90 dark:bg-[#0c1322]/90 border-b border-slate-200/80 dark:border-slate-800/80 px-4 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Zap className="h-4 w-4 fill-white text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              WaTrack
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsBillModalOpen(true)}
              size="sm"
              className="h-8 px-2.5 text-xs gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Bill
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            >
              {resolvedTheme === "dark" ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-rose-500"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-[#0c1322]/95 border-t border-slate-200 dark:border-slate-800 z-40 backdrop-blur-md flex items-center justify-around py-2 px-1">
        {navItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors",
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <Icon className={cn("h-4 w-4 mb-0.5", isActive ? "stroke-[2.5]" : "stroke-2")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Add Bill Modal */}
      {isBillModalOpen && (
        <BillFormModal
          open={isBillModalOpen}
          onOpenChange={setIsBillModalOpen}
          onSuccess={() => {
            setIsBillModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
