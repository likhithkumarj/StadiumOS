import type { Metadata } from "next";
import { Bebas_Neue, Manrope, IBM_Plex_Mono } from "next/font/google";
import { TelemetryProvider } from "@/context/TelemetryContext";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StadiumOS AI — FIFA World Cup 2026 Operations",
  description: "AI-Powered Operations & Fan Companion Platform for FIFA World Cup 2026 Venues",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${manrope.variable} ${ibmPlexMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-pitch-night text-chalk font-sans select-none overflow-x-hidden">
        <TelemetryProvider>
          {children}
        </TelemetryProvider>
      </body>
    </html>
  );
}
