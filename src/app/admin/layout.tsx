"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Calendar, 
  Trophy,
  ImageIcon,
  Star,
  Menu,
  X,
  LogOut,
  Globe
} from "lucide-react";

const adminNavs = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Kelola Pengguna", href: "/admin/users", icon: Users },
  { name: "Kelola Lapangan", href: "/admin/venues", icon: MapPin },
  { name: "Kelola Jadwal", href: "/admin/schedules", icon: Calendar },
  { name: "Event & Turnamen", href: "/admin/events", icon: Trophy },
  { name: "Galeri Foto", href: "/admin/gallery", icon: ImageIcon },
  { name: "Testimoni", href: "/admin/testimonials", icon: Star },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
        <h2 className="text-xl font-bold text-text">Admin Panel</h2>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 bg-background rounded-md text-text-muted hover:text-text"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        ${isMobileMenuOpen ? 'flex' : 'hidden'} 
        md:flex flex-col w-full md:w-64 bg-surface border-r border-border md:min-h-screen
        fixed md:sticky top-16 md:top-0 z-40 h-[calc(100vh-4rem)] md:h-screen overflow-y-auto
      `}>
        <div className="p-6 hidden md:block">
          <h2 className="text-2xl font-bold text-text">YukMainBola</h2>
          <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Admin Panel</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          {adminNavs.map((nav) => {
            const isActive = pathname === nav.href;
            const Icon = nav.icon;
            return (
              <Link
                key={nav.name}
                href={nav.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${
                  isActive 
                    ? "bg-primary text-background" 
                    : "text-text hover:bg-background hover:text-primary"
                }`}
              >
                <Icon size={20} />
                {nav.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-text hover:bg-background hover:text-primary"
          >
            <Globe size={20} />
            Ke Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-danger hover:bg-danger/10"
          >
            <LogOut size={20} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 w-full">
        {children}
      </main>
    </div>
  );
}
