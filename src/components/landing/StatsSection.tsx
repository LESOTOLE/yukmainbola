"use client";

import { useEffect, useState } from "react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Users, CalendarCheck, Trophy, MapPin } from "lucide-react";

interface StatItem {
  label: string;
  value: number;
  icon: React.ElementType;
  suffix?: string;
}

interface StatsSectionProps {
  totalMembers: number;
  totalMabar: number;
  totalVenues: number;
}

function CountUpNumber({ target, isVisible }: { target: number; isVisible: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return <span>{count.toLocaleString("id-ID")}</span>;
}

export default function StatsSection({
  totalMembers,
  totalMabar,
  totalVenues,
}: StatsSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.3 });

  const stats: StatItem[] = [
    { label: "Total Member", value: totalMembers, icon: Users },
    { label: "Total Mabar", value: totalMabar, icon: CalendarCheck },
    { label: "Total Event", value: 0, icon: Trophy },
    { label: "Venue Partner", value: totalVenues, icon: MapPin },
  ];

  return (
    <section className="py-20 px-4 bg-surface/50">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={`text-center p-6 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all duration-500 ${
                isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-75"
              }`}
              style={{
                transitionDelay: isIntersecting ? `${index * 150}ms` : "0ms",
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary-muted mb-3">
                <stat.icon size={24} className="text-primary" />
              </div>
              <p className="text-3xl md:text-4xl font-bold text-text">
                <CountUpNumber target={stat.value} isVisible={isIntersecting} />
                {stat.suffix && (
                  <span className="text-primary">{stat.suffix}</span>
                )}
              </p>
              <p className="text-text-muted text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
