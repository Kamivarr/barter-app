import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getSessionUser } from "@/lib/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Barter – Sąsiedzkie wypożyczalnie sprzętu i narzędzi w Rzeszowie",
  description:
    "Wypożyczaj wiertarki, drabiny, myjki ciśnieniowe i narzędzia od sąsiadów w Rzeszowie. Bezpieczne płatności BLIK, weryfikacja odbiorem kodem PIN, przejrzysty model 15% prowizji.",
  keywords: [
    "wypożyczalnia narzędzi",
    "barter",
    "Rzeszów",
    "wynajem sprzętu",
    "ekonomia współdzielenia",
    "wiertarka",
    "narzędzia ogrodnicze",
  ],
  other: {
    "darkreader-lock": "",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#0c0a09",
};

function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-800/90 bg-stone-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-orange-600 p-2 sm:p-2.5 rounded-xl text-white shadow-lg shadow-orange-600/30">
              <span className="font-black text-sm">B</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">Barter</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-600/20 text-orange-400 border border-orange-500/30">Rzeszów</span>
            </div>
          </div>
          <div className="hidden md:block flex-1 max-w-sm lg:max-w-md h-9 bg-stone-900 border border-stone-800 rounded-xl animate-pulse" />
          <div className="h-9 w-28 bg-stone-900 border border-stone-800 rounded-xl animate-pulse" />
        </div>
      </div>
    </header>
  );
}

async function AuthNavbar() {
  const user = await getSessionUser();
  return <Navbar user={user} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="darkreader-lock" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-stone-950 text-stone-100 font-sans selection:bg-orange-600 selection:text-white"
      >
        <Suspense fallback={<NavbarSkeleton />}>
          <AuthNavbar />
        </Suspense>
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
