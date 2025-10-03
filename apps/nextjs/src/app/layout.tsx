import "@lms/ui/styles.css";

import { ThemeProvider } from "@lms/ui/components/theme";
import { Toaster } from "@lms/ui/components/toast";
import { cn } from "@lms/ui/lib/utils";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { env } from "~/env";
import { TRPCReactProvider } from "~/trpc/react";
import { HydrateClient } from "~/trpc/server";

export const metadata: Metadata = {
  metadataBase: new URL(
    env.VERCEL_ENV === "production" ? "lms-livid-omega.vercel.app" : "http://localhost:3000"
  ),
  title: "Learn Management System",
  description:
    "A learning management system that enables instructors to create, manage, and deliver online courses while providing students with an intuitive platform to discover, enroll in, and complete educational content.",
  openGraph: {
    title: "Learn Management System",
    description:
      "A learning management system that enables instructors to create, manage, and deliver online courses while providing students with an intuitive platform to discover, enroll in, and complete educational content.",
    url: "https://lms-livid-omega.vercel.app",
    siteName: "Learn Management System",
  },
  twitter: {
    card: "summary_large_image",
    site: "@_mshehadeh",
    creator: "@_mshehadeh",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TRPCReactProvider>
            <HydrateClient>{props.children}</HydrateClient>
          </TRPCReactProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
