"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminToursPage from "@/components/tours/AdminToursPage";
import DriverToursPage from "@/components/tours/DriverToursPage";

export default function ToursPage() {
  const { role, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (role === "admin") {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <AdminToursPage />
      </ProtectedRoute>
    );
  }

  if (role === "driver") {
    return (
      <ProtectedRoute allowedRoles={["driver"]}>
        <DriverToursPage />
      </ProtectedRoute>
    );
  }

  // Redirect non-authorized users
  router.replace("/dashboard");
  return null;
}
