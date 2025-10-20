import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; 

// --- Fonts configuration ---
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

// --- Metadata (SEO / title / etc.) ---
export const metadata: Metadata = {
  title: {
    default: "InvoiceFlow",
    template: "%s | InvoiceFlow",
  },
  description: "Gérez vos factures simplement et efficacement avec InvoiceFlow.",
  icons: {
    icon: "/favicon.ico",
  },
};

// --- Root layout ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${lexend.variable}`}>
      <body className="font-sans bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
