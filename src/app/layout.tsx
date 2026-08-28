import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SplashLoader } from "@/components/loader/SplashLoader";
import { Providers } from "@/components/providers/Providers";
import { Toaster } from "@/components/ui/sonner";
import { ParticleBackground } from "@/components/layout/ParticleBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Abhishek Garg | Portfolio",
    template: "%s | Abhishek Garg",
  },
  description:
    "Full stack developer portfolio — projects, experience, skills, and contact.",
  applicationName: "Abhishek Garg Portfolio",
  keywords: [
    "Abhishek Garg",
    "Full Stack Developer",
    "Portfolio",
    "React",
    "Next.js",
  ],
  authors: [{ name: "Abhishek Garg" }],
  creator: "Abhishek Garg",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portfolio",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Abhishek Garg | Portfolio",
    description:
      "Full stack developer portfolio — projects, experience, skills, and contact.",
    siteName: "Abhishek Garg Portfolio",
  },
  twitter: {
    card: "summary",
    title: "Abhishek Garg | Portfolio",
    description:
      "Full stack developer portfolio — projects, experience, skills, and contact.",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-zinc-50/40 dark:bg-zinc-950/20 text-foreground">
        <Providers>
          <ParticleBackground />
          <SplashLoader>{children}</SplashLoader>
          <Toaster richColors closeButton position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
