"use client";

import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { useRealtimeSlots } from "@/hooks/useRealtimeSlots";

export default function EventCard({ event }: { event: any }) {
  const currentParticipants = useRealtimeSlots('events', event.id, event.current_participants);
  const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
  const isFull = currentParticipants >= event.max_participants;
  
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-all flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-bold text-text">{event.title}</h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          isFull ? "bg-danger/20 text-danger border border-danger/30" : "bg-primary/20 text-primary border border-primary/30"
        }`}>
          {isFull ? "Penuh" : "Buka"}
        </span>
      </div>
      
      <p className="text-text-muted mb-6 line-clamp-2">{event.description}</p>
      
      <div className="space-y-3 mb-6 mt-auto">
        <div className="flex items-center text-sm text-text-muted">
          <Calendar className="w-4 h-4 mr-3 text-primary" />
          {formatDate(event.date)}
        </div>
        <div className="flex items-center text-sm text-text-muted">
          <Clock className="w-4 h-4 mr-3 text-primary" />
          {event.start_time.substring(0, 5)} - {event.end_time.substring(0, 5)}
        </div>
        <div className="flex items-center text-sm text-text-muted">
          <MapPin className="w-4 h-4 mr-3 text-primary" />
          {venue?.name || "TBA"}
        </div>
        <div className="flex items-center text-sm text-text-muted">
          <Users className="w-4 h-4 mr-3 text-primary" />
          {currentParticipants} / {event.max_participants} Peserta
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span className="text-lg font-bold text-primary">{formatCurrency(event.price)}</span>
        <Link 
          href={`/event/${event.id}`}
          className="bg-primary hover:bg-primary-hover text-background px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}
