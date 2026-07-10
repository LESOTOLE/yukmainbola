import Image from "next/image";
import { ImageIcon } from "lucide-react";

export default function GallerySection({ gallery }: { gallery: any[] }) {
  if (!gallery || gallery.length === 0) return null;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-text">
            Momen <span className="text-primary">Terbaik</span> Kita
          </h2>
          <p className="text-text-muted text-lg">
            Intip keseruan kegiatan mabar dan turnamen yang telah kami selenggarakan.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map((item, i) => (
            <div 
              key={item.id} 
              className={`relative bg-surface rounded-2xl overflow-hidden group cursor-pointer ${
                i === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              style={{ minHeight: i === 0 ? "400px" : "200px" }}
            >
              {item.image_url ? (
                <Image 
                  src={item.image_url} 
                  alt={item.caption || "Momen mabar"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={32} className="text-text-muted opacity-50" />
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm md:text-base font-medium line-clamp-2">
                    {item.caption || "Keseruan di lapangan"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
