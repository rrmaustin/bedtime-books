import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navigation from "@/components/Navigation";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  title: "Bedtime Books - Personalized Stories for Little Dreamers",
  description: "Create magical, personalized bedtime stories featuring your child as the hero. Beautiful illustrations and heartwarming lessons make bedtime special.",
  keywords: "bedtime stories, children's books, personalized stories, kids books, bedtime reading",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Navigation />
          <div className="pt-20">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
