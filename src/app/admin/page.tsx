import { createClient } from "@/lib/supabase/server";
import { Users, Calendar, Ticket, CreditCard } from "lucide-react";
import DashboardCharts from "./DashboardCharts";
import { formatCurrency } from "@/lib/utils/format";

export const metadata = {
  title: "Admin Dashboard | Yuk Main Bola",
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Fetch basic counts
  const [{ count: usersCount }, { count: schedulesCount }, { count: eventsCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("schedules").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true })
  ]);

  // Calculate revenue from paid bookings & event participants
  const { data: bookings } = await supabase
    .from("bookings")
    .select("created_at, payment_status, schedules(price_per_person)")
    .eq("payment_status", "paid");

  const { data: eventParticipants } = await supabase
    .from("event_participants")
    .select("created_at, payment_status, events(price)")
    .eq("payment_status", "paid");

  let totalRevenue = 0;
  
  // Group revenue by month for the chart (dummy implementation for real structure)
  const monthlyRevenue: Record<string, number> = {};
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleString('id-ID', { month: 'short' });
    monthlyRevenue[monthName] = 0;
  }

  if (bookings) {
    bookings.forEach((b: any) => {
      const price = Array.isArray(b.schedules) ? b.schedules[0]?.price_per_person : b.schedules?.price_per_person;
      if (price) {
        totalRevenue += price;
        const monthName = new Date(b.created_at).toLocaleString('id-ID', { month: 'short' });
        if (monthlyRevenue[monthName] !== undefined) {
          monthlyRevenue[monthName] += price;
        }
      }
    });
  }

  if (eventParticipants) {
    eventParticipants.forEach((p: any) => {
      const price = Array.isArray(p.events) ? p.events[0]?.price : p.events?.price;
      if (price) {
        totalRevenue += price;
        const monthName = new Date(p.created_at).toLocaleString('id-ID', { month: 'short' });
        if (monthlyRevenue[monthName] !== undefined) {
          monthlyRevenue[monthName] += price;
        }
      }
    });
  }

  const chartData = Object.entries(monthlyRevenue).map(([name, total]) => ({
    name,
    total
  }));

  const stats = [
    { label: "Total Member", value: usersCount || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Pemasukan", value: formatCurrency(totalRevenue), icon: CreditCard, color: "text-primary", bg: "bg-primary/10" },
    { label: "Jadwal Mabar", value: schedulesCount || 0, icon: Calendar, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Event & Turnamen", value: eventsCount || 0, icon: Ticket, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard Overview</h1>
        <p className="text-text-muted mt-2">Selamat datang di Panel Admin Yuk Main Bola.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface border border-border rounded-xl p-6 flex items-center gap-4">
              <div className={`p-4 rounded-full ${stat.bg} ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-text-muted">{stat.label}</p>
                <p className="text-2xl font-bold text-text mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-text mb-6">Grafik Pemasukan (6 Bulan Terakhir)</h2>
          <DashboardCharts data={chartData} />
        </div>
        
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold text-text mb-6">Aktivitas Terbaru</h2>
          
          <div className="space-y-6">
            {/* Recent bookings mock/placeholder */}
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text truncate">Pembayaran Mabar Masuk</p>
                  <p className="text-xs text-text-muted mt-1">Beberapa saat yang lalu</p>
                </div>
                <div className="text-sm font-bold text-primary">
                  +Rp50.000
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
