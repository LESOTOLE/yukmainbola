import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import EventCard from "@/components/home/EventCard";

export const metadata = {
  title: "Events & Tournaments | Yuk Main Bola",
  description: "Daftar event, turnamen, dan acara spesial dari komunitas Yuk Main Bola.",
};

export default async function EventPage() {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*, venues(name, address)")
    .order("date", { ascending: true })
    .gte("date", new Date().toISOString().split("T")[0]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-text mb-4">Event & Turnamen</h1>
          <p className="text-text-muted text-lg">Ikuti event seru dan turnamen kompetitif bersama komunitas Yuk Main Bola.</p>
        </div>

        {events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl p-12 text-center border border-border">
            <h3 className="text-xl font-bold text-text mb-2">Belum ada event tersedia</h3>
            <p className="text-text-muted">Saat ini belum ada event atau turnamen yang dijadwalkan. Pantau terus ya!</p>
          </div>
        )}
      </div>
    </div>
  );
}
