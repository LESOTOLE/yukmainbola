import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatShortDate } from "@/lib/utils/format";
import ScheduleFormSheet from "./ScheduleFormSheet";
import ScheduleStatusSelect from "./ScheduleStatusSelect";

export const metadata = {
  title: "Kelola Jadwal Mabar | Admin Panel",
};

export default async function AdminSchedulesPage() {
  const supabase = await createClient();

  // Fetch schedules
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, venues(name)")
    .order("date", { ascending: false });

  // Fetch venues for the form
  const { data: venues } = await supabase
    .from("venues")
    .select("id, name")
    .order("name", { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Kelola Jadwal Mabar</h1>
          <p className="text-text-muted mt-2">Buat jadwal baru dan atur status permainan.</p>
        </div>
        <ScheduleFormSheet venues={venues || []} />
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-text">
            <thead className="bg-background/50 border-b border-border text-text-muted uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Tanggal & Waktu</th>
                <th className="px-6 py-4 font-semibold">Venue</th>
                <th className="px-6 py-4 font-semibold">Kuota</th>
                <th className="px-6 py-4 font-semibold">Harga</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {schedules?.map((schedule) => {
                const venueName = Array.isArray(schedule.venues) ? schedule.venues[0]?.name : schedule.venues?.name;
                
                return (
                  <tr key={schedule.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{formatShortDate(schedule.date)}</p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
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
                            style={{ width: `${Math.min(100, (schedule.current_players / schedule.max_players) * 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs">{schedule.current_players}/{schedule.max_players}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {formatCurrency(schedule.price_per_person)}
                    </td>
                    <td className="px-6 py-4">
                      <ScheduleStatusSelect 
                        id={schedule.id}
                        currentStatus={schedule.status}
                      />
                    </td>
                  </tr>
                );
              })}
              
              {!schedules || schedules.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">
                    Tidak ada jadwal mabar.
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
