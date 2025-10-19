"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/routes", label: "Routes" },
  { href: "/dashboard/passenger", label: "Passenger" },
  { href: "/dashboard/driver", label: "Driver" },
  { href: "/dashboard/owner", label: "Owner" },
  { href: "/dashboard/admin", label: "Admin" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/contact", label: "Contact" },
  { href: "/auth/login", label: "Login" },
  { href: "/auth/register", label: "Register" },
];

const linkClass = "px-3 py-2 text-sm font-medium transition hover:text-primary";

export function MainNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-primary">
          LankaBus
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => {
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
            {links.map(({ href, label }) => {
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
