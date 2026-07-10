"use client";

import { useState } from "react";
import { addGalleryPhoto } from "@/app/actions/admin-gallery";
import { Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GalleryFormSheet() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      const result = await addGalleryPhoto(formData);
      if (result.success) {
        alert(result.message);
        setIsOpen(false);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus size={16} /> Unggah Foto
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md h-full bg-surface border-l border-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-text">Unggah Dokumentasi</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-text-muted hover:text-text rounded-md hover:bg-background"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="gallery-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="image" className="text-sm font-medium text-text">Pilih Foto <span className="text-danger">*</span></label>
                  <input 
                    type="file" 
                    id="image" 
                    name="image" 
                    required
                    accept="image/jpeg, image/png, image/webp"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <p className="text-xs text-text-muted mt-1">Format: JPG, PNG, WEBP. Maks 5MB.</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="caption" className="text-sm font-medium text-text">Deskripsi (Opsional)</label>
                  <textarea 
                    id="caption" 
                    name="caption" 
                    rows={3}
                    placeholder="Contoh: Keseruan Mabar di Gelora Bung Karno"
                    className="w-full bg-background border border-border rounded-md px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                  ></textarea>
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border bg-surface/50">
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" form="gallery-form" disabled={isLoading}>
                  {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                  Simpan Foto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
