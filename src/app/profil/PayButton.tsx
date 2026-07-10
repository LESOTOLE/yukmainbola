"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PayButton({ token }: { token: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handlePay = () => {
    if (!token || !window.snap) return;
    
    setIsLoading(true);
    window.snap.pay(token, {
      onSuccess: function () {
        alert("Pembayaran berhasil!");
        router.refresh();
        setIsLoading(false);
      },
      onPending: function () {
        alert("Menunggu pembayaran Anda diselesaikan.");
        setIsLoading(false);
      },
      onError: function () {
        alert("Pembayaran gagal. Silakan coba lagi.");
        setIsLoading(false);
      },
      onClose: function () {
        setIsLoading(false);
      }
    });
  };

  return (
    <Button 
      size="sm"
      onClick={handlePay}
      disabled={isLoading || !token}
      className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-background font-semibold"
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin mr-2" />
      ) : (
        <CreditCard size={16} className="mr-2" />
      )}
      Bayar Sekarang
    </Button>
  );
}
