import Link from "next/link";
import { Mail, Phone, Instagram } from "lucide-react";

const quickLinks = [
  { label: "Jadwal", href: "#jadwal" },
  { label: "Galeri", href: "#galeri" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Masuk", href: "/login" },
  { label: "Daftar", href: "/register" },
];

const contactLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/6281234567890",
    icon: Phone,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/yukmainbola",
    icon: Instagram,
  },
  {
    label: "Email",
    href: "mailto:halo@yukmainbola.id",
    icon: Mail,
  },
];

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: About */}
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              ⚽ Yuk Main Bola
            </span>
            <p className="mt-3 text-text-muted text-sm leading-relaxed">
              Komunitas minisoccer terbuka untuk semua kalangan. Temukan jadwal
              mabar, gabung tim, dan nikmati serunya bermain bola bersama.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-text font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-text-muted hover:text-primary text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="text-text font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3">
              {contactLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-text-muted hover:text-primary text-sm transition-colors duration-200"
                  >
                    <link.icon size={16} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-center text-text-muted text-sm">
            © 2026 Yuk Main Bola. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
