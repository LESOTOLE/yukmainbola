"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import type { TestimonialWithProfile } from "@/types/database";

interface TestimoniSectionProps {
  testimonials: TestimonialWithProfile[];
}

export default function TestimoniSection({ testimonials }: TestimoniSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver({ threshold: 0.1 });

  return (
    <section id="testimoni" className="py-20 px-4 bg-surface/50">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
            Kata Mereka
          </h2>
          <p className="mt-3 text-text-muted text-lg">
            Testimoni dari member setia Yuk Main Bola
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              Belum ada testimoni — gabung dan jadilah yang pertama! ⭐
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimoni, index) => (
              <Card
                key={testimoni.id}
                className={`bg-background border-border hover:border-primary/30 transition-all duration-500 ${
                  isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: isIntersecting ? `${index * 150}ms` : "0ms",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4 text-accent">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < testimoni.rating ? "currentColor" : "none"}
                        className={i < testimoni.rating ? "text-accent" : "text-border"}
                      />
                    ))}
                  </div>
                  <p className="text-text-muted mb-6 line-clamp-4">
                    "{testimoni.content}"
                  </p>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={testimoni.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary-muted text-primary text-sm font-semibold">
                        {(testimoni.profiles?.full_name || "Member")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-text font-medium text-sm">
                        {testimoni.profiles?.full_name || "Member"}
                      </p>
                      <p className="text-text-muted text-xs">Member</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
