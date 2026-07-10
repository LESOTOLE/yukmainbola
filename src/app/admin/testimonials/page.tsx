import { createClient } from "@/lib/supabase/server";
import { Star } from "lucide-react";
import TestimonialDeleteButton from "./TestimonialDeleteButton";

export const metadata = {
  title: "Kelola Testimoni | Admin Panel",
};

export default async function AdminTestimonialsPage() {
  const supabase = await createClient();

  const { data: testimonials } = await supabase
    .from("testimonials")
    .select("*, profiles(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Kelola Testimoni</h1>
          <p className="text-text-muted mt-2">Hapus testimoni yang tidak pantas atau berisi spam.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials?.map((item: any) => {
          const authorName = Array.isArray(item.profiles) ? item.profiles[0]?.full_name : item.profiles?.full_name;
          
          return (
            <div key={item.id} className="bg-surface border border-border rounded-xl p-5 flex flex-col h-full relative group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-text">{authorName || "Pengguna"}</h3>
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14} 
                        className={i < item.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} 
                      />
                    ))}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <TestimonialDeleteButton id={item.id} />
                </div>
              </div>
              
              <p className="text-text-muted text-sm flex-1">"{item.content}"</p>
              
              <div className="mt-4 pt-4 border-t border-border/50 text-xs text-text-muted">
                {new Date(item.created_at).toLocaleDateString("id-ID", {
                  day: "numeric", month: "long", year: "numeric"
                })}
              </div>
            </div>
          );
        })}
        
        {!testimonials || testimonials.length === 0 ? (
          <div className="col-span-full bg-surface border border-border rounded-xl p-12 text-center">
            <Star size={48} className="mx-auto text-text-muted mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-text">Belum ada testimoni</h3>
            <p className="text-text-muted mt-1">Belum ada pemain yang memberikan ulasan.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
