"use client";

import { useState } from "react";
import { deleteGalleryPhoto } from "@/app/actions/admin-gallery";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GalleryDeleteButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus foto ini dari galeri?")) return;

    setIsLoading(true);
    try {
      const result = await deleteGalleryPhoto(id);
      if (!result.success) {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDelete}
      disabled={isLoading}
      className="text-danger border-danger/30 hover:bg-danger/10 hover:text-danger w-8 h-8 p-0 bg-background/80 backdrop-blur"
      title="Hapus Foto"
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}
