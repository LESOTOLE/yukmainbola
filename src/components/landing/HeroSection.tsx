"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

export default function HeroSection() {
  const router = useRouter();
  const scrollToJadwal = () => {
    const el = document.querySelector("#jadwal");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-surface to-background" />

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(34,197,94,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div
          className="opacity-0 animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-muted border border-primary/20 text-primary text-sm font-medium mb-6">
            🏆 Komunitas Minisoccer #1
          </span>
        </div>

        <h1
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 opacity-0 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <span className="text-text">
            Yuk Main Bola
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto mb-8 opacity-0 animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          Komunitas Minisoccer Terbuka Untuk Semua. Temukan jadwal mabar,
          gabung tim, dan nikmati serunya bermain bola bareng.
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-slide-up"
          style={{ animationDelay: "0.6s" }}
        >
          <Button
            size="lg"
            onClick={() => router.push("/register")}
            className="bg-primary hover:bg-primary-hover text-background font-semibold rounded-lg px-8 py-6 text-base transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02]"
          >
            Gabung Sekarang
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToJadwal}
            className="border-border text-text hover:bg-surface hover:border-primary/50 rounded-lg px-8 py-6 text-base transition-all duration-300"
          >
            Lihat Jadwal
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToJadwal}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-text-muted hover:text-primary transition-colors animate-bounce"
      >
        <ChevronDown size={28} />
      </button>
    </section>
  );
}
