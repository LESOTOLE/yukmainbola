import { Star } from "lucide-react";

export default function TestimonialsSection({ testimonials }: { testimonials: any[] }) {
  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 bg-surface relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-text">
            Apa Kata <span className="text-accent">Pemain</span>?
          </h2>
          <p className="text-text-muted text-lg">
            Ulasan jujur dari komunitas yang sudah pernah mabar bareng kami.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => {
            const authorName = Array.isArray(item.profiles) ? item.profiles[0]?.full_name : item.profiles?.full_name;
            const authorAvatar = Array.isArray(item.profiles) ? item.profiles[0]?.avatar_url : item.profiles?.avatar_url;
            
            return (
              <div 
                key={item.id} 
                className="bg-background border border-border rounded-2xl p-6 shadow-xl hover:-translate-y-2 transition-transform duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      size={18} 
                      className={idx < item.rating ? "text-yellow-400 fill-yellow-400" : "text-border"} 
                    />
                  ))}
                </div>
                
                <p className="text-text leading-relaxed mb-6 italic">"{item.content}"</p>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt={authorName} className="w-full h-full object-cover" />
                    ) : (
                      authorName ? authorName.charAt(0).toUpperCase() : "U"
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-text text-sm">{authorName || "Pengguna"}</h4>
                    <p className="text-xs text-text-muted">Member Komunitas</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
