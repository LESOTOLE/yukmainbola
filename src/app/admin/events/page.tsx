import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import EventFormSheet from "./EventFormSheet";
import EventStatusSelect from "./EventStatusSelect";

export const metadata = {
  title: "Kelola Event | Admin Panel",
};

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Fetch events
  const { data: events } = await supabase
    .from("events")
    .select("*, venues(name)")
    .order("event_date", { ascending: false });

  // Fetch venues for the form
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Kelola Event / Turnamen</h1>
          <p className="text-text-muted mt-2">Buat dan kelola turnamen atau acara besar lainnya.</p>
        </div>
        <EventFormSheet venues={venues || []} />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-background/50 border-b border-border text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Event</th>
                <th className="px-6 py-4 font-semibold">Venue</th>
                <th className="px-6 py-4 font-semibold">Peserta</th>
                <th className="px-6 py-4 font-semibold">Biaya</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events?.map((event) => {
                const venueName = Array.isArray(event.venues) ? event.venues[0]?.name : event.venues?.name;
                
                return (
                  <tr key={event.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{event.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatShortDate(event.event_date)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {venueName || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-background rounded-full h-2 max-w-[60px]">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${Math.min(100, (event.current_participants / event.max_participants) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{event.current_participants}/{event.max_participants}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(event.price)}
                    </td>
                    <td className="px-6 py-4">
                      <EventStatusSelect 
                        id={event.id}
                        currentStatus={event.status}
                      />
                    </td>
                  </tr>
                );
              })}
              
              {!events || events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Tidak ada event atau turnamen.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
