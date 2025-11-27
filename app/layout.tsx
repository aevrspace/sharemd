import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import SiteHeader from "@/components/Site/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Markdown Viewer | Share & View Markdown Files",
    template: "%s | Markdown Viewer",
  },
  description:
    "A simple, elegant way to view and share markdown files. Upload or paste your markdown and get a shareable link instantly.",
  metadataBase: new URL("https://md-viewer.vercel.app"), // Replace with actual domain if known, or use localhost for dev
  keywords: [
    "markdown",
    "viewer",
    "share markdown",
    "markdown preview",
    "developer tools",
  ],
  authors: [{ name: "MiracleIO" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://md-viewer.vercel.app",
    title: "Markdown Viewer | Share & View Markdown Files",
    description:
      "A simple, elegant way to view and share markdown files. Upload or paste your markdown and get a shareable link instantly.",
    siteName: "Markdown Viewer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown Viewer | Share & View Markdown Files",
    description:
      "A simple, elegant way to view and share markdown files. Upload or paste your markdown and get a shareable link instantly.",
    creator: "@miracleio",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <NextTopLoader color="#4f39f6" />

          <SiteHeader />

          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
