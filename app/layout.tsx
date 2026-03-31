import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import NavBar from "@/components/NavBar"
import Footer from "@/components/Footer"
import PageTransitionWrapper from "@/components/PageTransitionWrapper"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "Bryan Lim",
  description: "Builder at the intersection of business and technology.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)] font-sans antialiased overflow-x-hidden">
        <NavBar />
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
        <Footer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
