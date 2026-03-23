import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 
import { Suspense } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeWipeProvider } from "@/components/ThemeWipeProvider";
import { APP_NAME, APP_DESC, SITE_URL, OG_IMAGE } from "@/lib/constants";

// --- Fonts configuration ---
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

// --- Metadata (SEO / title / etc.) ---
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESC,

  applicationName: APP_NAME,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // Important: les moteurs aiment quand c’est clair
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },

  icons: {
    icon: "/favicon.ico",
    apple: "/icons/apple-touch-icon.png",
  },

  openGraph: {
    type: "website",
    siteName: APP_NAME,
    url: "/",
    title: APP_NAME,
    description: APP_DESC,
    locale: "fr_FR",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — Gestion de facturation`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: APP_NAME,
    description: APP_DESC,
    images: [OG_IMAGE],
  },

  manifest: "/manifest.webmanifest",
};

// --- Viewport configuration ---
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0f" },
  ],
};

// --- Root layout ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${spaceGrotesk.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-background text-foreground antialiased">
        <ThemeProvider>
          <ThemeWipeProvider>
            <Suspense>
              {children}
              <Toaster richColors position="top-right" />
            </Suspense>
          </ThemeWipeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
