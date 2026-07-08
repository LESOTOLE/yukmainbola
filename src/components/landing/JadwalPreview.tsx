"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { formatDate, formatCurrency, formatTime } from "@/lib/utils/format";
import type { ScheduleWithVenue } from "@/types/database";

interface JadwalPreviewProps {
  schedules: ScheduleWithVenue[];
}

export default function JadwalPreview({ schedules }: JadwalPreviewProps) {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section id="jadwal" className="py-20 px-4">
      <div ref={ref} className="max-w-7xl mx-auto">
        <div
          className={`text-center mb-12 transition-all duration-700 ${
            isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
            Jadwal Mabar Terdekat
          </h2>
          <p className="mt-3 text-text-muted text-lg">
            Pilih jadwal dan gabung mabar bareng komunitas
          </p>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-text-muted text-lg">
              Belum ada jadwal tersedia saat ini — stay tuned! ⚽
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {schedules.map((schedule, index) => {
              const slotsLeft = schedule.max_players - schedule.current_players;
              const isFull = slotsLeft === 0;

              return (
                <Card
                  key={schedule.id}
                  className={`bg-surface border-border hover:border-primary/30 hover:scale-[1.02] transition-all duration-300 overflow-hidden ${
                    isIntersecting ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    transitionDelay: isIntersecting ? `${(index + 1) * 150}ms` : "0ms",
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-text font-semibold text-lg">
                        {schedule.venues.name}
                      </h3>
                      <Badge
                        variant={isFull ? "destructive" : "default"}
                        className={
                          isFull
                            ? "bg-danger/10 text-danger border-danger/20"
                            : "bg-primary-muted text-primary border-primary/20"
                        }
                      >
                        {isFull ? "Penuh" : `${slotsLeft} slot`}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-text-muted">
                        <Calendar size={16} className="text-primary" />
                        <span>{formatDate(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <Clock size={16} className="text-primary" />
                        <span>
                          {formatTime(schedule.start_time)} -{" "}
                          {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <MapPin size={16} className="text-primary" />
                        <span className="truncate">{schedule.venues.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted">
                        <Users size={16} className="text-primary" />
                        <span>
                          {schedule.current_players}/{schedule.max_players} pemain
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-primary font-bold text-lg">
                        {formatCurrency(schedule.price_per_person)}
                        <span className="text-text-muted font-normal text-sm">
                          /orang
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div
          className={`text-center mt-8 transition-all duration-700 delay-500 ${
            isIntersecting ? "opacity-100" : "opacity-0"
          }`}
        >
          <button className="text-primary hover:text-primary-hover font-medium transition-colors text-sm inline-flex items-center gap-1">
            Lihat Semua Jadwal →
          </button>
        </div>
      </div>
    </section>
  );
}
