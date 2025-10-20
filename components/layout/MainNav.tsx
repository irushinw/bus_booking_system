"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebase/auth";
import type { UserRole } from "@/types/firestore";

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
      { href: "/about", label: "About" },
      { href: "/help", label: "Help" },
      { href: "/contact", label: "Contact" },
    ],
    []
  );

  const roleLink = useMemo(() => {
    if (!role) return null;
    const map: Record<UserRole, { href: string; label: string }> = {
      passenger: { href: "/dashboard/passenger", label: roleLabel("passenger") },
      driver: { href: "/dashboard/driver", label: roleLabel("driver") },
      owner: { href: "/dashboard/owner", label: roleLabel("owner") },
      admin: { href: "/dashboard/admin", label: roleLabel("admin") },
    };
    return map[role];
  }, [role]);

  const navLinks = useMemo(() => {
    if (user && roleLink) {
      return [...baseLinks, roleLink];
    }
    return [
      ...baseLinks,
      { href: "/auth/login", label: "Login" },
      { href: "/auth/register", label: "Register" },
    ];
  }, [baseLinks, roleLink, user]);

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
              <span className="rounded-full border border-border px-3 py-1 text-xs uppercase text-muted-foreground">
                {roleLabel(role)}
              </span>
              <span className="text-sm text-foreground/80">{displayName}</span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
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
              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {roleLabel(role)}
                  </span>
                  <span className="text-sm text-foreground/80">{displayName}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    void handleLogout();
                  }}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-muted"
                >
                  <LogOut className="h-3 w-3" /> Sign out
                </button>
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
