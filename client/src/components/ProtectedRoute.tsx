"use client";

import React from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { canManageUsers } from "@/lib/permissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: (user: any) => boolean;
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredPermission = canManageUsers,
  fallbackPath = "/",
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    const currentPath = window.location.pathname;
    setLocation(`/login?next=${encodeURIComponent(currentPath)}`);
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If user doesn't have required permission
  if (!requiredPermission(user)) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-destructive" />
              <CardTitle>Không có quyền truy cập</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên để được cấp quyền.
            </p>
            <Button onClick={() => setLocation(fallbackPath)} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

