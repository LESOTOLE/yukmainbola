"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cancelBooking } from "@/app/actions/booking";
import { Loader2, XCircle } from "lucide-react";

export default function CancelButton({ bookingId }: { bookingId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan partisipasi di mabar ini?")) {
      return;
    }
    
    setIsLoading(true);
    await cancelBooking(bookingId);
    setIsLoading(false);
  };

  return (
    <Button 
      variant="destructive" 
      size="sm"
      onClick={handleCancel}
      disabled={isLoading}
      className="w-full sm:w-auto"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin mr-2" />
      ) : (
        <XCircle size={16} className="mr-2" />
      )}
      Batal Ikut
    </Button>
  );
}
