"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut, User, Shield, X } from "lucide-react";
import type { Profile } from "@/types/database";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface NavbarProps {
  user: SupabaseUser | null;
  profile: Profile | null;
}

const navLinks = [
  { label: "Jadwal", href: "#jadwal" },
  { label: "Galeri", href: "#galeri" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Venue", href: "#venue" },
];

export default function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("#")) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const isAdmin = profile?.role === "admin" || profile?.role === "super_admin";
  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg shadow-black/10"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              ⚽ Yuk Main Bola
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-text-muted hover:text-primary font-medium transition-colors duration-200 text-sm"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-muted text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-text text-sm font-medium">
                      {profile.full_name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 bg-surface border-border"
                >
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profil"
                      className="flex items-center gap-2 text-text cursor-pointer"
                    >
                      <User size={16} />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 text-text cursor-pointer"
                      >
                        <Shield size={16} />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-danger cursor-pointer"
                  >
                    <LogOut size={16} />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="text-text-muted hover:text-text hover:bg-surface"
                >
                  <Link href="/login">Masuk</Link>
                </Button>
                <Button
                  asChild
                  className="bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg transition-all duration-300"
                >
                  <Link href="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-text hover:bg-surface">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-surface border-border w-[280px]"
            >
              <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
              <div className="flex flex-col h-full pt-8">
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-text hover:text-primary font-medium transition-colors text-left text-lg py-2"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="mt-auto pb-8 space-y-3">
                  {user && profile ? (
                    <>
                      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                        <Avatar className="h-10 w-10 border border-border">
                          <AvatarImage src={profile.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary-muted text-primary text-sm font-semibold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-text font-medium text-sm">
                            {profile.full_name}
                          </p>
                          <p className="text-text-muted text-xs capitalize">
                            {profile.role}
                          </p>
                        </div>
                      </div>
                      <Link
                        href="/profil"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 text-text hover:text-primary py-2 transition-colors"
                      >
                        <User size={18} />
                        Profil
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2 text-text hover:text-primary py-2 transition-colors"
                        >
                          <Shield size={18} />
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-danger hover:text-danger-hover py-2 transition-colors w-full text-left"
                      >
                        <LogOut size={18} />
                        Keluar
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-center text-text-muted hover:text-text hover:bg-background"
                      >
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                          Masuk
                        </Link>
                      </Button>
                      <Button
                        asChild
                        className="w-full justify-center bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg"
                      >
                        <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                          Daftar
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
