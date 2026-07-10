"use client";

import { useState } from "react";
import { deleteVenue } from "@/app/actions/admin-venues";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VenueDeleteButton({ id, name }: { id: string, name: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Yakin ingin menghapus lapangan "${name}"?\nTindakan ini tidak dapat dibatalkan.`)) return;

    setIsLoading(true);
    try {
      const result = await deleteVenue(id);
      if (result.success) {
        // success
      } else {
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
      title="Hapus Lapangan"
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
    </Button>
  );
}
