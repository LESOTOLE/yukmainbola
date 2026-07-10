import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Calendar, Clock, MapPin, Users, Info } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import EventJoinButton from "./EventJoinButton";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: event } = await supabase
    .from("events")
    .select("*, venues(*)")
    .eq("id", params.id)
    .single();

  if (!event) {
    notFound();
  }

  const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
  const isFull = event.current_participants >= event.max_participants;

  let isBooked = false;
  let pointsBalance = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", user.id)
      .single();
    pointsBalance = profile?.points_balance || 0;

    const { data: registration } = await supabase
      .from("event_participants")
      .select("id")
      .eq("event_id", event.id)
      .eq("user_id", user.id)
      .eq("status", "registered")
      .maybeSingle();
      
    if (registration) {
      isBooked = true;
    }
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-surface border border-border rounded-2xl overflow-hidden">
          <div className="bg-primary/10 p-8 border-b border-border">
            <h1 className="text-3xl md:text-4xl font-bold text-text mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium">
              <span className={`px-3 py-1 rounded-full uppercase tracking-wider ${
                event.status === "upcoming" ? "bg-primary/20 text-primary border border-primary/30" : "bg-accent/20 text-accent border border-accent/30"
              }`}>
                {event.status}
              </span>
              <span className="bg-surface text-text-muted px-3 py-1 rounded-full border border-border">
                {isFull ? "Kuota Penuh" : "Kuota Tersedia"}
              </span>
            </div>
          </div>
          
          <div className="p-8 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-text mb-4 flex items-center">
                  <Info className="mr-2 text-primary" size={20} /> Deskripsi Event
                </h2>
                <div className="text-text-muted whitespace-pre-wrap leading-relaxed bg-background p-4 rounded-xl border border-border">
                  {event.description || "Tidak ada deskripsi."}
                </div>
              </section>
              
              <section>
                <h2 className="text-xl font-bold text-text mb-4">Informasi Pelaksanaan</h2>
                <div className="bg-background rounded-xl p-4 border border-border grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="text-primary mt-1 mr-3 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Tanggal</p>
                      <p className="font-semibold text-text">{formatDate(event.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="text-primary mt-1 mr-3 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Waktu</p>
                      <p className="font-semibold text-text">{event.start_time.substring(0,5)} - {event.end_time.substring(0,5)}</p>
                    </div>
                  </div>
                  <div className="flex items-start sm:col-span-2">
                    <MapPin className="text-primary mt-1 mr-3 shrink-0" size={20} />
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Lokasi</p>
                      <p className="font-semibold text-text">{venue?.name}</p>
                      <p className="text-sm text-text-muted mt-1">{venue?.address}</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
            
            <div className="space-y-6">
              <div className="bg-background rounded-xl p-6 border border-border sticky top-24">
                <h3 className="text-lg font-bold text-text mb-4 border-b border-border pb-2">Registrasi</h3>
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-text-muted">Biaya</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(event.price)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <span className="text-text-muted">Peserta</span>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-text-muted" />
                    <span className="font-semibold text-text">{event.current_participants}</span>
                    <span className="text-text-muted mx-1">/</span>
                    <span className="text-text-muted">{event.max_participants}</span>
                  </div>
                </div>
                
                <EventJoinButton 
                  eventId={event.id}
                  isBooked={isBooked}
                  isFull={isFull}
                  isLoggedIn={!!user}
                  pointsBalance={pointsBalance}
                  price={event.price}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
