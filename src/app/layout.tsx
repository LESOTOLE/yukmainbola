import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Yuk Main Bola — Komunitas Minisoccer",
  description:
    "Komunitas minisoccer terbuka untuk semua. Gabung mabar, temukan jadwal, dan mainkan bolamu bersama kami.",
  keywords: ["minisoccer", "futsal", "komunitas", "mabar", "bola"],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <html lang="id" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar user={user} profile={profile} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
