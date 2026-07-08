import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Yuk Main Bola — Komunitas Minisoccer",
  description:
    "Komunitas minisoccer terbuka untuk semua. Gabung mabar, temukan jadwal, dan mainkan bolamu bersama kami.",
  keywords: ["minisoccer", "futsal", "komunitas", "mabar", "bola"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={cn("dark", "font-sans", geist.variable)}>
      <body className={`${geist.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
