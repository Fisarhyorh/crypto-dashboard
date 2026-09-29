import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'


const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
})
 
const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Crypto Dashboard',
  description: 'Live cryptocurrency prices with search, sort, and 24h change tracking',
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
  <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
