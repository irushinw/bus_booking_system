"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Ticket, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { logout } from "@/lib/firebase/auth";
import type { UserRole } from "@/types/firestore";

const NAV_ITEMS: { label: string; href: string; roles: UserRole[] }[] = [
  { label: "Passenger", href: "/dashboard/passenger", roles: ["passenger"] },
  { label: "Driver", href: "/dashboard/driver", roles: ["driver"] },
  { label: "Owner", href: "/dashboard/owner", roles: ["owner"] },
  { label: "Admin", href: "/dashboard/admin", roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const availableNav = NAV_ITEMS.filter((item) => (role ? item.roles.includes(role) : false));

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold text-yellow-300">
            <Ticket className="h-5 w-5" /> iBus Sri Lanka
          </Link>
          <nav className="hidden items-center gap-3 text-sm md:flex">
            {availableNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 transition ${
                  pathname === item.href ? "bg-yellow-400 text-slate-900" : "text-slate-200 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-200">
            <div className="hidden text-right md:block">
              <p className="text-xs text-slate-400">{role?.toUpperCase()}</p>
              <p className="font-semibold">{profile?.displayName ?? user?.email ?? "User"}</p>
            </div>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-200 transition hover:border-yellow-400 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-yellow-400 md:flex"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-slate-900/90 px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-2">
              {availableNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm ${
                    pathname === item.href ? "bg-yellow-400 text-slate-900" : "text-slate-200 hover:bg-white/10"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-2 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-left text-sm text-slate-200"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {!role ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
            <UserCircle2 className="h-12 w-12 text-yellow-300" />
            <p className="text-sm text-slate-300">We&apos;re preparing your profile. Please try again shortly.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}
