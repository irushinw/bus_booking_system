"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, LogOut, Settings, User2, LayoutGrid, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebase/auth";
import type { UserRole } from "@/types/firestore";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationDrawer } from "@/components/drawers/NotificationDrawer";

const linkClass = "px-3 py-2 text-sm font-medium transition hover:text-primary";

function roleLabel(role: UserRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, role, loading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const baseLinks = useMemo(
    () => [
      { href: "/", label: "Home" },
      { href: "/routes", label: "Routes" },
      { href: "/track", label: "Track" },
      { href: "/about", label: "About" },
      { href: "/help", label: "Help" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  const navLinks = useMemo(() => {
    // Reordered for standard UX
    if (user) {
      const baseNavLinks = [
        baseLinks[0], // Home
        baseLinks[1], // Routes
        baseLinks[2], // Track
        { href: "/dashboard", label: "Dashboard" },
      ];

      // Add Tours link for admin and driver roles
      if (role === "admin" || role === "driver") {
        baseNavLinks.push({ href: "/tours", label: "Tours" });
      }

      baseNavLinks.push(
        baseLinks[3], // About
        baseLinks[4], // Help
        baseLinks[5], // Contact
      );

      return baseNavLinks;
    }
    return [
      baseLinks[0],
      baseLinks[1],
      baseLinks[2],
      baseLinks[3],
      baseLinks[4],
      baseLinks[5],
      { href: "/auth/login", label: "Log in" },
      { href: "/auth/register", label: "Sign up" },
    ];
  }, [baseLinks, user, role]);

  const displayName = profile?.displayName ?? user?.email ?? "User";

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-primary">
          LankaBus
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`${linkClass} ${isActive ? "text-primary" : "text-muted-foreground"}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user && role ? (
            <>
              <NotificationDrawer />
              <Popover>
                <PopoverTrigger className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-3 py-2 text-sm text-slate-200 transition hover:bg-white/5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                    <Shield className="h-3 w-3" /> {roleLabel(role)}
                  </span>
                  <span className="truncate max-w-[160px] font-medium">{displayName}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-1">
                  <div className="flex flex-col">
                    <Link href="/dashboard" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted">
                      <LayoutGrid className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link href="/account#profile" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted">
                      <User2 className="h-4 w-4" /> Edit profile
                    </Link>
                    <Link href="/account#settings" className="flex items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-muted">
                      <Settings className="h-4 w-4" /> Account settings
                    </Link>
                    <button onClick={handleLogout} className="flex items-center gap-2 rounded-sm px-3 py-2 text-left text-sm hover:bg-muted">
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
        >
          {isOpen ? "Close" : "Menu"}
        </button>
      </div>
      {isOpen ? (
        <nav
          id="mobile-nav"
          className="border-t border-border/60 bg-background px-4 pb-4 pt-2 md:hidden"
        >
          <div className="flex flex-col gap-2">
            {user && role ? (
              <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {roleLabel(role)}
                    </span>
                    <span className="text-sm text-foreground/80">{displayName}</span>
                  </div>
                </div>
                <div className="grid gap-1">
                  <Link href="/dashboard" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                    <LayoutGrid className="h-4 w-4" /> Dashboard
                  </Link>
                  <Link href="/account#profile" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                    <User2 className="h-4 w-4" /> Edit profile
                  </Link>
                  <Link href="/account#settings" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted" onClick={() => setIsOpen(false)}>
                    <Settings className="h-4 w-4" /> Account settings
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      void handleLogout();
                    }}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    <LogOut className="h-3 w-3" /> Sign out
                  </button>
                </div>
              </div>
            ) : null}
            {navLinks.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${linkClass} ${isActive ? "text-primary" : "text-muted-foreground"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
