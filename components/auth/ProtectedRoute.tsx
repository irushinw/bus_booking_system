"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/firestore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
      router.replace("/auth/login?reason=unauthorized");
    }
  }, [allowedRoles, loading, role, router, user]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && role && !allowedRoles.includes(role)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Access restricted</h2>
        <p className="max-w-md text-muted-foreground">
          You do not have permission to view this dashboard. Please contact the transportation board for assistance.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
