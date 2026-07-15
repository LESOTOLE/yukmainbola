import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, Calendar, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ScheduleWithVenue, Profile } from "@/types/database";
import { formatDate, formatCurrency } from "@/lib/utils/format";
import JoinButton from "./JoinButton";
import LiveSlotInfo from "./LiveSlotInfo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface JadwalDetailProps {
  params: Promise<{ id: string }>;
}

export default async function JadwalDetailPage({ params }: JadwalDetailProps) {
  const { id } = await params;
  
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  let pointsBalance = 0;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("points_balance")
      .eq("id", user.id)
      .single();
    pointsBalance = profile?.points_balance || 0;
  }
  
  // Fetch schedule with venue
  const { data: schedule, error } = await supabase
    .from("schedules")
    .select(`
      *,
      venues (*)
    `)
    .eq("id", id)
    .single();

  if (error || !schedule) {
    notFound();
  }
  
  const typedSchedule = schedule as unknown as ScheduleWithVenue;
  
  // Fetch bookings for this schedule to show who's playing
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      user_id,
      quantity,
      guest_names,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .eq("schedule_id", id)
    .eq("status", "booked");
    
  // Check if current user is already booked
  const isBooked = bookings?.some(b => b.user_id === user?.id) || false;
  
  // Check if it's full
  const isFull = typedSchedule.status === "full" || typedSchedule.current_players >= typedSchedule.max_players;

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link 
          href="/#jadwal" 
          className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          <span>Kembali ke Jadwal</span>
        </Link>
        
        <div className="bg-surface rounded-xl overflow-hidden border border-border shadow-xl">
          {/* Header Image */}
          <div className="relative h-64 md:h-80 w-full bg-surface-hover">
            {typedSchedule.venues.image_url ? (
              <Image 
                src={typedSchedule.venues.image_url}
                alt={typedSchedule.venues.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                <MapPin size={48} className="opacity-20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
            
            <div className="absolute bottom-0 left-0 p-6 w-full">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider
                  ${typedSchedule.status === 'open' ? 'bg-primary/20 text-primary border border-primary/30' : 
                    typedSchedule.status === 'full' ? 'bg-danger/20 text-danger border border-danger/30' : 
                    'bg-surface-hover text-text-muted border border-border'}
                `}>
                  {typedSchedule.status === 'open' ? (
                    <LiveSlotInfo scheduleId={typedSchedule.id} initialPlayers={typedSchedule.current_players} maxPlayers={typedSchedule.max_players} variant="status-text" />
                  ) : 
                   typedSchedule.status === 'full' ? 'Penuh' : 
                   typedSchedule.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">
                Mabar di {typedSchedule.venues.name}
              </h1>
              <p className="text-text-muted flex items-center gap-2">
                <MapPin size={18} />
                {typedSchedule.venues.address}
              </p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background rounded-lg p-4 border border-border flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md text-primary">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Tanggal</p>
                    <p className="text-text font-medium">{formatDate(typedSchedule.date)}</p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md text-primary">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Waktu</p>
                    <p className="text-text font-medium">{typedSchedule.start_time.substring(0,5)} - {typedSchedule.end_time.substring(0,5)}</p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border flex items-start gap-3">
                  <div className="bg-primary/10 p-2 rounded-md text-primary">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Slot Tersedia</p>
                    <p className="text-text font-medium">
                      <LiveSlotInfo scheduleId={typedSchedule.id} initialPlayers={typedSchedule.current_players} maxPlayers={typedSchedule.max_players} variant="slots-left" />
                    </p>
                  </div>
                </div>
                
                <div className="bg-background rounded-lg p-4 border border-border flex items-start gap-3">
                  <div className="bg-accent/10 p-2 rounded-md text-accent">
                    <span className="font-bold">Rp</span>
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Harga Tiket</p>
                    <p className="text-text font-medium">{formatCurrency(typedSchedule.price_per_person)}</p>
                  </div>
                </div>
              </div>
              
              {/* Facilities */}
              {typedSchedule.venues.facilities && typedSchedule.venues.facilities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text mb-4 border-b border-border pb-2">Fasilitas Venue</h3>
                  <div className="flex flex-wrap gap-2">
                    {typedSchedule.venues.facilities.map((fac, i) => (
                      <span key={i} className="bg-surface-hover text-text-muted px-3 py-1.5 rounded-md text-sm capitalize">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Players List */}
              <div>
                <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
                  <h3 className="text-lg font-semibold text-text">Daftar Pemain</h3>
                  <span className="bg-surface-hover text-text px-2 py-1 rounded text-xs font-medium">
                    <LiveSlotInfo scheduleId={typedSchedule.id} initialPlayers={typedSchedule.current_players} maxPlayers={typedSchedule.max_players} variant="fraction" />
                  </span>
                </div>
                
                {bookings && bookings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bookings.map((booking, i) => {
                      const profile = Array.isArray(booking.profiles) ? booking.profiles[0] : booking.profiles;
                      const name = profile?.full_name || "Member";
                      const isMe = booking.user_id === user?.id;
                      const qty = (booking as any).quantity || 1;
                      const guests: string[] = (booking as any).guest_names || [];
                      
                      return (
                        <div key={i} className={`p-3 rounded-lg border ${isMe ? 'bg-primary/5 border-primary/20' : 'bg-background border-border'}`}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={profile?.avatar_url || undefined} />
                              <AvatarFallback className="bg-surface-hover text-text text-sm">
                                {name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-text flex items-center gap-2">
                                {name}
                                {isMe && <span className="text-[10px] bg-primary text-background px-1.5 rounded uppercase tracking-wider font-bold">Anda</span>}
                                {qty > 1 && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-semibold">+{qty - 1} teman</span>}
                              </p>
                            </div>
                          </div>
                          {guests.length > 0 && (
                            <div className="mt-2 ml-[52px] space-y-1">
                              {guests.map((guestName: string, gi: number) => (
                                <p key={gi} className="text-xs text-text-muted flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full bg-surface-hover text-[10px] flex items-center justify-center font-medium">{gi + 2}</span>
                                  {guestName}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-background rounded-lg border border-border">
                    <p className="text-text-muted">Belum ada pemain yang bergabung.</p>
                    <p className="text-sm text-primary mt-1">Jadilah yang pertama!</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Sidebar / CTA */}
            <div className="w-full md:w-80 shrink-0">
              <div className="sticky top-24 bg-background p-6 rounded-xl border border-border shadow-lg">
                <h3 className="text-xl font-bold text-text mb-4">Ringkasan Pendaftaran</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Harga Tiket</span>
                    <span className="text-text font-medium">{formatCurrency(typedSchedule.price_per_person)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-muted">Status</span>
                    <span className={typedSchedule.status === 'open' ? 'text-primary' : 'text-danger'}>
                      {typedSchedule.status === 'open' ? (
                        <LiveSlotInfo scheduleId={typedSchedule.id} initialPlayers={typedSchedule.current_players} maxPlayers={typedSchedule.max_players} variant="status-text" />
                      ) : 'Penuh'}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 mt-3 flex justify-between">
                    <span className="text-text font-semibold">Total</span>
                    <span className="text-primary font-bold text-lg">{formatCurrency(typedSchedule.price_per_person)}</span>
                  </div>
                </div>
                
                <JoinButton 
                  scheduleId={typedSchedule.id} 
                  isBooked={isBooked} 
                  initialPlayers={typedSchedule.current_players}
                  maxPlayers={typedSchedule.max_players}
                  isLoggedIn={!!user}
                  pointsBalance={pointsBalance}
                  price={typedSchedule.price_per_person}
                />
                
                {!user && (
                  <p className="text-xs text-center text-text-muted mt-4">
                    Anda harus <Link href="/login" className="text-primary hover:underline">login</Link> untuk bergabung.
                  </p>
                )}
                
                {typedSchedule.venues.maps_url && (
                  <a 
                    href={typedSchedule.venues.maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 text-sm text-text hover:bg-surface-hover rounded-lg transition-colors border border-border"
                  >
                    <MapPin size={16} />
                    Buka di Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
