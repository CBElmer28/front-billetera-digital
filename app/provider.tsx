'use client';

import { ThemeProvider } from "next-themes";
import { NotificationProvider } from "./contexts/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ThemeProvider>
  );
}