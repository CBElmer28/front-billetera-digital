// src/app/(protected)/layout.tsx
import React from "react";
import AuthGuard from "@/app/components/authGuard";
import AppLayout from "@/app/components/AppLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppLayout>
        {children}
      </AppLayout>
    </AuthGuard>
  );
}
