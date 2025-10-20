"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardRedirectPage() {
  const router = useRouter();
  const { role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!role) {
      router.replace("/auth/login");
      return;
    }
    const routeMap = {
      passenger: "/dashboard/passenger",
      driver: "/dashboard/driver",
      owner: "/dashboard/owner",
      admin: "/dashboard/admin",
    } as const;
    router.replace(routeMap[role]);
  }, [loading, role, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}


