"use client";

import { useState } from "react";
import { deleteTestimonial } from "@/app/actions/admin-testimonials";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TestimonialDeleteButton({ id }: { id: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus testimoni ini? Ulasan tidak akan muncul lagi di halaman depan.")) return;

    setIsLoading(true);
    try {
      const result = await deleteTestimonial(id);
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
      className="text-danger border-danger/30 hover:bg-danger/10 hover:text-danger w-8 h-8 p-0"
      title="Hapus Testimoni"
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}
