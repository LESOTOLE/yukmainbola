import { createClient } from "@/lib/supabase/server";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import GalleryFormSheet from "./GalleryFormSheet";
import GalleryDeleteButton from "./GalleryDeleteButton";

export const metadata = {
  title: "Kelola Galeri | Admin Panel",
};

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data: gallery } = await supabase
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Kelola Galeri</h1>
          <p className="text-text-muted mt-2">Unggah foto dokumentasi untuk ditampilkan di beranda.</p>
        </div>
        <GalleryFormSheet />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {gallery?.map((item: any) => (
          <div key={item.id} className="bg-surface border border-border rounded-xl overflow-hidden group relative">
            <div className="aspect-square bg-background relative border-b border-border">
              {item.image_url ? (
                <Image 
                  src={item.image_url} 
                  alt={item.caption || "Foto galeri"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                  <ImageIcon size={32} className="opacity-50" />
                </div>
              )}
              
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GalleryDeleteButton id={item.id} />
              </div>
            </div>
            {item.caption && (
              <div className="p-3">
                <p className="text-sm text-text-muted line-clamp-2">{item.caption}</p>
              </div>
            )}
          </div>
        ))}
        
        {!gallery || gallery.length === 0 ? (
          <div className="col-span-full bg-surface border border-border rounded-xl p-12 text-center">
            <ImageIcon size={48} className="mx-auto text-text-muted mb-4" />
            <h3 className="text-lg font-medium text-text">Belum ada foto</h3>
            <p className="text-text-muted mt-1">Unggah foto kegiatan mabar pertama Anda menggunakan tombol di atas.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
