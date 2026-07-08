import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/landing/HeroSection";
import JadwalPreview from "@/components/landing/JadwalPreview";
import StatsSection from "@/components/landing/StatsSection";
import GaleriSection from "@/components/landing/GaleriSection";
import TestimoniSection from "@/components/landing/TestimoniSection";
import VenueSection from "@/components/landing/VenueSection";
import type { ScheduleWithVenue, TestimonialWithProfile } from "@/types/database";

// Set revalidate time for this page
export const revalidate = 60; // 60 seconds

export default async function Home() {
  const supabase = await createClient();

  // Fetch Schedules with Venue
  const { data: schedules } = await supabase
    .from("schedules")
    .select("*, venues(*)")
    .gte("date", new Date().toISOString().split("T")[0])
    .order("date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(3);

  // Fetch Stats
  const [{ count: totalMembers }, { count: totalMabar }, { count: totalVenues }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("schedules").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }),
    ]);

  // Fetch Gallery
  const { data: galleryItems } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(6);

  // Fetch Testimonials
  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*, profiles(full_name, avatar_url)")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch Venues
  const { data: venues } = await supabase
    .from("venues")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen">
      <HeroSection />
      
      <StatsSection
        totalMembers={totalMembers || 0}
        totalMabar={totalMabar || 0}
        totalVenues={totalVenues || 0}
      />

      <JadwalPreview schedules={(schedules as unknown as ScheduleWithVenue[]) || []} />
      
      <VenueSection venues={venues || []} />
      
      <GaleriSection galleryItems={galleryItems || []} />
      
      <TestimoniSection testimonials={(testimonials as unknown as TestimonialWithProfile[]) || []} />
    </main>
  );
}
