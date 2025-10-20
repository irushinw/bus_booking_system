"use client";

import { usePathname } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/firestore";

const NAV_ITEMS: { label: string; href: string; roles: UserRole[] }[] = [
  { label: "Passenger", href: "/dashboard/passenger", roles: ["passenger"] },
  { label: "Driver", href: "/dashboard/driver", roles: ["driver"] },
  { label: "Owner", href: "/dashboard/owner", roles: ["owner"] },
  { label: "Admin", href: "/dashboard/admin", roles: ["admin"] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { profile, user, role } = useAuth();
  const pathname = usePathname();

  const availableNav = NAV_ITEMS.filter((item) => (role ? item.roles.includes(role) : false));

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header removed: unified global navbar is used instead */}

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
