import React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";

import { AuthProvider } from "@/lib/auth/AuthContext";
import { AcademicThemeProvider } from "@/lib/theme/ThemeProvider";
import {Toaster} from "@/components/Toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: "Academic Management System - IIT Ropar",
  description: "IIT Ropar Academic Portal",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <AuthProvider>
            <AcademicThemeProvider>
              {children}
              <Toaster />
            </AcademicThemeProvider>
          </AuthProvider>
        </AppRouterCacheProvider>

        <Analytics />
      </body>
    </html>
  );
}
