"use client";

import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { MapPin, CheckCircle2 } from "lucide-react";
import type { Venue } from "@/types/database";

interface VenueSectionProps {
  venues: Venue[];
}

export default function VenueSection({ venues }: VenueSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="venue" className="py-20 px-4">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
            Venue Partner
          </h2>
          <p className="mt-3 text-text-muted text-lg">
            Lapangan minisoccer terbaik yang bekerja sama dengan kami
          </p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              Belum ada data venue — stay tuned! 🏟️
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {venues.map((venue, index) => (
              <div
                key={venue.id}
                className={`flex flex-col sm:flex-row gap-6 bg-surface rounded-xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-500 ${
                  isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isIntersecting ? `${index * 150}ms` : "0ms",
                }}
              >
                <div className="relative w-full sm:w-2/5 h-48 sm:h-auto">
                  {venue.image_url ? (
                    <Image
                      src={venue.image_url}
                      alt={venue.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-background flex items-center justify-center">
                      <MapPin size={32} className="text-text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="p-6 sm:p-6 sm:pl-0 flex flex-col justify-center w-full sm:w-3/5">
                  <h3 className="text-xl font-bold text-text mb-2">
                    {venue.name}
                  </h3>
                  <div className="flex items-start gap-2 text-text-muted text-sm mb-4">
                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                    <p>{venue.address}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-text mb-2">
                      Fasilitas:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {venue.facilities.map((fasilitas, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-background border border-border rounded-md text-text-muted"
                        >
                          <CheckCircle2 size={12} className="text-primary" />
                          <span className="capitalize">{fasilitas}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {venue.maps_url && (
                    <a
                      href={venue.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-hover text-sm font-medium transition-colors inline-flex items-center gap-1 mt-auto"
                    >
                      Buka di Google Maps →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
