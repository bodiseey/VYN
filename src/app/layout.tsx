import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VYN.md — Automotive Intelligence",
  description: "Verificare completă a istoricului autovehiculului. Date reale din registrele oficiale Moldova, NHTSA, și piața auto.",
  keywords: ["verificare VIN", "istoric auto", "raport auto Moldova", "VIN check", "autovehicul"],
  authors: [{ name: "BODISHTYAN SOLUTIONS SRL" }],
  creator: "VYN.md",
  publisher: "BODISHTYAN SOLUTIONS SRL",
  metadataBase: new URL("https://www.vyn.md"),
  openGraph: {
    title: "VYN.md — Automotive Intelligence",
    description: "Verificare istoricul autovehiculului cu date oficiale din Moldova și SUA.",
    url: "https://www.vyn.md",
    siteName: "VYN.md",
    locale: "ro_MD",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <meta name="theme-color" content="#2563EB" />
      </head>
      <body className={jakarta.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
