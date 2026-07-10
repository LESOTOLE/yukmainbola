"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export function ClientNavbar({ user, profile }: { user: any; profile: any }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar user={user} profile={profile} />;
}

export function ClientFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Footer />;
}
