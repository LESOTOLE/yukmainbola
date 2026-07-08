"use client";

import Image from "next/image";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { GalleryItem } from "@/types/database";

interface GaleriSectionProps {
  galleryItems: GalleryItem[];
}

export default function GaleriSection({ galleryItems }: GaleriSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="galeri" className="py-20 px-4">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
            Galeri Komunitas
          </h2>
          <p className="mt-3 text-text-muted text-lg">
            Keseruan mabar dan turnamen Yuk Main Bola
          </p>
        </div>

        {galleryItems.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              Belum ada foto kegiatan — stay tuned! 📸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className={`group relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-surface transition-all duration-500 ${
                  isIntersecting ? "opacity-100 scale-100" : "opacity-0 scale-95"
                }`}
                style={{
                  transitionDelay: isIntersecting ? `${index * 100}ms` : "0ms",
                }}
              >
                <Image
                  src={item.image_url}
                  alt={item.caption || "Galeri Yuk Main Bola"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  {item.caption && (
                    <p className="p-4 text-white font-medium text-sm md:text-base translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {item.caption}
                    </p>
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
