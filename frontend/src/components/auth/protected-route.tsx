"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        router.push("/login");
      } else if (requireAdmin && user?.role !== "admin") {
        // Redirect to dashboard if not admin
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, requireAdmin, user, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null while redirecting
    return null;
  }

  if (requireAdmin && user?.role !== "admin") {
    // Return null while redirecting
    return null;
  }

  return <>{children}</>;
}
