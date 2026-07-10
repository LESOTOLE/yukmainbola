"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { cancelEventRegistration } from "@/app/actions/event";

import { useRouter } from "next/navigation";

export default function CancelEventButton({ participantId }: { participantId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Yakin ingin membatalkan pendaftaran event ini?")) return;
    
    setIsLoading(true);
    try {
      const result = await cancelEventRegistration(participantId);
      if (result.success) {
        router.refresh();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Gagal membatalkan pendaftaran.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
      className="text-danger border-danger/30 hover:bg-danger/10 hover:text-danger flex-1"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin mr-1.5" /> : <X size={16} className="mr-1.5" />}
      Batal
    </Button>
  );
}
