import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils/format";
import Image from "next/image";
import { MapPin } from "lucide-react";
import VenueFormSheet from "./VenueFormSheet";
import VenueDeleteButton from "./VenueDeleteButton";

export const metadata = {
  title: "Kelola Lapangan | Admin Panel",
};

export default async function AdminVenuesPage() {
  const supabase = await createClient();

  const { data: venues } = await supabase
    .from("venues")
    .select("*, schedules(count), events(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Kelola Lapangan</h1>
          <p className="text-text-muted mt-2">Daftar venue untuk mabar dan turnamen.</p>
        </div>
        <VenueFormSheet />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues?.map((venue: any) => (
          <div key={venue.id} className="bg-surface border border-border rounded-xl overflow-hidden group">
            <div className="h-48 bg-background relative border-b border-border">
              {venue.image_url ? (
                <Image 
                  src={venue.image_url} 
                  alt={venue.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <MapPin size={32} className="opacity-50" />
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="text-lg font-bold text-text leading-tight">{venue.name}</h3>
                <VenueDeleteButton id={venue.id} name={venue.name} />
              </div>
              <p className="text-sm text-text-muted line-clamp-2 mb-4">{venue.address}</p>
              
              <div className="pt-4 border-t border-border flex justify-between text-xs text-text-muted">
                <span>{venue.schedules?.[0]?.count || 0} Jadwal</span>
                <span>{venue.events?.[0]?.count || 0} Event</span>
              </div>
            </div>
          </div>
        ))}
        
        {!venues || venues.length === 0 ? (
          <div className="col-span-full bg-surface border border-border rounded-xl p-12 text-center">
            <MapPin size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-text">Belum ada lapangan</h3>
            <p className="text-text-muted mt-1">Tambahkan lapangan pertama Anda menggunakan tombol di atas.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
