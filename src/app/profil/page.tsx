import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import { Calendar, Clock, MapPin, User, LogOut, Ticket, Coins } from "lucide-react";
import CancelButton from "./CancelButton";
import CancelEventButton from "./CancelEventButton";
import TestimonialForm from "./TestimonialForm";
import PayButton from "./PayButton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function ProfilPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Fetch Bookings with schedule and venue details
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      status,
      payment_status,
      snap_token,
      created_at,
      schedules (
        id,
        date,
        start_time,
        end_time,
        price_per_person,
        status,
        venues (
          name,
          address
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch Event Participants with event details
  const { data: eventParticipants } = await supabase
    .from("event_participants")
    .select(`
      id,
      status,
      payment_status,
      snap_token,
      created_at,
      events (
        id,
        title,
        date,
        start_time,
        end_time,
        price,
        status,
        venues (
          name,
          address
        )
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Separate upcoming and past/cancelled bookings
  const upcomingBookings = bookings?.filter(b => 
    b.status === "booked" && 
    (Array.isArray(b.schedules) ? b.schedules[0] : b.schedules)?.status !== "completed" &&
    (Array.isArray(b.schedules) ? b.schedules[0] : b.schedules)?.status !== "cancelled"
  ) || [];

  const pastBookings = bookings?.filter(b => 
    b.status === "cancelled" || 
    (Array.isArray(b.schedules) ? b.schedules[0] : b.schedules)?.status === "completed" ||
    (Array.isArray(b.schedules) ? b.schedules[0] : b.schedules)?.status === "cancelled"
  ) || [];

  const upcomingEvents = eventParticipants?.filter(p =>
    p.status === "registered" &&
    (Array.isArray(p.events) ? p.events[0] : p.events)?.status !== "completed" &&
    (Array.isArray(p.events) ? p.events[0] : p.events)?.status !== "cancelled"
  ) || [];

  const pastEvents = eventParticipants?.filter(p =>
    p.status === "cancelled" ||
    (Array.isArray(p.events) ? p.events[0] : p.events)?.status === "completed" ||
    (Array.isArray(p.events) ? p.events[0] : p.events)?.status === "cancelled"
  ) || [];

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4">
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Profile */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="bg-surface rounded-xl p-6 border border-border sticky top-24">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                  <User size={40} />
                </div>
                <h2 className="text-xl font-bold text-text">{profile?.full_name || "Member"}</h2>
                <p className="text-text-muted text-sm mb-6">{user.email}</p>
                
                <div className="w-full space-y-4">
                  <div className="bg-background rounded-lg p-3 border border-border text-left">
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Status</p>
                    <p className="text-sm font-medium text-text capitalize">{profile?.role || "Member"}</p>
                  </div>
                  
                  <div className="bg-primary/5 rounded-lg p-3 border border-primary/20 text-left flex items-center justify-between">
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Poin Saya</p>
                      <p className="text-sm font-bold text-primary flex items-center">
                        <Coins size={14} className="mr-1" />
                        {profile?.points_balance?.toLocaleString('id-ID') || "0"} Poin
                      </p>
                    </div>
                  </div>
                  
                  <form action="/auth/signout" method="post">
                    <Button variant="outline" className="w-full text-danger border-danger/30 hover:bg-danger/10 hover:text-danger">
                      <LogOut size={16} className="mr-2" />
                      Keluar
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="flex-1 space-y-12">
            
            {/* Events Section */}
            <div>
              <h1 className="text-3xl font-bold text-text mb-6">Event & Turnamen</h1>
              <section>
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-border pb-2">Akan Datang</h2>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((participant: any) => {
                      const event = Array.isArray(participant.events) ? participant.events[0] : participant.events;
                      const venue = Array.isArray(event.venues) ? event.venues[0] : event.venues;
                      
                      return (
                        <div key={participant.id} className="bg-surface rounded-xl p-5 border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:border-primary/30">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-text">
                              <Link href={`/event/${event.id}`} className="hover:text-primary transition-colors flex items-center">
                                <Ticket size={18} className="mr-2 text-primary" />
                                {event.title}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-primary" />
                                {event.start_time.substring(0,5)} - {event.end_time.substring(0,5)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-primary" />
                                {venue?.name || "TBA"}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <span className="text-primary font-bold">{formatCurrency(event.price)}</span>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 ${
                              participant.payment_status === 'paid' ? 'bg-primary/20 text-primary border border-primary/30' :
                              'bg-accent/20 text-accent border border-accent/30'
                            }`}>
                              {participant.payment_status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                            </span>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              {participant.payment_status === 'pending' && participant.snap_token && (
                                <PayButton token={participant.snap_token} />
                              )}
                              <CancelEventButton participantId={participant.id} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-background rounded-xl p-6 border border-border text-center">
                    <p className="text-text-muted text-sm mb-4">Belum ada event yang didaftar.</p>
                    <Link href="/event" className="text-primary hover:underline text-sm font-semibold">Cari Event Terbaru</Link>
                  </div>
                )}
              </section>
            </div>

            {/* Schedules Section */}
            <div>
              <h1 className="text-3xl font-bold text-text mb-6">Jadwal Mabar Saya</h1>
              <section>
                <h2 className="text-xl font-semibold text-text mb-4 border-b border-border pb-2">Akan Datang</h2>
                
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking: any) => {
                      const schedule = Array.isArray(booking.schedules) ? booking.schedules[0] : booking.schedules;
                      const venue = Array.isArray(schedule.venues) ? schedule.venues[0] : schedule.venues;
                      
                      return (
                        <div key={booking.id} className="bg-surface rounded-xl p-5 border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center transition-all hover:border-primary/30">
                          <div className="space-y-2">
                            <h3 className="text-lg font-bold text-text">
                              <Link href={`/jadwal/${schedule.id}`} className="hover:text-primary transition-colors">
                                Mabar di {venue?.name}
                              </Link>
                            </h3>
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-text-muted">
                              <div className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-primary" />
                                {formatDate(schedule.date)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock size={14} className="text-primary" />
                                {schedule.start_time.substring(0,5)} - {schedule.end_time.substring(0,5)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-primary" />
                                {venue?.name}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <span className="text-primary font-bold">{formatCurrency(schedule.price_per_person)}</span>
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider mb-2 ${
                              booking.payment_status === 'paid' ? 'bg-primary/20 text-primary border border-primary/30' :
                              'bg-accent/20 text-accent border border-accent/30'
                            }`}>
                              {booking.payment_status === 'paid' ? 'Lunas' : 'Menunggu Pembayaran'}
                            </span>
                            
                            <div className="flex gap-2 w-full sm:w-auto">
                              {booking.payment_status === 'pending' && booking.snap_token && (
                                <PayButton token={booking.snap_token} />
                              )}
                              <CancelButton bookingId={booking.id} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-background rounded-xl p-6 border border-border text-center">
                    <p className="text-text-muted text-sm mb-4">Anda belum memiliki jadwal mabar mendatang.</p>
                    <Link href="/#jadwal" className="bg-primary hover:bg-primary-hover text-background px-4 py-2 rounded-lg transition-colors text-sm font-semibold inline-block">
                      Cari Jadwal Mabar
                    </Link>
                  </div>
                )}
              </section>
            </div>
            
            {/* Past Bookings & Events */}
            <section>
              <h2 className="text-xl font-semibold text-text mb-4 border-b border-border pb-2 mt-12">Riwayat & Batal</h2>
              
              {(pastBookings.length > 0 || pastEvents.length > 0) ? (
                <div className="space-y-4 opacity-75">
                  {/* Past Events */}
                  {pastEvents.map((participant: any) => {
                    const event = Array.isArray(participant.events) ? participant.events[0] : participant.events;
                    return (
                      <div key={participant.id} className="bg-background rounded-xl p-4 border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-base font-semibold text-text line-through opacity-80 flex items-center">
                            <Ticket size={16} className="mr-2" />
                            {event.title}
                          </h3>
                          <p className="text-sm text-text-muted mt-1">
                            {formatDate(event.date)}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                            participant.status === 'cancelled' 
                              ? 'bg-danger/10 text-danger border border-danger/20' 
                              : 'bg-surface-hover text-text-muted border border-border'
                          }`}>
                            {participant.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Past Schedules */}
                  {pastBookings.map((booking: any) => {
                    const schedule = Array.isArray(booking.schedules) ? booking.schedules[0] : booking.schedules;
                    const venue = Array.isArray(schedule.venues) ? schedule.venues[0] : schedule.venues;
                    
                    return (
                      <div key={booking.id} className="bg-background rounded-xl p-4 border border-border flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <div>
                          <h3 className="text-base font-semibold text-text line-through opacity-80">
                            Mabar di {venue?.name}
                          </h3>
                          <p className="text-sm text-text-muted mt-1">
                            {formatDate(schedule.date)}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                            booking.status === 'cancelled' 
                              ? 'bg-danger/10 text-danger border border-danger/20' 
                              : 'bg-surface-hover text-text-muted border border-border'
                          }`}>
                            {booking.status === 'cancelled' ? 'Dibatalkan' : 'Selesai'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-text-muted italic text-sm">Belum ada riwayat aktivitas.</p>
              )}
            </section>
            
            <TestimonialForm />
          </div>
        </div>
      </div>
    </div>
  );
}
